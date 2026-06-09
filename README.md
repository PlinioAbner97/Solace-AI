# ✦ Solace AI

> The AI companion that grows with you — remembers your story, your feelings, your goals.

Built with **React**, **Express**, **SQLite**, and **OpenRouter** (free AI — no credit card needed).

---

## Quick Start

### 1. Get a FREE OpenRouter API key (2 minutes)

1. Go to → **https://openrouter.ai** → Sign Up (just email, no credit card)
2. Go to → **https://openrouter.ai/keys** → click **"Create Key"**
3. Copy the key — it looks like `sk-or-v1-...`

Free tier gives you access to **Gemini 2.0 Flash, Llama 3.3 70B, DeepSeek** and more — unlimited conversation length.

### 2. Clone & install

```bash
git clone https://github.com/PlinioAbner97/Solace-AI.git
cd Solace-AI
npm run install:all
```

### 3. Set environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
JWT_SECRET=any-long-random-string
```

### 4. Run locally

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001

---

## Deploy to Render (free hosting)

### Step 1 — Push to GitHub
Your code is already at: https://github.com/PlinioAbner97/Solace-AI

### Step 2 — Deploy backend
1. Go to **https://dashboard.render.com** → New + → **Web Service**
2. Connect repo **PlinioAbner97/Solace-AI**
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Plan:** Free
4. Environment Variables:
   - `OPENROUTER_API_KEY` = your key from openrouter.ai
   - `JWT_SECRET` = any long random string
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = (fill in after frontend deploys)
5. Click **Deploy** — note your backend URL e.g. `https://solace-ai-backend.onrender.com`

### Step 3 — Deploy frontend
1. New + → **Static Site**
2. Connect same repo **PlinioAbner97/Solace-AI**
3. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`
4. Environment Variables:
   - `REACT_APP_API_URL` = your backend URL from Step 2
5. Click **Deploy**

### Step 4 — Connect them
Go back to your backend service → Environment → update `FRONTEND_URL` to your frontend URL.

---

## Project Structure

```
Solace-AI/
├── public/              HTML shell
├── src/
│   ├── App.js           Router + auth state
│   ├── index.js         React entry
│   ├── pages/
│   │   ├── Home.js          Landing page
│   │   ├── Auth.js          Sign in / Sign up
│   │   ├── PickCompanion.js Companion selection (8 female, 8 male)
│   │   └── AppShell.js      Chat, Memory, Journal, Profile
│   └── utils/
│       ├── api.js           All API calls
│       ├── companions.js    16 companions + system prompt builder
│       └── styles.js        All CSS
├── server/
│   ├── index.js         Express + OpenRouter + SQLite
│   ├── package.json
│   └── .env.example
├── render.yaml          One-click Render deploy
├── package.json
└── README.md
```

---

## AI Models (all free via OpenRouter)

| Model | Used for |
|-------|----------|
| `google/gemini-2.0-flash-exp:free` | Main companion chat |
| `meta-llama/llama-3.3-70b-instruct:free` | Memory extraction |

Free tier: 20 requests/minute, 200 requests/day. Users can chat as long as they want.

---

## License
MIT
