# Deployment Guide

## Option A — Fastest (Render + Vercel), free tiers

### Backend on Render
1. Push this repo to GitHub.
2. On https://render.com → New → Web Service → connect the repo → root directory `backend`.
3. Build command: `npm install`  |  Start command: `npm start`
4. Add environment variables (from `backend/.env.example`):
   - `JWT_SECRET` — any long random string
   - `CLIENT_URL` — your deployed frontend URL (fill in after Step B)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (optional, see below)
   - `PORT` — Render sets this automatically, leave default in code (`process.env.PORT`)
5. Render gives you a URL like `https://flowlens-api.onrender.com`. SQLite file persists
   on Render's disk for the free tier's lifetime; for production durability, attach a
   Render Disk (Settings → Disks) mounted at `backend/src/data`.

### Frontend on Vercel
1. https://vercel.com → New Project → import the repo → root directory `frontend`.
2. Framework preset: Vite. Build command `npm run build`, output `dist`.
3. Environment variable: `VITE_API_URL=https://flowlens-api.onrender.com`
4. Deploy. Then go back to Render and set `CLIENT_URL` to this Vercel URL, redeploy backend.

## Option B — Railway (both frontend & backend in one project)
1. https://railway.app → New Project → Deploy from GitHub repo.
2. Add two services pointing at `backend/` and `frontend/` subfolders (Railway supports
   monorepos via "Root Directory" per service).
3. Same env vars as above; Railway auto-assigns public URLs.

## Option C — Docker (any VPS / Antigravity-managed container)
```bash
# from repo root
docker build -t flowlens-backend ./backend
docker build -t flowlens-frontend ./frontend
docker run -d -p 5000:5000 --env-file backend/.env flowlens-backend
docker run -d -p 3000:80 flowlens-frontend
```
Dockerfiles are included in both `backend/` and `frontend/`.

## Setting up Google Sign-In + Sheets (optional but recommended)

1. Go to https://console.cloud.google.com/ → create a project (e.g. "FlowLens").
2. APIs & Services → Enable APIs → enable **Google Sheets API**.
3. APIs & Services → OAuth consent screen → External → fill app name/logo/support email.
4. APIs & Services → Credentials → Create Credentials → OAuth Client ID → type **Web application**.
   - Authorized JavaScript origins: your frontend URL (e.g. `https://flowlens.vercel.app`, and `http://localhost:5173` for local dev)
   - Authorized redirect URIs: `<your-backend-url>/api/auth/google/callback` (and the localhost equivalent)
5. Copy the **Client ID** and **Client Secret** into the backend `.env`:
   ```
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxx
   GOOGLE_CALLBACK_URL=https://your-backend-url/api/auth/google/callback
   ```
6. Under **Scopes**, add `.../auth/spreadsheets.readonly` so signed-in users can import
   Sheets directly (the app requests this scope automatically during Google login).
7. Restart the backend. The "Sign in with Google" and "Import from Google Sheets"
   buttons will now work end-to-end.

## Environment variable summary

**backend/.env**
```
PORT=5000
JWT_SECRET=change_me_to_something_long_and_random
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000
```

## Zero-Google-setup mode

If you skip the Google OAuth steps entirely, the app still fully works: users register
with email/password, upload CSV/XLSX files directly (drag-and-drop), run analysis, and
download PDF reports. Only "Sign in with Google" and "Import from Google Sheets" buttons
will be disabled with a friendly tooltip explaining they need Google credentials
configured — everything else is unaffected.
