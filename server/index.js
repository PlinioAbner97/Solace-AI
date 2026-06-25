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
    await client.execute(`CREATE TABLE IF NOT EXISTS weekly_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      companion TEXT NOT NULL DEFAULT 'default', week_key TEXT NOT NULL,
      insight TEXT NOT NULL, created_at TEXT NOT NULL,
      UNIQUE(user_id, companion, week_key))`);
    await client.execute(`CREATE TABLE IF NOT EXISTS mood_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      mood TEXT NOT NULL, score INTEGER NOT NULL,
      note TEXT, date_key TEXT NOT NULL, created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS daily_missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      companion TEXT NOT NULL DEFAULT 'default', date_key TEXT NOT NULL,
      mission TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at TEXT NOT NULL,
      UNIQUE(user_id, companion, date_key))`);
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
      const hasSessions = memCols.rows.some(r => r.name === 'session_summaries');
      if (!hasSessions) {
        console.log('⚠ Adding session_summaries column...');
        await client.execute(`ALTER TABLE user_memory ADD COLUMN session_summaries TEXT DEFAULT '[]'`);
        console.log('✦ session_summaries added');
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
        session_summaries TEXT DEFAULT '[]',
        PRIMARY KEY (user_id, companion));
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        companion TEXT NOT NULL DEFAULT 'default',
        role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS weekly_insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        companion TEXT NOT NULL DEFAULT 'default', week_key TEXT NOT NULL,
        insight TEXT NOT NULL, created_at TEXT NOT NULL,
        UNIQUE(user_id, companion, week_key));
      CREATE TABLE IF NOT EXISTS mood_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        mood TEXT NOT NULL, score INTEGER NOT NULL,
        note TEXT, date_key TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS daily_missions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
        companion TEXT NOT NULL DEFAULT 'default', date_key TEXT NOT NULL,
        mission TEXT NOT NULL, completed INTEGER DEFAULT 0, created_at TEXT NOT NULL,
        UNIQUE(user_id, companion, date_key));
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
  if (!row) return res.json({ profile:{}, facts:[], moodHistory:[], timeline:[], sessionSummaries:[] });
  res.json({
    profile:          JSON.parse(row.profile           || '{}'),
    facts:            JSON.parse(row.facts             || '[]'),
    moodHistory:      JSON.parse(row.mood_history      || '[]'),
    timeline:         JSON.parse(row.timeline          || '[]'),
    sessionSummaries: JSON.parse(row.session_summaries || '[]'),
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
    const sys = `You are a memory extraction system. Analyze the user message and extract:

1. newFacts: NEW personal facts not already known. Max 3. Examples: "has a dog named Max", "works as a teacher", "lives in Miami", "is 28 years old". Only truly new information. Existing known facts: ${JSON.stringify(existingFacts||[])}

2. mood: Single word describing the user's emotional state RIGHT NOW. Examples: "anxious", "excited", "tired", "hopeful", "sad", "proud", "frustrated", "content". Null if no clear emotion.

3. milestone: A meaningful life event or achievement the user mentions. This is IMPORTANT — be generous. Count these as milestones:
- Starting or finishing something (job, project, book, relationship, course)
- A personal achievement (ran a 5k, got a promotion, moved cities, had a baby)
- A difficult moment they're processing (breakup, loss, health issue, tough decision)
- A first time doing something significant
- A goal reached or failed
Examples: "Got the promotion they've been working toward", "Finished writing their novel", "Started therapy for the first time", "Moved to a new city alone"
Null ONLY if the message is completely mundane (small talk, simple questions).

Return ONLY valid JSON, no other text:
{"newFacts":["fact1"],"mood":"word or null","milestone":"sentence or null"}`;

    const raw    = await groqChat(EXTRACT_MODELS, [{ role:'user', content:`User message: "${userText}"` }], sys, 250);
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

// ── WEEKLY RELATIONSHIP INSIGHT ───────────────────────────────────────────────
// Generated once per week per companion from the last 7 days of messages.
// Returns a structured emotional summary: themes, mood pattern, one observation,
// one reflection question. Cached in DB so it doesn't burn API calls on reload.
function getWeekKey() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

app.get('/api/insight', auth, async (req, res) => {
  try {
    const companion     = req.query.companion     || 'default';
    const companionName = req.query.companionName || 'your companion';
    const lang          = req.query.lang === 'es' ? 'es' : 'en';
    const weekKey       = getWeekKey();

    // Return cached insight if already generated this week
    const cached = await DB.get(
      'SELECT insight FROM weekly_insights WHERE user_id=? AND companion=? AND week_key=?',
      req.user.id, companion, weekKey
    );
    if (cached) return res.json({ insight: JSON.parse(cached.insight), isNew: false, weekKey });

    // Get last 7 days of user messages (user-side only — what THEY said)
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const rows  = await DB.all(
      `SELECT content, created_at FROM messages
       WHERE user_id=? AND companion=? AND role='user' AND created_at > ?
       ORDER BY id ASC LIMIT 60`,
      req.user.id, companion, since
    );

    // Need at least 3 messages to generate a meaningful insight
    if (rows.length < 3) return res.json({ insight: null, isNew: false, weekKey });

    if (!GROQ_KEY) return res.json({ insight: null, isNew: false, weekKey });

    const transcript = rows.map((r, i) => `[${i + 1}] ${r.content}`).join('\n');

    const sys = lang === 'es'
      ? `Eres ${companionName}, el compañero de IA de este usuario. Analiza sus mensajes de esta semana y genera un resumen emocional semanal.
Responde SOLO con JSON válido, sin backticks ni texto adicional:
{
  "themes": ["tema1","tema2","tema3"],
  "moodPattern": "una oración que describe el patrón emocional de la semana",
  "observation": "una cosa específica y personal que notaste sobre el usuario esta semana (max 2 oraciones, cálido y directo)",
  "question": "una pregunta de reflexión profunda pero suave que lo invita a pensar"
}
Sé cálido, específico y humano. No seas genérico ni clínico.`
      : `You are ${companionName}, this user's AI companion. Analyze their messages from this week and generate a weekly emotional summary.
Reply ONLY with valid JSON, no backticks or extra text:
{
  "themes": ["theme1","theme2","theme3"],
  "moodPattern": "one sentence describing the emotional pattern of the week",
  "observation": "one specific, personal thing you noticed about the user this week (max 2 sentences, warm and direct)",
  "question": "one deep but gentle reflection question that invites them to think"
}
Be warm, specific, and human. Never generic or clinical.`;

    const raw     = await groqChat(CHAT_MODELS,
      [{ role: 'user', content: `Messages from this week:\n${transcript}` }],
      sys, 350);
    const insight = JSON.parse(raw.replace(/```json|```/g, '').trim());

    // Cache it for the rest of the week
    await DB.run(
      `INSERT INTO weekly_insights (user_id,companion,week_key,insight,created_at)
       VALUES (?,?,?,?,?)
       ON CONFLICT(user_id,companion,week_key) DO UPDATE SET insight=excluded.insight`,
      req.user.id, companion, weekKey, JSON.stringify(insight), new Date().toISOString()
    );

    res.json({ insight, isNew: true, weekKey });
  } catch (e) {
    console.error('Insight error:', e.message);
    res.json({ insight: null, isNew: false });
  }
});

// ── MOOD LOGGING ─────────────────────────────────────────────────────────────
// POST /api/mood — save today's mood entry (one per day, upserts)
app.post('/api/mood', auth, async (req, res) => {
  try {
    const { mood, score, note } = req.body;
    if (!mood || score === undefined) return res.status(400).json({ error: 'mood and score required' });
    const dateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Check if already logged today — update if so
    const existing = await DB.get(
      'SELECT id FROM mood_logs WHERE user_id=? AND date_key=?',
      req.user.id, dateKey
    );
    if (existing) {
      await DB.run(
        'UPDATE mood_logs SET mood=?, score=?, note=?, created_at=? WHERE user_id=? AND date_key=?',
        mood, score, note || null, new Date().toISOString(), req.user.id, dateKey
      );
    } else {
      await DB.run(
        'INSERT INTO mood_logs (user_id, mood, score, note, date_key, created_at) VALUES (?,?,?,?,?,?)',
        req.user.id, mood, score, note || null, dateKey, new Date().toISOString()
      );
    }
    res.json({ ok: true, dateKey });
  } catch (e) {
    console.error('Mood log error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/mood/streak — returns streak count, today's mood if already logged, recent 14-day history
app.get('/api/mood/streak', auth, async (req, res) => {
  try {
    const rows = await DB.all(
      'SELECT mood, score, date_key FROM mood_logs WHERE user_id=? ORDER BY date_key DESC LIMIT 30',
      req.user.id
    );

    if (!rows.length) return res.json({ streak: 0, todayMood: null, history: [] });

    const today = new Date().toISOString().slice(0, 10);
    const todayMood = rows.find(r => r.date_key === today) || null;

    // Calculate streak: consecutive days ending today (or yesterday if today not logged yet)
    let streak = 0;
    let check  = new Date();
    if (!todayMood) check.setDate(check.getDate() - 1); // allow yesterday to still count
    for (let i = 0; i < 30; i++) {
      const key = check.toISOString().slice(0, 10);
      if (rows.find(r => r.date_key === key)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      streak,
      todayMood: todayMood ? { mood: todayMood.mood, score: todayMood.score } : null,
      history: rows.slice(0, 14).reverse() // oldest→newest for chart
    });
  } catch (e) {
    console.error('Streak error:', e.message);
    res.json({ streak: 0, todayMood: null, history: [] });
  }
});

// ── SESSION SUMMARIZATION ─────────────────────────────────────────────────────
// Called when user leaves the chat view after a meaningful conversation.
// Generates a 2-3 sentence memory of what was discussed and appends it to
// session_summaries (last 5 kept). These get injected into future prompts
// so the companion remembers the arc of recent conversations, not just facts.
app.post('/api/summarize-session', auth, async (req, res) => {
  try {
    const { companion, companionName, lang, messages: sessionMsgs } = req.body;
    const comp = companion || 'default';

    // Need at least 4 messages to be worth summarizing
    if (!sessionMsgs || sessionMsgs.length < 4) return res.json({ ok: true, skipped: true });
    if (!GROQ_KEY) return res.json({ ok: true, skipped: true });

    // Build a compact transcript of just this session
    const transcript = sessionMsgs
      .slice(-20) // last 20 messages max
      .map(m => `${m.role === 'user' ? 'User' : companionName}: ${m.content}`)
      .join('\n');

    const sys = lang === 'es'
      ? `Eres el sistema de memoria de ${companionName}. Resume esta conversación en 2-3 oraciones breves desde la perspectiva del compañero. 
Captura: de qué habló el usuario, cómo se sentía, y cualquier cosa importante que mencionó.
Escribe en primera persona del compañero. Ej: "Plinio habló sobre su estrés laboral y mencionó que está pensando en cambiar de trabajo. Se sentía ansioso pero esperanzado."
Responde SOLO con el resumen, sin comillas ni texto extra.`
      : `You are ${companionName}'s memory system. Summarize this conversation in 2-3 short sentences from the companion's perspective.
Capture: what the user talked about, how they felt, and anything important they mentioned.
Write in first person as the companion. E.g. "Alex talked about job stress and mentioned thinking about changing careers. They seemed anxious but hopeful."
Reply with ONLY the summary, no quotes or extra text.`;

    const summary = await groqChat(
      EXTRACT_MODELS,
      [{ role: 'user', content: `Conversation:\n${transcript}` }],
      sys, 150
    );

    if (!summary?.trim()) return res.json({ ok: true, skipped: true });

    // Load existing summaries, append, keep last 5
    const row = await DB.get(
      'SELECT session_summaries FROM user_memory WHERE user_id=? AND companion=?',
      req.user.id, comp
    );
    const existing = JSON.parse(row?.session_summaries || '[]');
    const dateStr  = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const updated  = [...existing, { date: dateStr, summary: summary.trim() }].slice(-5);

    await DB.run(
      `INSERT INTO user_memory (user_id, companion, session_summaries, updated_at) VALUES (?,?,?,?)
       ON CONFLICT(user_id, companion) DO UPDATE SET session_summaries=excluded.session_summaries, updated_at=excluded.updated_at`,
      req.user.id, comp, JSON.stringify(updated), new Date().toISOString()
    );

    res.json({ ok: true, summary: summary.trim() });
  } catch (e) {
    console.error('Session summary error:', e.message);
    res.json({ ok: true, skipped: true }); // non-fatal — never block the user
  }
});

// ── JOURNAL ENTRY ─────────────────────────────────────────────────────────────
// POST /api/journal/add — append a milestone entry to the timeline
// Used automatically for: streak milestones, level-ups, mission streaks, etc.
app.post('/api/journal/add', auth, async (req, res) => {
  try {
    const { companion, content, detail, icon } = req.body;
    const comp = companion || 'default';
    const row = await DB.get('SELECT timeline FROM user_memory WHERE user_id=? AND companion=?', req.user.id, comp);
    const timeline = JSON.parse(row?.timeline || '[]');

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const entry = { date: dateStr, content, detail: detail || null, icon: icon || '✦', auto: true };

    // Avoid duplicates — don't add the same content within 7 days
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const isDuplicate = timeline.some(e =>
      e.content === content &&
      new Date(e.date).getTime() > sevenDaysAgo
    );
    if (isDuplicate) return res.json({ ok: true, skipped: true });

    const updated = [...timeline, entry].slice(-60);
    await DB.run(
      `INSERT INTO user_memory (user_id,companion,timeline,updated_at) VALUES (?,?,?,?)
       ON CONFLICT(user_id,companion) DO UPDATE SET timeline=excluded.timeline, updated_at=excluded.updated_at`,
      req.user.id, comp, JSON.stringify(updated), new Date().toISOString()
    );
    res.json({ ok: true, entry });
  } catch (e) {
    console.error('Journal add error:', e.message);
    res.json({ ok: false });
  }
});

// ── DAILY MISSION ─────────────────────────────────────────────────────────────
// GET  /api/mission — returns today's mission (generates if needed, caches all day)
// POST /api/mission/complete — marks today's mission as done
app.get('/api/mission', auth, async (req, res) => {
  try {
    const companion     = req.query.companion     || 'default';
    const companionName = req.query.companionName || 'your companion';
    const lang          = req.query.lang === 'es' ? 'es' : 'en';
    const dateKey       = new Date().toISOString().slice(0, 10);

    // Return cached mission if already generated today
    const cached = await DB.get(
      'SELECT mission, completed FROM daily_missions WHERE user_id=? AND companion=? AND date_key=?',
      req.user.id, companion, dateKey
    );
    if (cached) return res.json({
      mission: cached.mission,
      completed: !!cached.completed,
      isNew: false,
      dateKey
    });

    // Need memory context to make it personal
    const row   = await DB.get('SELECT * FROM user_memory WHERE user_id=? AND companion=?', req.user.id, companion);
    const facts = row ? JSON.parse(row.facts || '[]') : [];
    const moods = row ? JSON.parse(row.mood_history || '[]') : [];
    const summaries = row ? JSON.parse(row.session_summaries || '[]') : [];
    const lastMood  = moods.length ? moods[moods.length - 1] : null;
    const lastSess  = summaries.length ? summaries[summaries.length - 1] : null;

    if (!GROQ_KEY) return res.json({ mission: null, completed: false, isNew: false });

    const day = new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday: 'long' });

    const sys = lang === 'es'
      ? `Eres ${companionName}. Genera UNA misión diaria breve y personal para ${req.user.name || 'tu usuario'} para hoy (${day}).
La misión debe:
- Ser completable en 2-5 minutos dentro de la app (chatear, reflexionar, responder algo)
- Sentirse personal — referencia algo que sabes de ellos si puedes
- Tener un verbo de acción claro
- Ser breve: máximo 25 palabras
Contexto: ${facts.length ? `sabes que ${facts.slice(0,3).join(', ')}` : 'aún los estás conociendo'}
${lastMood ? `Último ánimo conocido: ${lastMood.mood}` : ''}
${lastSess ? `Última sesión: ${lastSess.summary}` : ''}
Responde SOLO con la misión, sin comillas ni explicaciones. Ejemplo: "Cuéntame una pequeña victoria de esta semana, por pequeña que sea."`
      : `You are ${companionName}. Generate ONE short, personal daily mission for ${req.user.name || 'your user'} for today (${day}).
The mission must:
- Be completable in 2-5 minutes inside the app (chatting, reflecting, answering something)
- Feel personal — reference something you know about them if possible
- Have a clear action verb
- Be brief: max 25 words
Context: ${facts.length ? `you know that ${facts.slice(0,3).join(', ')}` : "you're still getting to know them"}
${lastMood ? `Last known mood: ${lastMood.mood}` : ''}
${lastSess ? `Last session: ${lastSess.summary}` : ''}
Reply with ONLY the mission, no quotes or explanation. Example: "Tell me one small win from this week, however small it feels."`;

    const mission = await groqChat(
      EXTRACT_MODELS,
      [{ role: 'user', content: 'Generate the daily mission now.' }],
      sys, 80
    );

    if (!mission?.trim()) return res.json({ mission: null, completed: false, isNew: false });

    const clean = mission.trim().replace(/^["']|["']$/g, '');

    await DB.run(
      `INSERT INTO daily_missions (user_id, companion, date_key, mission, completed, created_at)
       VALUES (?,?,?,?,0,?)
       ON CONFLICT(user_id, companion, date_key) DO NOTHING`,
      req.user.id, companion, dateKey, clean, new Date().toISOString()
    );

    res.json({ mission: clean, completed: false, isNew: true, dateKey });
  } catch (e) {
    console.error('Mission error:', e.message);
    res.json({ mission: null, completed: false, isNew: false });
  }
});

app.post('/api/mission/complete', auth, async (req, res) => {
  try {
    const { companion } = req.body;
    const comp    = companion || 'default';
    const dateKey = new Date().toISOString().slice(0, 10);
    await DB.run(
      'UPDATE daily_missions SET completed=1 WHERE user_id=? AND companion=? AND date_key=?',
      req.user.id, comp, dateKey
    );
    res.json({ ok: true });
  } catch (e) {
    res.json({ ok: false });
  }
});

// ── MOOD HISTORY — 30-day calendar + weekly averages + AI monthly summary ────
app.get('/api/mood/history', auth, async (req, res) => {
  try {
    const lang = req.query.lang === 'es' ? 'es' : 'en';

    // Get last 35 days of mood logs
    const since = new Date(Date.now() - 35 * 86400000).toISOString().slice(0,10);
    const rows  = await DB.all(
      'SELECT mood, score, date_key FROM mood_logs WHERE user_id=? AND date_key >= ? ORDER BY date_key ASC',
      req.user.id, since
    );

    if (!rows.length) return res.json({ days:[], weeklyAvgs:[], monthlySummary:null });

    // Build date map
    const byDate = {};
    rows.forEach(r => { byDate[r.date_key] = { mood: r.mood, score: Number(r.score) }; });

    // Build 30-day array
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d   = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().slice(0,10);
      const day = d.getDate();
      const dow = d.toLocaleDateString('en-US',{weekday:'short'});
      days.push({ date: key, day, dow, ...(byDate[key] || { mood: null, score: null }) });
    }

    // Weekly averages (last 4 weeks)
    const weeklyAvgs = [];
    for (let w = 3; w >= 0; w--) {
      const weekDays = days.slice(w * 7, w * 7 + 7);
      const logged   = weekDays.filter(d => d.score !== null);
      const avg      = logged.length ? (logged.reduce((s,d) => s+d.score,0) / logged.length) : null;
      const weekStart = weekDays[0]?.date;
      weeklyAvgs.push({ weekStart, avg: avg ? Math.round(avg * 10) / 10 : null, logged: logged.length });
    }

    // AI monthly summary (only if enough data — at least 7 entries)
    let monthlySummary = null;
    if (rows.length >= 7 && GROQ_KEY) {
      try {
        const avgScore = rows.reduce((s,r) => s+r.score, 0) / rows.length;
        const moodCounts = {};
        rows.forEach(r => { moodCounts[r.mood] = (moodCounts[r.mood]||0)+1; });
        const topMood = Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0]?.[0];

        const sys = lang === 'es'
          ? `Genera un resumen emocional breve y cálido (2-3 oraciones) de los últimos 30 días basado en estos datos de bienestar.
Puntuación promedio: ${avgScore.toFixed(1)}/5
Estado de ánimo más frecuente: ${topMood}
Total de días registrados: ${rows.length}
Escribe desde la perspectiva de un amigo que te conoce. Sé honesto pero alentador. Sin listas. Solo prosa cálida.`
          : `Generate a brief, warm emotional summary (2-3 sentences) of the last 30 days based on this wellbeing data.
Average score: ${avgScore.toFixed(1)}/5
Most frequent mood: ${topMood}
Total days logged: ${rows.length}
Write as a caring friend who knows them. Be honest but encouraging. No lists. Just warm prose.`;

        monthlySummary = await groqChat(
          EXTRACT_MODELS,
          [{role:'user', content:'Generate the monthly emotional summary now.'}],
          sys, 120
        );
      } catch (e) {
        console.warn('Monthly summary error:', e.message);
      }
    }

    res.json({ days, weeklyAvgs, monthlySummary });
  } catch (e) {
    console.error('Mood history error:', e.message);
    res.json({ days:[], weeklyAvgs:[], monthlySummary:null });
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
