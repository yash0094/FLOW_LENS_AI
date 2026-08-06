# FlowLens — Operational Bottleneck Detector

FlowLens is a full-stack web app that finds where your process is slowing down —
which stage, how bad, and why — using simple, explainable statistics (no black-box AI).
Upload a CSV/Excel file (or pull data straight from Google Sheets), and FlowLens tells
you the bottleneck stage, flags stuck items, and gives you a plain-English report you
can download as a PDF.

## Why it's not "just another dashboard app"

- **The math is deliberately simple and auditable.** Stage duration → mean/median/IQR →
  z-score vs the rest of the pipeline → outlier flag. No ML model, no black box — every
  number in the report can be explained in one sentence, and you can verify it by hand.
- **The report reads like an analyst wrote it**, not like a chart dump: it names the
  worst stage, tells you *why* (capacity constraint vs. inconsistent process vs.
  frequent exceptions), and gives a recommendation.
- **Fintech-app-grade frontend** (Paytm/PhonePe-inspired): bold single accent color,
  big number cards, bottom nav on mobile, rounded everything, zero enterprise-dashboard
  clutter.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS + Recharts |
| Backend | Node.js + Express |
| Database | SQLite (file-based, zero setup — `better-sqlite3`) |
| Auth | Google OAuth 2.0 + email/password, JWT sessions, role-based (admin / user) |
| File parsing | `xlsx` (Excel), `csv-parse` (CSV) |
| Sheets integration | Google Sheets API (`googleapis`) |
| PDF report | `pdfkit` |

## Repo layout

```
bottleneck-detector/
├── backend/         # Express API + SQLite + bottleneck engine
├── frontend/         # React app (Vite)
├── samples/           # Example CSV to try the app with
└── DEPLOYMENT.md      # Step-by-step deploy guide (Render/Railway + Vercel/Netlify)
```

## Quick start (local)

### 1. Backend
```bash
cd backend
cp .env.example .env      # fill in JWT_SECRET, Google OAuth keys (optional to start)
npm install
npm run dev                # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173, register a normal account (email/password works with no
Google setup needed), and upload `samples/sample_process_data.csv` to see a report.

The **first user who registers is automatically made an admin.** Everyone after that is
a normal user. Admins can see all datasets uploaded by everyone; normal users only see
their own.

## How the bottleneck logic works (in plain English)

Your data has, for each item/order/ticket that moved through your process, a row per
stage with an entry time and exit time. FlowLens:

1. Computes **duration = exit − entry** for every (item, stage) pair.
2. Groups durations **by stage** and computes mean, median, std-dev, and IQR (Q1/Q3).
3. Compares each stage's average duration to the average across *all* stages using a
   **z-score** — a stage is flagged as a bottleneck if it's meaningfully slower than
   the rest of the pipeline (default threshold: 1.0 standard deviation above the mean,
   adjustable in Settings).
4. Within each stage, any individual item whose duration is above **Q3 + 1.5×IQR** is
   flagged as a **stuck/outlier item** — the same rule box plots use.
5. A rule-based (not AI) classifier looks at each bottleneck stage's mean and variance
   to suggest *why*:
   - High mean, low variance → **capacity constraint** (the stage is just slow for
     everyone — add resources/parallelize).
   - High mean, high variance → **inconsistent process** (some cases fly through,
     others get stuck — look for manual steps/approvals/exceptions).
   - Many outliers, otherwise normal mean → **exception handling problem** (edge cases
     are what's costing you time, not the everyday case).

This logic lives in one file, `backend/src/services/bottleneckEngine.js`, so it's easy
to read, tweak, or extend.

## Data format expected

Long format, one row per (item, stage):

| item_id | stage | entry_time | exit_time |
|---|---|---|---|
| ORD-1001 | Order Received | 2026-01-05 09:00 | 2026-01-05 09:20 |
| ORD-1001 | QC Check | 2026-01-05 09:20 | 2026-01-05 11:45 |
| ORD-1001 | Packing | 2026-01-05 11:45 | 2026-01-05 12:00 |

Column names are matched flexibly (case-insensitive, ignores spaces/underscores) —
`Item`, `ItemID`, `Order Number`... all map to `item_id`, and similarly for
`stage`/`step`/`phase`, `entry_time`/`start`/`in`, `exit_time`/`end`/`out`.

## Google Sheets & Google Sign-In

See `DEPLOYMENT.md` for creating a Google Cloud OAuth Client ID (needed for both
"Sign in with Google" and reading Sheets on the user's behalf). The app runs fine
without it — email/password login and CSV/XLSX upload work with zero Google setup.

## Using with Google Antigravity / any AI coding IDE

This is a plain Node + React repo — no special config needed. Point Antigravity (or
Cursor/Claude Code/etc.) at the root folder; `backend/` and `frontend/` are independent
npm projects it can run, edit, and redeploy like any other GitHub project. Push this
whole folder to a new GitHub repo and it just works.

## Login / roles

- **Google Sign-In** or **email + password**, your choice — both hit the same
  `users` table.
- **Roles:** `admin` (first registered user, or promoted via `PATCH /api/auth/role`)
  and `user`. Admins see every dataset company-wide; normal users see their own only.
  This satisfies "login as authorised person or normal person."

## Help & Tutorial

Settings → Help has a searchable FAQ accordion and a **"Replay tutorial"** button that
re-runs the 5-step first-time walkthrough (upload → analyze → read report → download
PDF → connect Sheets).
