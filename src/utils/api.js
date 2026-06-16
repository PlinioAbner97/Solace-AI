// Always point to the backend explicitly — never fall back to same origin
const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/$/, '')  // strip trailing slash
  : 'https://solace-ai-xyrq.onrender.com';             // hardcoded fallback

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
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned non-JSON (status ${res.status})`);
  }
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
  return data;
};

export const api = {
  signup:        (name, email, password)  => call('/auth/signup', 'POST', { name, email, password }),
  signin:        (email, password)         => call('/auth/signin', 'POST', { email, password }),
  me:            ()                        => call('/auth/me'),

  getMemory:     ()         => call('/memory'),
  saveMemory:    (memory)   => call('/memory', 'PUT', memory),
  saveProfile:   (profile)  => call('/memory/profile', 'PUT', { profile }),

  getMessages:   ()               => call('/messages'),
  saveMessage:   (role, content)  => call('/messages', 'POST', { role, content }),
  clearMessages: ()               => call('/messages', 'DELETE'),

  chat:          (messages, systemPrompt)  => call('/chat', 'POST', { messages, systemPrompt }),
  extractMemory: (userText, existingFacts) => call('/extract-memory', 'POST', { userText, existingFacts }),

  testAI:        () => call('/test-ai'),  // for debugging
};

export { BASE };
