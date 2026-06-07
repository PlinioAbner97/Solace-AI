const BASE = process.env.REACT_APP_API_URL || '';

const authHeader = () => {
  const token = localStorage.getItem('solace_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const call = async (path, method = 'GET', body = null) => {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  signup: (name, email, password) => call('/auth/signup', 'POST', { name, email, password }),
  signin: (email, password)        => call('/auth/signin', 'POST', { email, password }),
  me:     ()                       => call('/auth/me'),

  getMemory:    ()        => call('/memory'),
  saveMemory:   (memory)  => call('/memory', 'PUT', memory),
  saveProfile:  (profile) => call('/memory/profile', 'PUT', { profile }),

  getMessages:  ()               => call('/messages'),
  saveMessage:  (role, content)  => call('/messages', 'POST', { role, content }),
  clearMessages: ()              => call('/messages', 'DELETE'),

  chat:          (messages, systemPrompt) => call('/chat', 'POST', { messages, systemPrompt }),
  extractMemory: (userText, existingFacts) => call('/extract-memory', 'POST', { userText, existingFacts }),
};
