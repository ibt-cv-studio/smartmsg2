# SmartMsg — SMS Scheduler

## Quick start (3 steps)

### Step 1 — Setup database
```
psql -U postgres
CREATE DATABASE smartmsg_db;
\q
```

### Step 2 — Backend
```
cd backend
npm install
cp .env.example .env
# Edit .env with your DB password and Africa's Talking keys
npm run migrate
npm run dev
```

### Step 3 — Frontend
```
cd frontend
npm install
npm start
```
Open http://localhost:3000

## Deploy to Railway (free hosting + live link)
1. Push this folder to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set env variables in Railway dashboard
5. Get your live link!
