const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const path     = require('path');
require('dotenv').config();

const app    = express();
const PORT   = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'solace-dev-secret';

const OPENROUTER_KEY  = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL  = 'https://openrouter.ai/api/v1/chat/completions';

// Multiple free models — tried in order, falls back if one is rate-limited
const CHAT_MODELS = [
  'deepseek/deepseek-r1-0528:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'microsoft/phi-4-reasoning-plus:free',
  'qwen/qwen3-14b:free',
];
const EXTRACT_MODELS = [
  'mistralai/mistral-small-3.1-24b-instruct:free',
  'qwen/qwen3-14b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
];

// ── DATABASE — uses Turso (free cloud SQLite) if env vars set, else local file ─
let db;
async function initDB() {
  if (process.env.TURSO_DB_URL && process.env.TURSO_DB_TOKEN) {
    // Cloud SQLite via Turso — persists across all redeploys, free tier = 500MB
    const { createClient } = require('@libsql/client');
    const client = createClient({
      url:       process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_DB_TOKEN,
    });
    await client.execute(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS user_memory (
      user_id INTEGER PRIMARY KEY, profile TEXT DEFAULT '{}',
      facts TEXT DEFAULT '[]', mood_history TEXT DEFAULT '[]',
      timeline TEXT DEFAULT '[]', updated_at TEXT)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL)`);
    console.log('✦ Using Turso cloud database');
    return { type: 'turso', client };
  } else {
    // Local SQLite — fine for dev, use /tmp on Render (resets on redeploy)
    const Database = require('better-sqlite3');
    const DB_PATH  = process.env.DB_PATH || '/tmp/solace.db';
    const client   = new Database(DB_PATH);
    client.pragma('journal_mode = WAL');
    client.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS user_memory (
        user_id INTEGER PRIMARY KEY, profile TEXT DEFAULT '{}',
        facts TEXT DEFAULT '[]', mood_history TEXT DEFAULT '[]',
        timeline TEXT DEFAULT '[]', updated_at TEXT);
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL);
    `);
    console.log('✦ Using local SQLite:', DB_PATH);
    return { type: 'sqlite', client };
  }
}

// ── DB QUERY WRAPPER — same API for both Turso and SQLite ─────────────────────
function makeDB(store) {
  if (store.type === 'turso') {
    const c = store.client;
    return {
      async get(sql, ...args)    { const r = await c.execute({sql, args: args.flat()}); return r.rows[0] || null; },
      async all(sql, ...args)    { const r = await c.execute({sql, args: args.flat()}); return r.rows; },
      async run(sql, ...args)    { return c.execute({sql, args: args.flat()}); },
      async lastId(sql, ...args) { const r = await c.execute({sql, args: args.flat()}); return Number(r.lastInsertRowid); },
    };
  } else {
    const c = store.client;
    return {
      async get(sql, ...args)    { return c.prepare(sql).get(...args.flat()) || null; },
      async all(sql, ...args)    { return c.prepare(sql).all(...args.flat()); },
      async run(sql, ...args)    { return c.prepare(sql).run(...args.flat()); },
      async lastId(sql, ...args) { return c.prepare(sql).run(...args.flat()).lastInsertRowid; },
    };
  }
}

let DB;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin.includes('localhost') || origin.includes('onrender.com')) return cb(null, true);
    const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim()).filter(Boolean);
    if (allowed.some(o => origin.startsWith(o))) return cb(null, true);
    cb(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '4mb' }));

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};

const today = () => new Date().toLocaleDateString('en-US', { month:'long', year:'numeric', day:'numeric' });

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const row = await DB.get('SELECT COUNT(*) as c FROM users');
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    users: Number(row?.c || 0),
    hasOpenRouterKey: !!OPENROUTER_KEY,
    keyPrefix: OPENROUTER_KEY ? OPENROUTER_KEY.slice(0,12)+'...' : 'NOT SET',
    chatModels: CHAT_MODELS,
    db: process.env.TURSO_DB_URL ? 'turso-cloud' : 'sqlite-local',
  });
});

// ── AI TEST ───────────────────────────────────────────────────────────────────
app.get('/api/test-ai', async (req, res) => {
  if (!OPENROUTER_KEY) return res.json({ ok: false, error: 'OPENROUTER_API_KEY not set' });
  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer':  'https://solace-ai-1-atkq.onrender.com',
        'X-Title':       'Solace AI',
      },
      body: JSON.stringify({
        model: CHAT_MODELS[0], max_tokens: 30,
        messages: [{ role: 'user', content: 'Reply with exactly: AI is working!' }],
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (text) return res.json({ ok: true, reply: text, model: CHAT_MODELS[0] });
    res.json({ ok: false, raw: data });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (await DB.get('SELECT id FROM users WHERE email = ?', email))
    return res.status(409).json({ error: 'An account with this email already exists.' });
  const hash = await bcrypt.hash(password, 10);
  const uid  = await DB.lastId('INSERT INTO users (name,email,password_hash,created_at) VALUES (?,?,?,?)', name, email, hash, today());
  const tl   = JSON.stringify([{ date: today(), content: `${name} began their journey with Solace`, detail: 'First day' }]);
  await DB.run('INSERT INTO user_memory (user_id,timeline,updated_at) VALUES (?,?,?)', uid, tl, today());
  const token = jwt.sign({ id: uid, email, name }, SECRET, { expiresIn: '30d' });
  console.log('Signup:', email);
  res.json({ token, user: { id: uid, name, email, createdAt: today() } });
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required.' });
  const user = await DB.get('SELECT * FROM users WHERE email = ?', email);
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Incorrect email or password.' });
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '30d' });
  console.log('Signin:', email);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at } });
});

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await DB.get('SELECT id,name,email,created_at FROM users WHERE id = ?', req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user: { ...user, createdAt: user.created_at } });
});

// ── MEMORY ────────────────────────────────────────────────────────────────────
app.get('/api/memory', auth, async (req, res) => {
  const row = await DB.get('SELECT * FROM user_memory WHERE user_id = ?', req.user.id);
  if (!row) return res.json({ profile:{}, facts:[], moodHistory:[], timeline:[] });
  res.json({
    profile:     JSON.parse(row.profile      || '{}'),
    facts:       JSON.parse(row.facts        || '[]'),
    moodHistory: JSON.parse(row.mood_history || '[]'),
    timeline:    JSON.parse(row.timeline     || '[]'),
  });
});

app.put('/api/memory', auth, async (req, res) => {
  const { profile, facts, moodHistory, timeline } = req.body;
  await DB.run(`INSERT INTO user_memory (user_id,profile,facts,mood_history,timeline,updated_at) VALUES (?,?,?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET profile=excluded.profile,facts=excluded.facts,
    mood_history=excluded.mood_history,timeline=excluded.timeline,updated_at=excluded.updated_at`,
    req.user.id, JSON.stringify(profile||{}), JSON.stringify(facts||[]),
    JSON.stringify(moodHistory||[]), JSON.stringify(timeline||[]), new Date().toISOString());
  res.json({ ok: true });
});

app.put('/api/memory/profile', auth, async (req, res) => {
  const { profile } = req.body;
  const row     = await DB.get('SELECT profile FROM user_memory WHERE user_id = ?', req.user.id);
  const current = row ? JSON.parse(row.profile || '{}') : {};
  const updated = { ...current, ...profile };
  await DB.run('UPDATE user_memory SET profile=?,updated_at=? WHERE user_id=?',
    JSON.stringify(updated), new Date().toISOString(), req.user.id);
  res.json({ ok: true, profile: updated });
});

// ── MESSAGES ──────────────────────────────────────────────────────────────────
app.get('/api/messages', auth, async (req, res) => {
  const rows = await DB.all('SELECT role,content,created_at FROM messages WHERE user_id=? ORDER BY id ASC LIMIT 80', req.user.id);
  res.json({ messages: rows.map(r => ({ role:r.role, content:r.content, time: new Date(r.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) })) });
});

app.post('/api/messages', auth, async (req, res) => {
  const { role, content } = req.body;
  if (!role || !content) return res.status(400).json({ error: 'role and content required' });
  await DB.run('INSERT INTO messages (user_id,role,content,created_at) VALUES (?,?,?,?)', req.user.id, role, content, new Date().toISOString());
  res.json({ ok: true });
});

app.delete('/api/messages', auth, async (req, res) => {
  await DB.run('DELETE FROM messages WHERE user_id=?', req.user.id);
  res.json({ ok: true });
});

// ── OPENROUTER ────────────────────────────────────────────────────────────────
async function callModel(model, messages, systemPrompt, maxTokens) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer':  'https://solace-ai-1-atkq.onrender.com',
      'X-Title':       'Solace AI',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
  const data = await response.json();
  if (data.error) {
    const code = data.error.code || 0;
    // 429 = rate limited, 404 = model gone — both are retryable with next model
    if (code === 429 || code === 404 || code === 503) {
      throw new Error(`RETRY:${data.error.message}`);
    }
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from model');
  return text.trim();
}

async function openRouterChat(models, messages, systemPrompt, maxTokens = 700) {
  if (!OPENROUTER_KEY) throw new Error('OPENROUTER_API_KEY is not set on the server.');
  const modelList = Array.isArray(models) ? models : [models];
  let lastError = '';
  for (const model of modelList) {
    try {
      console.log('Trying model:', model);
      const text = await callModel(model, messages, systemPrompt, maxTokens);
      console.log('Success with model:', model);
      return text;
    } catch (e) {
      lastError = e.message;
      if (e.message.startsWith('RETRY:')) {
        console.warn(`Model ${model} rate-limited/unavailable, trying next...`);
        continue; // try next model
      }
      throw e; // non-retryable error
    }
  }
  throw new Error(`All models unavailable. Last error: ${lastError.replace('RETRY:','')}`);
}

app.post('/api/chat', auth, async (req, res) => {
  try {
    const reply = await openRouterChat(CHAT_MODELS, req.body.messages, req.body.systemPrompt, 700);
    res.json({ reply });
  } catch (e) {
    console.error('Chat error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/extract-memory', auth, async (req, res) => {
  const { userText, existingFacts } = req.body;
  if (!OPENROUTER_KEY) return res.json({ newFacts:[], mood:null, milestone:null });
  try {
    const sys = `Extract personal facts from a user message. Existing: ${JSON.stringify(existingFacts||[])}
Return ONLY valid JSON: {"newFacts":["up to 3 NEW facts"],"mood":"one word or null","milestone":"string or null"}`;
    const raw    = await openRouterChat(EXTRACT_MODELS, [{ role:'user', content:`User said: "${userText}"` }], sys, 200);
    const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());
    res.json(parsed);
  } catch {
    res.json({ newFacts:[], mood:null, milestone:null });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
initDB().then(store => {
  DB = makeDB(store);
  app.listen(PORT, () => {
    console.log(`✦ Solace API on http://localhost:${PORT}`);
    console.log(`  DB:    ${process.env.TURSO_DB_URL ? 'Turso cloud' : 'SQLite /tmp'}`);
    console.log(`  AI key: ${OPENROUTER_KEY ? 'set ✓' : 'MISSING ✗'}`);
    console.log(`  Models: ${CHAT_MODELS.join(', ')}`);
  });
}).catch(e => { console.error('DB init failed:', e); process.exit(1); });
