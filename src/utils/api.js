const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/$/, '')
  : 'https://solace-ai-xyrq.onrender.com';

const authHeader = () => {
  const token = localStorage.getItem('solace_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const call = async (path, method = 'GET', body = null) => {
  let res, data;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (networkErr) {
    throw new Error(`Network error — cannot reach server: ${networkErr.message}`);
  }
  try { data = await res.json(); }
  catch { throw new Error(`Server returned non-JSON (status ${res.status})`); }
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
  return data;
};

// companion = the companion's name (e.g. "Luna", "Kai") — each gets isolated storage
export const api = {
  signup:      (name, email, password)   => call('/auth/signup', 'POST', { name, email, password }),
  signin:      (email, password)          => call('/auth/signin', 'POST', { email, password }),
  me:          ()                         => call('/auth/me'),

  getMemory:   (companion)               => call(`/memory?companion=${encodeURIComponent(companion || 'default')}`),
  saveMemory:  (memory, companion)       => call('/memory', 'PUT', { ...memory, companion: companion || 'default' }),
  saveProfile: (profile, companion)      => call('/memory/profile', 'PUT', { profile, companion: companion || 'default' }),

  getMessages:   (companion)             => call(`/messages?companion=${encodeURIComponent(companion || 'default')}`),
  saveMessage:   (role, content, companion) => call('/messages', 'POST', { role, content, companion: companion || 'default' }),
  clearMessages: (companion)             => call(`/messages?companion=${encodeURIComponent(companion || 'default')}`, 'DELETE'),

  chat:          (messages, systemPrompt) => call('/chat', 'POST', { messages, systemPrompt }),
  extractMemory: (userText, existingFacts) => call('/extract-memory', 'POST', { userText, existingFacts }),

  getCheckin: (companion, companionName, companionTrait, lang) =>
    call(`/checkin?companion=${encodeURIComponent(companion || 'default')}&companionName=${encodeURIComponent(companionName||'')}&companionTrait=${encodeURIComponent(companionTrait||'')}&lang=${lang||'en'}`),

  getInsight: (companion, companionName, lang) =>
    call(`/insight?companion=${encodeURIComponent(companion || 'default')}&companionName=${encodeURIComponent(companionName||'')}&lang=${lang||'en'}`),

  logMood:    (mood, score, note) => call('/mood', 'POST', { mood, score, note }),
  getMoodStreak: ()               => call('/mood/streak'),

  summarizeSession: (companion, companionName, lang, messages) =>
    call('/summarize-session', 'POST', { companion, companionName, lang, messages }),

  testAI: () => call('/test-ai'),
};

export { BASE };
