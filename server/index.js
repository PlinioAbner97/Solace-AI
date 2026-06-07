const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Database = require('better-sqlite3');
const fetch    = require('node-fetch');
const path     = require('path');
require('dotenv').config();

const app    = express();
const PORT   = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'solace-dev-secret-change-in-prod';
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// ── Gemini model — gemini-1.5-flash is FREE with generous limits:
//    1,500 requests/day · 1,000,000 tokens/min · no charge
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=`;

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
    user_id     INTEGER PRIMARY KEY,
    profile     TEXT DEFAULT '{}',
    facts       TEXT DEFAULT '[]',
    mood_history TEXT DEFAULT '[]',
    timeline    TEXT DEFAULT '[]',
    updated_at  TEXT,
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
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) cb(null, true);
    else cb(new Error('CORS blocked'));
  }
}));
app.use(express.json({ limit: '4mb' }));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};

const today = () =>
  new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' });

// ── AUTH ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

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
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, createdAt: user.created_at } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user: { ...user, createdAt: user.created_at } });
});

// ── MEMORY ────────────────────────────────────────────────────────────────────
app.get('/api/memory', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM user_memory WHERE user_id = ?').get(req.user.id);
  if (!row) return res.json({ profile: {}, facts: [], moodHistory: [], timeline: [] });
  res.json({
    profile:     JSON.parse(row.profile      || '{}'),
    facts:       JSON.parse(row.facts        || '[]'),
    moodHistory: JSON.parse(row.mood_history || '[]'),
    timeline:    JSON.parse(row.timeline     || '[]'),
  });
});

app.put('/api/memory', auth, (req, res) => {
  const { profile, facts, moodHistory, timeline } = req.body;
  db.prepare(`
    INSERT INTO user_memory (user_id, profile, facts, mood_history, timeline, updated_at)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET
      profile=excluded.profile, facts=excluded.facts,
      mood_history=excluded.mood_history, timeline=excluded.timeline, updated_at=excluded.updated_at
  `).run(req.user.id, JSON.stringify(profile||{}), JSON.stringify(facts||[]), JSON.stringify(moodHistory||[]), JSON.stringify(timeline||[]), new Date().toISOString());
  res.json({ ok: true });
});

app.put('/api/memory/profile', auth, (req, res) => {
  const { profile } = req.body;
  const row = db.prepare('SELECT profile FROM user_memory WHERE user_id = ?').get(req.user.id);
  const current = row ? JSON.parse(row.profile || '{}') : {};
  const updated = { ...current, ...profile };
  db.prepare('UPDATE user_memory SET profile=?, updated_at=? WHERE user_id=?')
    .run(JSON.stringify(updated), new Date().toISOString(), req.user.id);
  res.json({ ok: true, profile: updated });
});

// ── MESSAGES ──────────────────────────────────────────────────────────────────
app.get('/api/messages', auth, (req, res) => {
  const rows = db.prepare('SELECT role, content, created_at FROM messages WHERE user_id=? ORDER BY id ASC LIMIT 80').all(req.user.id);
  res.json({
    messages: rows.map(r => ({
      role: r.role, content: r.content,
      time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
  });
});

app.post('/api/messages', auth, (req, res) => {
  const { role, content } = req.body;
  if (!role || !content) return res.status(400).json({ error: 'role and content required' });
  db.prepare('INSERT INTO messages (user_id, role, content, created_at) VALUES (?,?,?,?)').run(req.user.id, role, content, new Date().toISOString());
  // Keep last 100 per user
  db.prepare('DELETE FROM messages WHERE user_id=? AND id NOT IN (SELECT id FROM messages WHERE user_id=? ORDER BY id DESC LIMIT 100)').run(req.user.id, req.user.id);
  res.json({ ok: true });
});

app.delete('/api/messages', auth, (req, res) => {
  db.prepare('DELETE FROM messages WHERE user_id=?').run(req.user.id);
  res.json({ ok: true });
});

// ── GEMINI CHAT ───────────────────────────────────────────────────────────────
// Gemini 1.5 Flash: FREE tier — 1,500 req/day, 1M tokens/min, no time limit on conversations
app.post('/api/chat', auth, async (req, res) => {
  if (!GEMINI_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not set on server.' });
  const { messages, systemPrompt } = req.body;

  try {
    // Convert chat history to Gemini format
    // Gemini uses "user" / "model" roles
    const contents = messages.map(m => ({
      role:  m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature:    0.85,
        topP:           0.95,
        maxOutputTokens: 600,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    };

    const response = await fetch(`${GEMINI_URL}${GEMINI_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Gemini error:', data.error);
      return res.status(500).json({ error: data.error.message || 'Gemini API error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return res.status(500).json({ error: 'No response from Gemini' });

    res.json({ reply: text.trim() });
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

// ── MEMORY EXTRACTION (also uses Gemini Flash — fast & free) ─────────────────
app.post('/api/extract-memory', auth, async (req, res) => {
  if (!GEMINI_KEY) return res.json({ newFacts: [], mood: null, milestone: null });
  const { userText, existingFacts } = req.body;

  try {
    const prompt = `Extract key personal facts from this user message for a long-term memory system.
Existing facts already saved: ${JSON.stringify(existingFacts || [])}
User message: "${userText}"

Return ONLY a valid JSON object (no markdown, no explanation):
{"newFacts": ["max 3 NEW fact strings not already in existing facts"], "mood": "one word describing mood or null", "milestone": "brief milestone string if something significant happened, else null"}

Facts must be personal and useful for a companion (e.g. "Has a sister named Maya", "Training for a marathon", "Struggles with anxiety", "Loves hiking").
Only include genuinely NEW facts not already in the existing list. Empty array if nothing new.`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
    };

    const response = await fetch(`${GEMINI_URL}${GEMINI_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    const data = await response.json();
    const raw  = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      res.json(parsed);
    } catch {
      res.json({ newFacts: [], mood: null, milestone: null });
    }
  } catch {
    res.json({ newFacts: [], mood: null, milestone: null });
  }
});

// ── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ── CATCH-ALL ─────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/index.html'));
  });
}

app.listen(PORT, () => console.log(`✦ Solace API running on http://localhost:${PORT}`));
