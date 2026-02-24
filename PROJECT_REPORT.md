# AirApp Project Report

## Cover Page
Project Title: AirApp Aviation Operations Platform  
Project Type: Full-Stack Web Application  
Prepared By: ____________________________  
Date: ____________________________  
Version: ____________________________


## Table of Contents
1. Executive Summary  
2. Project Background  
3. Problem Statement  
4. Project Goals and Objectives  
5. Scope of the Project  
6. Stakeholders and Users  
7. Methodology and Development Approach  
8. System Overview  
9. Functional Requirements  
10. Non-Functional Requirements  
11. System Architecture  
12. Technology Stack  
13. Database Design Summary  
14. Security and Access Control  
15. Key Workflows  
16. User Interface and Screens  
17. Testing and Validation  
18. Deployment and Environment Setup  
19. Challenges and Mitigations  
20. Limitations and Future Improvements  
21. Conclusion  
22. Appendices


## 1. Executive Summary
AirApp is a full-stack aviation operations platform designed to manage user access, monitor operational data, provide AI-driven insights, and support secure administrative governance.  
The system includes:
- Public access request and authentication flow.
- OTP-based secure login.
- Admin dashboard for operational monitoring, approval workflows, user/security management, and auditing.
- A dedicated non-admin user portal with feature access controlled by administrators.

This report presents what the application does, how it is built, how it is secured, and how it can be operated and improved.


## 2. Project Background
Air operations environments require centralized visibility, controlled access to sensitive information, and quick operational decision-making. Traditional tools often separate user access management from analytics, resulting in inefficiencies and security gaps.

AirApp was built to unify these needs into one platform.


## 3. Problem Statement
Organizations managing aviation-related operations face:
- Unstructured user onboarding and approval processes.
- Weak access control and visibility into who can see what.
- Fragmented operational data systems.
- Limited traceability of sensitive administrative actions.


## 4. Project Goals and Objectives
### Main Goal
Build a secure, role-aware web platform that manages access and delivers operational intelligence.

### Objectives
- Implement request-based account onboarding.
- Enforce secure login with OTP verification.
- Provide a modular admin workspace for operations and security.
- Introduce a controlled non-admin portal with granular permissions.
- Maintain auditability of sensitive actions.


## 5. Scope of the Project
### In Scope
- User signup request and admin approval/rejection.
- OTP login and password reset.
- Admin dashboard modules (overview, analytics, predictions, AI, users, security, data, notifications, settings).
- Permission-based user portal.
- Email notifications for authentication and governance flows.

### Out of Scope (Current Version)
- Native mobile applications.
- Third-party SSO integration.
- Multi-tenant organization isolation.
- Advanced CI/CD automation pipelines.


## 6. Stakeholders and Users
- System Administrator: controls users, permissions, and platform governance.
- Approved Non-Admin User: accesses allowed portal modules.
- Applicant/User Requester: submits access request and waits for decision.
- Technical Team: deploys, monitors, and maintains application.


## 7. Methodology and Development Approach
The project follows an iterative implementation approach:
- Core authentication and admin foundations first.
- Dashboard and operational modules integrated progressively.
- Security hardening (OTP, role checks, audit logs, admin transfer/deletion safeguards).
- Permission model added to support separate user portal experiences.


## 8. System Overview
AirApp has two major runtime parts:
- Frontend: React-based interface with route-based module separation.
- Backend: Express API with SQLite persistence, email service integration, and role/permission enforcement.

The application supports two primary post-login experiences:
- Admin workspace (`/admin`)
- User portal (`/portal`)


## 9. Functional Requirements
- FR1: User can request platform access via signup.
- FR2: Admin can approve or reject access requests.
- FR3: Approved users authenticate via password + OTP.
- FR4: Admin can view and manage operational dashboards.
- FR5: Admin can assign feature permissions to users.
- FR6: Non-admin users can only access permitted modules.
- FR7: System records sensitive actions in audit logs.
- FR8: Password reset, admin transfer, and deletion verification flows are supported.


## 10. Non-Functional Requirements
- Security: JWT auth, role checks, status checks, OTP, permission gates.
- Reliability: predictable API responses and structured error handling.
- Usability: distinct UI per role, dashboard-based access.
- Maintainability: modular routes/components and clear project structure.
- Performance: lightweight SQLite persistence and optimized frontend build.


## 11. System Architecture
### Frontend
- React + React Router + Tailwind
- Public pages + admin pages + portal pages

### Backend
- Express routing by domain (`auth`, `admin`, `dashboard`, `actions`, `settings`)
- Middleware for JWT and role validation
- Permission utility layer for feature checks

### Data Layer
- SQLite tables for users, permissions, OTPs, notifications, audit logs, transfers, and deletion requests


## 12. Technology Stack
- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express
- Database: SQLite (`better-sqlite3`)
- Authentication: JWT + OTP
- Email: Nodemailer (Gmail app password)
- Mapping: Mapbox GL, React Leaflet


## 13. Database Design Summary
Core entities include:
- `users`
- `user_permissions`
- `otp_codes`
- `password_reset_tokens`
- `notifications`
- `audit_logs`
- `admin_transfers`
- `deletion_requests`
- `user_settings`

Design highlights:
- Role (`admin`, `user`) and status (`pending`, `approved`, `rejected`) are tracked separately.
- Permissions are stored per approved user for feature-level control.
- Governance actions are tracked for accountability.


## 14. Security and Access Control
- OTP required for login completion.
- JWT required for protected routes.
- Admin routes require DB-verified admin role.
- Dashboard routes require approved status and feature permissions.
- Audit logs capture security-sensitive actions.
- Deletion and admin transfer flows include multi-step confirmation.


## 15. Key Workflows
### 15.1 Access Request Workflow
Signup -> Pending request -> Admin review -> Approve/Reject -> User notified.

### 15.2 Secure Login Workflow
Credentials -> OTP generation/email -> OTP verification -> JWT session.

### 15.3 Permission Management Workflow
Admin assigns permissions -> User portal nav and backend access updated accordingly.

### 15.4 Governance Workflows
- Admin transfer: dual confirmation and timed completion.
- Account deletion: admin initiation + user verification + timeout logic.


## 16. User Interface and Screens
Use this section to place screenshots of all screens.

### 16.1 Public and Authentication Screens
1. Welcome Screen  
![Welcome Screen](./screenshots/01-welcome.png)

2. Login Screen  
![Login Screen](./screenshots/02-login.png)

3. OTP Verification Screen  
![OTP Screen](./screenshots/03-login-otp.png)

4. Sign Up / Access Request Screen  
![Signup Screen](./screenshots/04-signup.png)

5. Request Submitted Success State  
![Request Submitted](./screenshots/05-request-submitted.png)

6. Reset Password Screen  
![Reset Password](./screenshots/06-reset-password.png)

### 16.2 Admin Workspace Screens
1. Admin Overview  
![Admin Overview](./screenshots/10-admin-overview.png)

2. Admin Analytics  
![Admin Analytics](./screenshots/11-admin-analytics.png)

3. Admin AI Insights  
![Admin AI Insights](./screenshots/12-admin-ai-insights.png)

4. Admin Predictions  
![Admin Predictions](./screenshots/13-admin-predictions.png)

5. Admin Airports  
![Admin Airports](./screenshots/14-admin-airports.png)

6. Admin Data Management  
![Admin Data](./screenshots/15-admin-data.png)

7. Admin Users - Requests  
![Admin Users Requests](./screenshots/16-admin-users-requests.png)

8. Admin Users - Permissions Matrix  
![Admin Users Permissions](./screenshots/17-admin-users-permissions.png)

9. Admin Security  
![Admin Security](./screenshots/18-admin-security.png)

10. Admin Notifications  
![Admin Notifications](./screenshots/19-admin-notifications.png)

11. Admin Settings  
![Admin Settings](./screenshots/20-admin-settings.png)

### 16.3 User Portal Screens
1. User Portal Layout / Navigation  
![Portal Layout](./screenshots/30-portal-layout.png)

2. User Portal Overview  
![Portal Overview](./screenshots/31-portal-overview.png)

3. User Portal Analytics  
![Portal Analytics](./screenshots/32-portal-analytics.png)

4. User Portal AI Insights  
![Portal AI Insights](./screenshots/33-portal-ai-insights.png)

5. User Portal Predictions  
![Portal Predictions](./screenshots/34-portal-predictions.png)

6. User Portal Data  
![Portal Data](./screenshots/35-portal-data.png)

7. No Features Assigned State  
![No Features Assigned](./screenshots/36-portal-no-features.png)

### 16.4 Additional States and Flows
1. Pending Access Login Message  
![Pending State](./screenshots/40-pending-login-state.png)

2. Rejected Access Login Message  
![Rejected State](./screenshots/41-rejected-login-state.png)

3. Permission Denied Example  
![Permission Denied](./screenshots/42-permission-denied.png)


## 17. Testing and Validation
### Build Validation
- Frontend production build succeeds.
- Backend syntax checks succeed.

### Runtime Validation
- Health endpoint responds correctly.
- OTP login flow operational.
- Admin-only routes reject non-admin users.
- Feature-gated dashboard routes enforce permissions.
- Admin permission updates affect user access behavior.

### Current Quality Note
- Existing lint issues remain in parts of the legacy codebase and should be addressed as a quality improvement task.


## 18. Deployment and Environment Setup
1. Install dependencies (`npm install`, `cd server && npm install`).
2. Configure `server/.env`.
3. Start backend (`cd server && npm run dev` or `npm start`).
4. Start frontend (`npm run dev`).
5. Verify health (`GET /api/health`) and login flow.

Production recommendations:
- Disable OTP bypass.
- Use strong JWT secret.
- Restrict CORS origins.
- Securely manage secrets.


## 19. Challenges and Mitigations
### Challenge: Role and feature isolation
Mitigation: Added separate route layouts and backend feature gates.

### Challenge: Secure account governance
Mitigation: Implemented confirmation workflows (transfer/deletion) and auditing.

### Challenge: Usability across different user types
Mitigation: Dedicated admin and user interfaces with focused modules.


## 20. Limitations and Future Improvements
- Resolve all lint/code-quality issues and enforce clean CI checks.
- Add automated end-to-end tests.
- Add role templates with one-click permission bundles.
- Improve analytics depth and configurable KPI dashboards.
- Add notification center for non-admin users.
- Add observability metrics and structured logging dashboard.


## 21. Conclusion
AirApp delivers a secure and functional aviation operations platform with clear separation of responsibilities between administrators and non-admin users. It combines access governance, analytics visibility, and permission-controlled feature exposure in one system. The current implementation is operational and extensible, with clear next steps for quality hardening and enhancement.



