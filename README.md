# ✦ Solace AI

> The AI companion that grows with you — remembers your story, your feelings, your goals.

Built with **React**, **Express**, **SQLite**, and **Google Gemini 1.5 Flash** (free, no limits on conversation length).

---

## Features

- 🔐 **Auth** — sign up / sign in with secure JWT sessions
- 🧑‍🤝‍🧑 **16 unique companions** — 8 female, 8 male — each with their own name, personality, and emoji
- 🧠 **Long-term memory** — facts, mood history, and milestones extracted automatically from every chat
- 📖 **Life Journal** — a visual timeline of your story
- 💬 **Unlimited chats** — Gemini 1.5 Flash free tier: 1,500 requests/day, no message limits
- 🎭 **4 companion modes** — Friend, Coach, Deep, Support
- 🌱 **Profile** — tell your companion about yourself

---

## Tech Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6         |
| Backend   | Node.js, Express                  |
| Database  | SQLite via better-sqlite3         |
| AI        | Google Gemini 1.5 Flash (FREE)    |
| Auth      | bcryptjs + JWT                    |
| Deploy    | Render / Railway / Fly.io / VPS   |

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/solace-ai.git
cd solace-ai
```

### 2. Get a FREE Gemini API key

Go to → **https://aistudio.google.com/app/apikey**  
Click "Create API Key". It's completely free — no credit card required.  
Free tier: **1,500 requests/day, 1,000,000 tokens/min**.

### 3. Configure environment variables

```bash
# Frontend
cp .env.example .env

# Backend
cp server/.env.example server/.env
```

Edit `server/.env`:
```
GEMINI_API_KEY=your_key_here
JWT_SECRET=any_long_random_string_here
```

### 4. Install dependencies

```bash
npm run install:all
```

### 5. Start both servers

```bash
npm run dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:3001  

---

## Deploying to Production

### Option A — Render (recommended, free tier available)

1. Push your repo to GitHub
2. Go to **https://render.com** → New Web Service
3. Connect your GitHub repo
4. Set **Root Directory** to `server`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `node index.js`
7. Add environment variables:
   - `GEMINI_API_KEY` = your key
   - `JWT_SECRET` = your secret
   - `NODE_ENV` = production
   - `FRONTEND_URL` = your Render frontend URL
8. Deploy a second service for the React frontend (Static Site):
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - Add env var: `REACT_APP_API_URL` = your backend Render URL

### Option B — Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```
Set env vars in the Railway dashboard.

### Option C — Single server (backend serves frontend)

```bash
npm run build          # builds React into /build
cd server
NODE_ENV=production node index.js
```
The Express server will serve the React app at the root and handle API routes at `/api/*`.

---

## Project Structure

```
solace-ai/
├── public/              # Static HTML
├── src/
│   ├── App.js           # Router + auth state
│   ├── index.js         # React entry
│   ├── pages/
│   │   ├── Home.js          # Landing page
│   │   ├── Auth.js          # Sign in / Sign up
│   │   ├── PickCompanion.js # Companion selection
│   │   └── AppShell.js      # Main app (chat, memory, journal, profile)
│   └── utils/
│       ├── api.js           # All backend API calls
│       ├── companions.js    # Companion data + system prompt builder
│       └── styles.js        # All CSS
├── server/
│   ├── index.js         # Express server (auth, memory, messages, Gemini proxy)
│   ├── package.json
│   ├── .env.example
│   └── solace.db        # SQLite database (auto-created, gitignored)
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Why Gemini instead of other APIs?

| Provider      | Free tier            | Rate limits                  |
|---------------|----------------------|------------------------------|
| **Gemini 1.5 Flash** | ✅ Always free  | 1,500 req/day · 1M tok/min  |
| OpenAI GPT-4  | ❌ Paid only         | —                            |
| Anthropic     | ❌ Paid only         | —                            |
| Cohere        | ✅ Limited free      | 1,000 req/month              |

Gemini 1.5 Flash is fast, smart, and genuinely free with limits high enough for a growing app.

---

## License

MIT — free to use, modify and deploy.
