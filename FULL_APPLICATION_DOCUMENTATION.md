# AirApp Full Application Documentation

Version: Current workspace state (generated 2026-02-23)
Project root: `airAPP/`

## 1. Executive Overview
AirApp is a full-stack aviation operations platform with:
- Public access request and authentication flows.
- Admin workspace for operational analytics and governance.
- User portal for approved non-admin users, controlled by admin-assigned feature permissions.
- Email-driven OTP, password reset, approval/rejection notifications, admin transfer confirmation, and deletion verification flows.

Tech stack:
- Frontend: React 19 + Vite + React Router + Tailwind CSS
- Backend: Node.js + Express
- Database: SQLite via `better-sqlite3`
- Auth: JWT + role/status checks + route-level permission checks
- Maps: Mapbox GL + React Leaflet

## 2. High-Level Architecture

### 2.1 Frontend (`src/`)
- Routing entrypoint: `src/App.jsx`
- Public pages: welcome, login, signup, reset password
- Admin module pages under `src/pages/admin/`
- User portal pages under `src/pages/portal/`

### 2.2 Backend (`server/`)
- Server bootstrap: `server/index.js`
- Route groups:
  - `server/routes/auth.js`
  - `server/routes/admin.js`
  - `server/routes/dashboard.js`
  - `server/routes/actions.js`
  - `server/routes/settings.js`
- Security middleware: `server/middleware/auth.js`
- Permission utilities: `server/utils/permissions.js`
- Database setup/migrations: `server/config/db.js`
- Email transport + templates: `server/config/email.js`

### 2.3 Data and AI
- Main DB file: `server/airapp.db`
- AI input dataset: `server/data/ai_training_dataset.csv`
- Sample/fallback dashboard data: `server/data/dashboardData.js`

---

## 3. Environment and Configuration

Primary env file: `server/.env`

Required variables:
- `PORT`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `FRONTEND_URL`

Operational flags:
- `ALLOW_SAMPLE_DATA`
  - `false`: returns real/derived data only.
  - `true`: allows fallback sample datasets.
- `ALLOW_OTP_BYPASS`
  - Development fallback when email delivery fails.
  - Must be `false` in production.
- `ADMIN_BOOTSTRAP_NAME`
- `ADMIN_BOOTSTRAP_PASSWORD`
  - Used for initial admin seeding when admin user does not exist.

Current admin mail identity in this workspace:
- `ADMIN_EMAIL=airapp452@gmail.com`
- `GMAIL_USER=airapp452@gmail.com`

---

## 4. Database Model
Defined in `server/config/db.js`.

### 4.1 Core Tables
- `users`
  - Identity, credentials, role (`admin|user`), status (`pending|approved|rejected`), profile fields, approval metadata.
- `notifications`
  - System/admin notifications with read state.
- `otp_codes`
  - One-time codes for login and other verification types.
- `password_reset_tokens`
  - Password reset workflow tokens.
- `audit_logs`
  - Action history with category, actor, target, request metadata.
- `user_settings`
  - Profile/security/appearance/notification preferences.

### 4.2 Governance/Security Tables
- `admin_transfers`
  - Two-party admin transfer workflow with status lifecycle and delay window.
- `deletion_requests`
  - Confirmable account deletion requests with timeout and status lifecycle.

### 4.3 Permissions Table
- `user_permissions`
  - Per-user feature flags controlled by admin.
  - Feature keys:
    - `overview`
    - `analytics`
    - `ai_insights`
    - `predictions`
    - `data_view`
    - `data_import`
    - `data_export`
    - `users`
    - `security`
    - `audit`

Default user permission baseline:
- Enabled: `overview`, `analytics`, `data_view`
- Disabled: remaining features


## 5. Authentication, Authorization, and Access Control

### 5.1 Authentication Flow
1. User submits login credentials (`POST /api/auth/login`).
2. If approved and credentials valid, backend sends OTP email and returns temporary token.
3. User verifies OTP (`POST /api/auth/verify-otp`).
4. Backend returns JWT.

### 5.2 Account Status Rules
- `pending`: login denied with pending message.
- `rejected`: login denied with re-apply guidance.
- `approved`: login allowed.

### 5.3 Role and Permission Rules
- Admin endpoints require:
  - Valid JWT + DB-verified role = `admin` + approved status.
- Dashboard endpoints require:
  - Valid JWT + approved status + required feature permission.
- Admin users always get full permissions through `getAllAccessPermissions()`.

### 5.4 Frontend Landing Logic
Login redirection:
- Admin -> `/admin`
- Non-admin approved user -> `/portal`


## 6. Frontend Route Map
Defined in `src/App.jsx`.

### 6.1 Public Routes
- `/` -> `Welcome`
- `/login` -> `Login`
- `/signup` -> `SignUp`
- `/reset-password` -> `ResetPassword`

### 6.2 User Portal Routes
- `/portal` -> `PortalOverview`
- `/portal/analytics` -> `PortalAnalytics`
- `/portal/ai-insights` -> `PortalAIInsights`
- `/portal/predictions` -> `PortalPredictions`
- `/portal/data` -> `PortalData`

Guard behavior in `src/pages/portal/UserLayout.jsx`:
- Redirects unauthenticated users to login.
- Redirects admins to admin workspace.
- Blocks non-approved users.
- Shows only permission-enabled nav items.
- If user has zero features, shows "No Features Assigned" state.

### 6.3 Admin Routes
- `/admin` -> `Overview`
- `/admin/analytics` -> `Analytics`
- `/admin/ai-insights` -> `AIInsights`
- `/admin/predictions` -> `Predictions`
- `/admin/airports` -> `Airports`
- `/admin/users` -> `Users`
- `/admin/data` -> `Data`
- `/admin/security` -> `Security`
- `/admin/notifications` -> `Notifications`
- `/admin/settings` -> `Settings`


## 7. Backend API Documentation

Base URL: `http://localhost:5000/api`

### 7.1 Health
- `GET /health`
  - Returns basic server status.

### 7.2 Auth API (`/auth`)
- `POST /signup`
  - Submit or resubmit access request.
- `POST /login`
  - Validate credentials; sends OTP when approved.
- `POST /verify-otp`
  - Verify OTP and issue JWT.
- `POST /resend-otp`
  - Resend login OTP (rate-limited).
- `GET /me`
  - Returns current user profile including effective permissions.
- `POST /forgot-password`
  - Initiate password reset.
- `POST /reset-password`
  - Complete reset with token.
- `GET /verify-reset-token`
  - Token validity check.
- `POST /confirm-admin-transfer`
  - Confirm admin transfer via tokenized link.
- `GET /admin-transfer-status`
  - Check transfer status via token.
- `POST /verify-deletion`
  - Confirm or deny deletion request via token.
- `GET /deletion-status`
  - Check deletion request status via token.

### 7.3 Admin API (`/admin`) [admin-only]
Access requests:
- `GET /requests`
- `GET /requests/:id`
- `POST /approve/:id`
- `POST /reject/:id`

Notifications:
- `GET /notifications`
- `POST /notifications/read`

Stats and permissions:
- `GET /stats`
- `GET /users/permissions`
- `PUT /users/:id/permissions`

Admin transfer:
- `POST /transfer/initiate`
- `GET /transfer/status`
- `POST /transfer/cancel`

User directory and deletions:
- `GET /users`
- `POST /delete/initiate`
- `GET /delete/pending`
- `POST /delete/cancel/:id`

Audit:
- `GET /audit-logs`

### 7.4 Dashboard API (`/dashboard`) [approved users + feature gates]
- `GET /overview` -> requires `overview`
- `GET /analytics` -> requires `analytics`
- `GET /ai-insights` -> requires `ai_insights`
- `GET /predictions` -> requires `predictions`
- `GET /airports` -> requires `analytics`
- `GET /data` -> requires `data_view`

### 7.5 Actions API (`/actions`) [admin-only utility actions]
AI:
- `POST /ai/retrain`
- `GET /ai/export`

Predictions:
- `POST /predictions/refresh`
- `GET /predictions/export`
- `POST /predictions/insights/explore`

Data:
- `GET /data/export`
- `POST /data/manage`
- `GET /data/databases/:name`
- `GET /data/imports`
- `POST /data/import`

Notifications:
- `POST /notifications/clear`
- `GET /notifications/export`
- `POST /notifications/alerts`

Legacy/mock endpoint:
- `GET /users/permissions` (returns static snapshot; admin module now uses `/api/admin/users/permissions`)

### 7.6 Settings API (`/settings`) [authenticated users]
- `GET /`
- `PUT /profile`
- `PUT /security`
- `PUT /appearance`
- `PUT /notifications`
- `POST /password`
- `POST /avatar`


## 8. Functional Workflows

### 8.1 Access Request Lifecycle
1. New user submits signup request.
2. Record created with `status='pending'`.
3. Admin reviews in `/admin/users` request tabs.
4. Admin approves or rejects.
5. User receives email notification.

### 8.2 Login + OTP Lifecycle
1. User enters credentials.
2. Backend checks user, password, status.
3. OTP generated and stored with expiration.
4. OTP sent through Gmail SMTP.
5. User submits OTP for JWT issuance.

### 8.3 Admin-Controlled User Portal Access
1. Approved user logs in and lands on `/portal`.
2. Effective permissions fetched via `/api/auth/me`.
3. Portal nav + routes filtered by permissions.
4. Backend independently enforces permissions on dashboard APIs.

### 8.4 Admin Transfer Lifecycle
1. Admin initiates transfer with password confirmation.
2. System sends confirmation links to current and target admins.
3. Both must confirm.
4. Transfer completes after policy timing conditions, and roles are swapped.

### 8.5 Secure Deletion Lifecycle
1. Admin initiates deletion with explicit confirmations.
2. User receives verification email.
3. User confirms/denies within timeout window.
4. System soft-deletes or cancels accordingly.


## 9. UI Documentation (Screen-by-Screen)

### 9.1 Public and Auth Screens
- `src/pages/Welcome.jsx`
- `src/pages/Login.jsx`
- `src/pages/SignUp.jsx`
- `src/pages/ResetPassword.jsx`

### 9.2 Admin Workspace Screens
- `src/pages/admin/Overview.jsx`
- `src/pages/admin/Analytics.jsx`
- `src/pages/admin/AIInsights.jsx`
- `src/pages/admin/Predictions.jsx`
- `src/pages/admin/Airports.jsx`
- `src/pages/admin/Data.jsx`
- `src/pages/admin/Users.jsx`
- `src/pages/admin/Security.jsx`
- `src/pages/admin/Notifications.jsx`
- `src/pages/admin/Settings.jsx`

### 9.3 User Portal Screens
- `src/pages/portal/UserLayout.jsx`
- `src/pages/portal/PortalOverview.jsx`
- `src/pages/portal/PortalAnalytics.jsx`
- `src/pages/portal/PortalAIInsights.jsx`
- `src/pages/portal/PortalPredictions.jsx`
- `src/pages/portal/PortalData.jsx`


## 10. Screenshot Documentation Matrix
Create a folder `screenshots/` at project root and add images using these names.

### 10.1 Public/Auth
- `screenshots/01-welcome.png`
- `screenshots/02-login.png`
- `screenshots/03-signup.png`
- `screenshots/04-reset-password.png`

### 10.2 Admin Core
- `screenshots/10-admin-overview.png`
- `screenshots/11-admin-analytics.png`
- `screenshots/12-admin-ai-insights.png`
- `screenshots/13-admin-predictions.png`
- `screenshots/14-admin-airports.png`
- `screenshots/15-admin-data.png`

### 10.3 Admin Governance
- `screenshots/20-admin-users-requests.png`
- `screenshots/21-admin-users-permissions.png`
- `screenshots/22-admin-security-transfer.png`
- `screenshots/23-admin-security-deletion.png`
- `screenshots/24-admin-notifications.png`
- `screenshots/25-admin-settings.png`

### 10.4 User Portal
- `screenshots/30-portal-overview.png`
- `screenshots/31-portal-analytics.png`
- `screenshots/32-portal-ai-insights.png`
- `screenshots/33-portal-predictions.png`
- `screenshots/34-portal-data.png`
- `screenshots/35-portal-no-features.png`

### 10.5 Flows and States
- `screenshots/40-login-otp-step.png`
- `screenshots/41-request-submitted-success.png`
- `screenshots/42-pending-login-state.png`
- `screenshots/43-rejected-login-state.png`
- `screenshots/44-permission-denied-state.png`


## 11. Setup and Runbook

### 11.1 Install
```bash
npm install
cd server && npm install
```

### 11.2 Configure
```bash
cp server/.env.example server/.env
```
Set:
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `FRONTEND_URL`

### 11.3 Run
Backend:
```bash
cd server
npm run dev
```
Frontend:
```bash
npm run dev
```

### 11.4 Build
```bash
npm run build
```

### 11.5 Health check
```bash
curl http://localhost:5000/api/health
```

## 12. Quality and Testing Status

### 12.1 What currently passes
- Frontend production build (`npm run build`)
- Backend syntax checks (`node --check ...`)
- Runtime API smoke tests (health, auth, admin guard, permission gating)

### 12.2 Current quality gap
- Frontend lint has existing project-wide errors/warnings in legacy files.
- Recommended: clean `eslint` issues before release gate enforcement.

## 13. Security and Operational Notes
- Keep `ALLOW_OTP_BYPASS=false` in production.
- Never commit real secrets.
- Rotate `JWT_SECRET` and Gmail app password when credentials are exposed.
- Use `CORS_ORIGINS`/`FRONTEND_URL` strictly for deployment domains.
- Monitor `audit_logs` for admin actions and sensitive workflow events.


## 14. Change Log (Recent Additions)
- Added user portal routes and pages.
- Added persistent per-user permission system (`user_permissions`).
- Added admin permission management APIs.
- Added dashboard route feature gating for non-admin users.
- Updated admin email identity to `airapp452@gmail.com` in runtime configuration.


## 15. Appendix: Quick File Index

Core:
- `src/App.jsx`
- `server/index.js`
- `server/config/db.js`

Auth & Security:
- `server/routes/auth.js`
- `server/middleware/auth.js`
- `server/config/email.js`

Admin:
- `server/routes/admin.js`
- `src/pages/admin/*.jsx`

Portal:
- `src/pages/portal/*.jsx`
- `server/utils/permissions.js`
- `server/routes/dashboard.js`

Utilities:
- `server/routes/actions.js`
- `server/routes/settings.js`

