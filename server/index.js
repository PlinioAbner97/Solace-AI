const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const path     = require('path');
require('dotenv').config();

const app    = express();
const PORT   = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'solace-dev-secret';

const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Groq free tier: 1,000 req/day, 30 RPM, no credit card
// Get key at: https://console.groq.com/keys
const CHAT_MODELS = [
  'llama-3.3-70b-versatile',
  'llama3-70b-8192',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
];
const EXTRACT_MODELS = [
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
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
      user_id INTEGER, companion TEXT NOT NULL DEFAULT 'default',
      profile TEXT DEFAULT '{}', facts TEXT DEFAULT '[]',
      mood_history TEXT DEFAULT '[]', timeline TEXT DEFAULT '[]', updated_at TEXT,
      last_checkin_date TEXT, checkin_message TEXT,
      PRIMARY KEY (user_id, companion))`);
    await client.execute(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      companion TEXT NOT NULL DEFAULT 'default',
      role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL)`);

    // ── AUTO-MIGRATION: detect old schema (no companion column) and rebuild ──
    try {
      const cols = await client.execute(`PRAGMA table_info(user_memory)`);
      const hasCompanion = cols.rows.some(r => r.name === 'companion');
      if (!hasCompanion) {
        console.log('⚠ Old schema detected — migrating user_memory table...');
        await client.execute(`ALTER TABLE user_memory RENAME TO user_memory_old`);
        await client.execute(`CREATE TABLE user_memory (
          user_id INTEGER, companion TEXT NOT NULL DEFAULT 'default',
          profile TEXT DEFAULT '{}', facts TEXT DEFAULT '[]',
          mood_history TEXT DEFAULT '[]', timeline TEXT DEFAULT '[]', updated_at TEXT,
          PRIMARY KEY (user_id, companion))`);
        await client.execute(`INSERT INTO user_memory (user_id, companion, profile, facts, mood_history, timeline, updated_at)
          SELECT user_id, 'default', profile, facts, mood_history, timeline, updated_at FROM user_memory_old`);
        await client.execute(`DROP TABLE user_memory_old`);
        console.log('✦ user_memory migrated successfully');
      }
      const msgCols = await client.execute(`PRAGMA table_info(messages)`);
      const msgHasCompanion = msgCols.rows.some(r => r.name === 'companion');
      if (!msgHasCompanion) {
        console.log('⚠ Old schema detected — migrating messages table...');
        await client.execute(`ALTER TABLE messages ADD COLUMN companion TEXT NOT NULL DEFAULT 'default'`);
        console.log('✦ messages migrated successfully');
      }
      const memCols = await client.execute(`PRAGMA table_info(user_memory)`);
      const hasCheckin = memCols.rows.some(r => r.name === 'last_checkin_date');
      if (!hasCheckin) {
        console.log('⚠ Adding daily check-in columns...');
        await client.execute(`ALTER TABLE user_memory ADD COLUMN last_checkin_date TEXT`);
        await client.execute(`ALTER TABLE user_memory ADD COLUMN checkin_message TEXT`);
        console.log('✦ check-in columns added');
      }
    } catch (migErr) {
      console.error('Migration check failed (non-fatal):', migErr.message);
    }

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
        user_id INTEGER, companion TEXT NOT NULL DEFAULT 'default',
        profile TEXT DEFAULT '{}', facts TEXT DEFAULT '[]',
        mood_history TEXT DEFAULT '[]', timeline TEXT DEFAULT '[]', updated_at TEXT,
        last_checkin_date TEXT, checkin_message TEXT,
        PRIMARY KEY (user_id, companion));
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        companion TEXT NOT NULL DEFAULT 'default',
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
    hasGroqKey: !!GROQ_KEY,
    keyPrefix: GROQ_KEY ? GROQ_KEY.slice(0,8)+'...' : 'NOT SET',
    chatModels: CHAT_MODELS,
    db: process.env.TURSO_DB_URL ? 'turso-cloud' : 'sqlite-local',
  });
});

// ── AI TEST ───────────────────────────────────────────────────────────────────
app.get('/api/test-ai', async (req, res) => {
  if (!GROQ_KEY) return res.json({ ok: false, error: 'GROQ_API_KEY not set' });
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
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
  await DB.run('INSERT INTO user_memory (user_id,companion,timeline,updated_at) VALUES (?,?,?,?)', uid, 'default', tl, today());
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
  const companion = req.query.companion || 'default';
  const row = await DB.get('SELECT * FROM user_memory WHERE user_id = ? AND companion = ?', req.user.id, companion);
  if (!row) return res.json({ profile:{}, facts:[], moodHistory:[], timeline:[] });
  res.json({
    profile:     JSON.parse(row.profile      || '{}'),
    facts:       JSON.parse(row.facts        || '[]'),
    moodHistory: JSON.parse(row.mood_history || '[]'),
    timeline:    JSON.parse(row.timeline     || '[]'),
  });
});

app.put('/api/memory', auth, async (req, res) => {
  const { profile, facts, moodHistory, timeline, companion } = req.body;
  const comp = companion || 'default';
  await DB.run(`INSERT INTO user_memory (user_id,companion,profile,facts,mood_history,timeline,updated_at) VALUES (?,?,?,?,?,?,?)
    ON CONFLICT(user_id,companion) DO UPDATE SET profile=excluded.profile,facts=excluded.facts,
    mood_history=excluded.mood_history,timeline=excluded.timeline,updated_at=excluded.updated_at`,
    req.user.id, comp, JSON.stringify(profile||{}), JSON.stringify(facts||[]),
    JSON.stringify(moodHistory||[]), JSON.stringify(timeline||[]), new Date().toISOString());
  res.json({ ok: true });
});

app.put('/api/memory/profile', auth, async (req, res) => {
  try {
    const { profile, companion } = req.body;
    const comp = companion || 'default';
    const row     = await DB.get('SELECT profile FROM user_memory WHERE user_id = ? AND companion = ?', req.user.id, comp);
    const current = row ? JSON.parse(row.profile || '{}') : {};
    const updated = { ...current, ...profile };
    await DB.run(`INSERT INTO user_memory (user_id,companion,profile,updated_at) VALUES (?,?,?,?)
      ON CONFLICT(user_id,companion) DO UPDATE SET profile=excluded.profile,updated_at=excluded.updated_at`,
      req.user.id, comp, JSON.stringify(updated), new Date().toISOString());
    res.json({ ok: true, profile: updated });
  } catch (e) {
    console.error('Save profile error:', e.message);
    res.status(500).json({ error: 'Failed to save profile: ' + e.message });
  }
});

// ── MESSAGES ──────────────────────────────────────────────────────────────────
app.get('/api/messages', auth, async (req, res) => {
  const companion = req.query.companion || 'default';
  const rows = await DB.all('SELECT role,content,created_at FROM messages WHERE user_id=? AND companion=? ORDER BY id ASC LIMIT 80', req.user.id, companion);
  res.json({ messages: rows.map(r => ({ role:r.role, content:r.content, time: new Date(r.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) })) });
});

app.post('/api/messages', auth, async (req, res) => {
  const { role, content, companion } = req.body;
  if (!role || !content) return res.status(400).json({ error: 'role and content required' });
  const comp = companion || 'default';
  await DB.run('INSERT INTO messages (user_id,companion,role,content,created_at) VALUES (?,?,?,?,?)', req.user.id, comp, role, content, new Date().toISOString());
  res.json({ ok: true });
});

app.delete('/api/messages', auth, async (req, res) => {
  const companion = req.query.companion || 'default';
  await DB.run('DELETE FROM messages WHERE user_id=? AND companion=?', req.user.id, companion);
  res.json({ ok: true });
});

// ── GROQ ────────────────────────────────────────────────────────────────────────
async function callModel(model, messages, systemPrompt, maxTokens) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
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

async function groqChat(models, messages, systemPrompt, maxTokens = 700) {
  if (!GROQ_KEY) throw new Error('GROQ_API_KEY is not set on the server.');
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
    const reply = await groqChat(CHAT_MODELS, req.body.messages, req.body.systemPrompt, 700);
    res.json({ reply });
  } catch (e) {
    console.error('Chat error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/extract-memory', auth, async (req, res) => {
  const { userText, existingFacts } = req.body;
  if (!GROQ_KEY) return res.json({ newFacts:[], mood:null, milestone:null });
  try {
    const sys = `Extract personal facts from a user message. Existing: ${JSON.stringify(existingFacts||[])}
Return ONLY valid JSON: {"newFacts":["up to 3 NEW facts"],"mood":"one word or null","milestone":"string or null"}`;
    const raw    = await groqChat(EXTRACT_MODELS, [{ role:'user', content:`User said: "${userText}"` }], sys, 200);
    const parsed = JSON.parse(raw.replace(/```json|```/g,'').trim());
    res.json(parsed);
  } catch {
    res.json({ newFacts:[], mood:null, milestone:null });
  }
});

// ── DAILY CHECK-IN — a proactive, warm message waiting for the user ───────────
// Generated once per day per companion, cached in user_memory so it doesn't
// regenerate on every page load. This is what makes the companion feel like
// it genuinely remembers and thinks about the user between visits.
app.get('/api/checkin', auth, async (req, res) => {
  try {
    const companion = req.query.companion || 'default';
    const compName   = req.query.companionName  || 'your companion';
    const compTrait  = req.query.companionTrait || 'warm and caring';
    const lang       = req.query.lang === 'es' ? 'es' : 'en';
    const todayKey   = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const row = await DB.get(
      'SELECT * FROM user_memory WHERE user_id = ? AND companion = ?',
      req.user.id, companion
    );

    // Already generated today — return the cached one, no AI call needed
    if (row?.last_checkin_date === todayKey && row?.checkin_message) {
      return res.json({ message: row.checkin_message, isNew: false });
    }

    // Find the most recent message to know how long the user's been away
    const lastMsgRow = await DB.get(
      'SELECT created_at FROM messages WHERE user_id=? AND companion=? ORDER BY id DESC LIMIT 1',
      req.user.id, companion
    );

    const facts    = row ? JSON.parse(row.facts || '[]') : [];
    const timeline = row ? JSON.parse(row.timeline || '[]') : [];
    const moods    = row ? JSON.parse(row.mood_history || '[]') : [];
    const lastMood = moods.length ? moods[moods.length - 1] : null;

    // No history yet — don't generate a check-in for a brand new companion
    if (!lastMsgRow && facts.length === 0) {
      return res.json({ message: null, isNew: false });
    }

    let daysSince = 0;
    if (lastMsgRow?.created_at) {
      daysSince = Math.floor((Date.now() - new Date(lastMsgRow.created_at).getTime()) / 86400000);
    }

    if (!GROQ_KEY) return res.json({ message: null, isNew: false });

    const sys = lang === 'es'
      ? `Eres ${compName}, un compañero de IA (${compTrait}). Escribe UN mensaje corto y cálido (2-3 oraciones) que ${compName} le enviaría al usuario ahora, como si hubiera estado pensando en él/ella.
Datos que sabes: ${facts.length ? facts.join('; ') : 'aún no sabes mucho de él/ella'}
Último estado de ánimo conocido: ${lastMood ? lastMood.mood : 'desconocido'}
Último logro o evento: ${timeline.length ? timeline[timeline.length-1].content : 'ninguno'}
Días desde la última conversación: ${daysSince}
Reglas: cálido, breve, natural, en español, sin sonar robótico, haz referencia a algo específico que sepas de él/ella si es posible. Si han pasado varios días, nota la ausencia con cariño, sin culpar. Responde solo con el mensaje, nada más.`
      : `You are ${compName}, an AI companion (${compTrait}). Write ONE short, warm message (2-3 sentences) that ${compName} would send the user right now, as if they'd been thinking about them.
Things you know: ${facts.length ? facts.join('; ') : "you don't know much about them yet"}
Last known mood: ${lastMood ? lastMood.mood : 'unknown'}
Last milestone/event: ${timeline.length ? timeline[timeline.length-1].content : 'none'}
Days since last conversation: ${daysSince}
Rules: warm, brief, natural, never robotic, reference something specific you know about them if possible. If several days have passed, gently note the gap without guilt-tripping. Reply with ONLY the message, nothing else.`;

    const message = await groqChat(CHAT_MODELS, [{ role: 'user', content: 'Generate the check-in message now.' }], sys, 150);

    // Cache it so we don't regenerate today
    await DB.run(
      `INSERT INTO user_memory (user_id,companion,last_checkin_date,checkin_message,updated_at) VALUES (?,?,?,?,?)
       ON CONFLICT(user_id,companion) DO UPDATE SET last_checkin_date=excluded.last_checkin_date, checkin_message=excluded.checkin_message`,
      req.user.id, companion, todayKey, message, new Date().toISOString()
    );

    res.json({ message, isNew: true });
  } catch (e) {
    console.error('Checkin error:', e.message);
    res.json({ message: null, isNew: false });
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
initDB().then(store => {
  DB = makeDB(store);
  app.listen(PORT, () => {
    console.log(`✦ Solace API on http://localhost:${PORT}`);
    console.log(`  DB:    ${process.env.TURSO_DB_URL ? 'Turso cloud' : 'SQLite /tmp'}`);
    console.log(`  AI key: ${GROQ_KEY ? 'set ✓' : 'MISSING ✗'}`);
    console.log(`  Models: ${CHAT_MODELS.join(', ')}`);
  });
}).catch(e => { console.error('DB init failed:', e); process.exit(1); });
