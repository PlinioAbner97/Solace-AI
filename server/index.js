const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Database = require('better-sqlite3');
// Using built-in fetch (Node 20+)
const path     = require('path');
require('dotenv').config();

const app    = express();
const PORT   = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'solace-dev-secret-change-in-prod';

// ── OpenRouter — free tier, no credit card, works immediately
// Free models: google/gemini-2.0-flash-exp:free, meta-llama/llama-3.3-70b-instruct:free, deepseek/deepseek-r1:free
const OPENROUTER_KEY   = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL   = 'https://openrouter.ai/api/v1/chat/completions';
const CHAT_MODEL       = process.env.CHAT_MODEL       || 'google/gemini-2.0-flash-exp:free';
const EXTRACT_MODEL    = process.env.EXTRACT_MODEL    || 'meta-llama/llama-3.3-70b-instruct:free';

// ── DATABASE ──────────────────────────────────────────────────────────────────
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'solace.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_memory (
    user_id      INTEGER PRIMARY KEY,
    profile      TEXT DEFAULT '{}',
    facts        TEXT DEFAULT '[]',
    mood_history TEXT DEFAULT '[]',
    timeline     TEXT DEFAULT '[]',
    updated_at   TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    role       TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    created_at TEXT    NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile, curl, server-to-server)
    if (!origin) return cb(null, true);
    // Allow localhost (dev) and all onrender.com subdomains
    if (
      origin.includes('localhost') ||
      origin.includes('onrender.com') ||
      origin === (process.env.FRONTEND_URL || '')
    ) return cb(null, true);
    // Allow any origin in comma-separated FRONTEND_URL list
    const allowed = (process.env.FRONTEND_URL || '').split(',').map(s => s.trim());
    if (allowed.some(o => origin.startsWith(o))) return cb(null, true);
    // Block everything else
    console.warn('CORS blocked:', origin);
    cb(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '4mb' }));

// Frontend is served separately as a static site on Render

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};

const today = () =>
  new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' });

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email))
    return res.status(409).json({ error: 'An account with this email already exists.' });

  const hash   = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password_hash, created_at) VALUES (?,?,?,?)').run(name, email, hash, today());
  const uid    = result.lastInsertRowid;

  const timeline = JSON.stringify([{ date: today(), content: `${name} began their journey with Solace`, detail: 'First day' }]);
  db.prepare('INSERT INTO user_memory (user_id, timeline, updated_at) VALUES (?,?,?)').run(uid, timeline, today());

  const token = jwt.sign({ id: uid, email, name }, SECRET, { expiresIn: '30d' });
  const user  = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(uid);
  res.json({ token, user: { ...user, createdAt: user.created_at } });
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required.' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Incorrect email or password.' });
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user: { ...user, createdAt: user.created_at } });
});

// ── MEMORY ────────────────────────────────────────────────────────────────────
app.get('/api/memory', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM user_memory WHERE user_id = ?').get(req.user.id);
  if (!row) return res.json({ profile: {}, facts: [], moodHistory: [], timeline: [] });
  res.json({
    profile:     JSON.parse(row.profile      || '{}'),
    facts:       JSON.parse(row.facts        || '[]'),
    moodHistory: JSON.parse(row.mood_history || '[]'),
    timeline:    JSON.parse(row.timeline     || '[]'),
  });
});

app.put('/api/memory', authMiddleware, (req, res) => {
  const { profile, facts, moodHistory, timeline } = req.body;
  db.prepare(`
    INSERT INTO user_memory (user_id, profile, facts, mood_history, timeline, updated_at)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET
      profile=excluded.profile, facts=excluded.facts,
      mood_history=excluded.mood_history, timeline=excluded.timeline,
      updated_at=excluded.updated_at
  `).run(req.user.id,
    JSON.stringify(profile||{}), JSON.stringify(facts||[]),
    JSON.stringify(moodHistory||[]), JSON.stringify(timeline||[]),
    new Date().toISOString());
  res.json({ ok: true });
});

app.put('/api/memory/profile', authMiddleware, (req, res) => {
  const { profile } = req.body;
  const row     = db.prepare('SELECT profile FROM user_memory WHERE user_id = ?').get(req.user.id);
  const current = row ? JSON.parse(row.profile || '{}') : {};
  const updated = { ...current, ...profile };
  db.prepare('UPDATE user_memory SET profile=?, updated_at=? WHERE user_id=?')
    .run(JSON.stringify(updated), new Date().toISOString(), req.user.id);
  res.json({ ok: true, profile: updated });
});

// ── MESSAGES ──────────────────────────────────────────────────────────────────
app.get('/api/messages', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT role, content, created_at FROM messages WHERE user_id=? ORDER BY id ASC LIMIT 80').all(req.user.id);
  res.json({
    messages: rows.map(r => ({
      role: r.role, content: r.content,
      time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  });
});

app.post('/api/messages', authMiddleware, (req, res) => {
  const { role, content } = req.body;
  if (!role || !content) return res.status(400).json({ error: 'role and content required' });
  db.prepare('INSERT INTO messages (user_id, role, content, created_at) VALUES (?,?,?,?)').run(req.user.id, role, content, new Date().toISOString());
  db.prepare('DELETE FROM messages WHERE user_id=? AND id NOT IN (SELECT id FROM messages WHERE user_id=? ORDER BY id DESC LIMIT 100)').run(req.user.id, req.user.id);
  res.json({ ok: true });
});

app.delete('/api/messages', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM messages WHERE user_id=?').run(req.user.id);
  res.json({ ok: true });
});

// ── OPENROUTER HELPER ─────────────────────────────────────────────────────────
async function openRouterChat(model, messages, systemPrompt, maxTokens = 700) {
  if (!OPENROUTER_KEY) throw new Error('OPENROUTER_API_KEY not set on server.');

  const body = {
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  };

  const response = await fetch(OPENROUTER_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer':  process.env.FRONTEND_URL || 'http://localhost:3000',
      'X-Title':       'Solace AI',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log('OpenRouter status:', response.status);
  console.log('OpenRouter response:', JSON.stringify(data).slice(0, 500));
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from AI - full response: ' + JSON.stringify(data).slice(0, 300));
  return text.trim();
}

// ── CHAT ──────────────────────────────────────────────────────────────────────
app.post('/api/chat', authMiddleware, async (req, res) => {
  const { messages, systemPrompt } = req.body;
  try {
    const reply = await openRouterChat(CHAT_MODEL, messages, systemPrompt, 700);
    res.json({ reply });
  } catch (e) {
    console.error('Chat error full:', e);
    res.status(500).json({ error: e.message || 'AI service error. Please try again.' });
  }
});

// ── MEMORY EXTRACTION ─────────────────────────────────────────────────────────
app.post('/api/extract-memory', authMiddleware, async (req, res) => {
  const { userText, existingFacts } = req.body;
  if (!OPENROUTER_KEY) return res.json({ newFacts: [], mood: null, milestone: null });

  const systemPrompt = `You extract key personal facts from a user message for a long-term memory system.
Existing facts: ${JSON.stringify(existingFacts || [])}
Return ONLY valid JSON, no markdown, no explanation:
{"newFacts": ["up to 3 NEW facts not already saved"], "mood": "one word or null", "milestone": "brief milestone string or null"}
Facts must be personal and useful for a companion. Only include genuinely NEW facts.`;

  try {
    const raw    = await openRouterChat(EXTRACT_MODEL, [{ role: 'user', content: `User said: "${userText}"` }], systemPrompt, 300);
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    res.json(parsed);
  } catch {
    res.json({ newFacts: [], mood: null, milestone: null });
  }
});


app.listen(PORT, () => console.log(`✦ Solace API running on http://localhost:${PORT}`));
