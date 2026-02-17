# AirApp Admin Platform

AirApp is a full-stack admin platform for aviation operations and analytics.

- Frontend: React + Vite + Tailwind + React Router
- Backend: Node.js + Express + SQLite (`better-sqlite3`)
- Auth: JWT + role-based route protection
- Mapping: Mapbox GL + React Leaflet

## Features

- Access request flow (signup -> admin approve/reject)
- Admin dashboard modules:
  - Overview
  - Analytics
  - AI Insights
  - Predictions
  - Airports
  - Data Management
  - Users / Notifications / Settings / Security
- Email flows for OTP/reset/approval notifications
- AI dataset pipeline from CSV (`server/data/ai_training_dataset.csv`)
- Sample-data fallback can be disabled (recommended)

## Project Structure

```text
airAPP/
  src/                  # React frontend
  server/               # Express backend
    config/
    routes/
    middleware/
    data/
    airapp.db
```

## Local Setup

### 1) Install dependencies

```bash
npm install
cd server && npm install
```

### 2) Configure environment

Create `server/.env` from `server/.env.example` and set real values:

- `JWT_SECRET`
- `ADMIN_EMAIL`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `FRONTEND_URL`

Important flags:

- `ALLOW_SAMPLE_DATA=false` -> only real data is returned by dashboard APIs
- `ALLOW_OTP_BYPASS=false` -> keep disabled in production
- `ADMIN_BOOTSTRAP_PASSWORD` -> only for first-run admin seeding; change/remove after setup

### 3) Run backend

```bash
cd server
npm run dev
```

### 4) Run frontend

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Build / Quality

```bash
npm run build
npx eslint server
```

## AI Dataset

The AI dashboards read from:

- `server/data/ai_training_dataset.csv`

Schema:

- `date`
- `airport_code`
- `arrivals`
- `departures`
- `passengers`
- `revenue_usd`
- `delays`
- `cancellations`
- `weather_index`
- `fuel_price_usd_per_liter`

If dataset is missing:

- with `ALLOW_SAMPLE_DATA=false`: endpoints return empty/zero states
- with `ALLOW_SAMPLE_DATA=true`: platform falls back to sample dashboard data

## API Modules (High-Level)

- `/api/auth` - signup/login/otp/reset
- `/api/admin` - requests, approvals, notifications, admin actions
- `/api/dashboard` - dashboard data endpoints
- `/api/actions` - export/retrain/refresh/utility actions
- `/api/settings` - profile/security/notification settings

## Security Notes

- Do not commit real `.env` secrets.
- Change default/admin bootstrap credentials immediately.
- Use strong JWT secret and production email credentials.

## Deployment Handoff

When sharing this project as a zip with another team:

1. Extract the project and install dependencies:
   - `npm install`
   - `cd server && npm install`
2. Create `server/.env` from `server/.env.example`.
3. Set production-safe values:
   - `JWT_SECRET` (strong random value)
   - `ADMIN_EMAIL`
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `FRONTEND_URL`
   - `ALLOW_SAMPLE_DATA=false`
   - `ALLOW_OTP_BYPASS=false`
4. Start backend and verify health:
   - `cd server && npm start`
   - check `GET /api/health`
5. Build and serve frontend:
   - `npm run build`
   - `npm run preview` (or deploy `dist/` to hosting)
6. Verify admin login and dashboard data:
   - Confirm real data appears (no sample fallback).
   - Confirm AI dataset file exists at `server/data/ai_training_dataset.csv`.
