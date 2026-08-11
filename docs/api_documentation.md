# IVTS Backend API Documentation

This document outlines the API endpoints provided by the IVTS Node.js backend. The API is mounted under the `/api/v1` prefix and is structured into several functional modules.

## Overview of Mounted Routes

The main application routes are configured in `backend-node/server/routes/app.routes.js`:

| Prefix | Source File | Description |
|---|---|---|
| `/api/v1/ivts` | `ivts.routes.js` | Core IVTS business logic (documents, requests, vehicles, CCTVs) |
| `/api/v1/mobile` | `mobile.routes.js` | Mobile application APIs (read-only data, emergency requests) |
| `/api/v1/ai-track` | `aiTrack.routes.js` | AI Vehicle Tracking endpoints |
| `/api/v1/setting` | `settings.routes.js` | System settings and configurations |
| `/api/v1/security` | `security.routes.js` | Permissions, roles, and security matrix |
| `/api/v1/` | `accounts.routes.js` | Accounts, users, and authentication (IAM integration) |

---

## Module Endpoints

### 1. IVTS Module (`/api/v1/ivts`)
Core business logic for vehicle tracking, requests, and emergency management. Protected by IAM authorization and permission guards.

**Documents:**
- `GET /documents` - List documents
- `GET /documents/stats` - Document statistics
- `POST /documents` - Create a document
- `PUT /documents/:id` - Update a document
- `DELETE /documents/:id` - Delete a document

**Vehicle Registration Requests:**
- `GET /requests` - List all vehicle requests
- `GET /requests/:id` - Get single vehicle request
- `POST /requests/submit` - Submit a new vehicle registration/renewal request
- `PUT /requests/:id/review` - Review (approve/reject) a request

**Vehicles & Ownership:**
- `GET /vehicles` - List registered vehicles
- `GET /vehicles/:id` - Get vehicle by ID
- `GET /owner-vehicles` - List vehicle ownerships
- `GET /owner-vehicles/:id` - Get ownership by ID
- `PATCH /owner-vehicles/:id/approve` - Approve ownership
- `PATCH /owner-vehicles/:id/reject` - Reject ownership
- `PATCH /owner-vehicles/:id/account-status` - Toggle ownership status

**CCTV Management:**
- `GET /cctvs` - List CCTV cameras (includes stream URLs)
- `GET /cctvs/:id` - Get CCTV camera by ID
- `GET /cctvs/:id/stream/:file` - Proxy HLS stream

**Tracking:**
- `GET /tracking/logs` - List raw tracking logs
- `GET /tracking/history` - List trip histories

**Emergency Reports:**
- `GET /emergency-reports` - List emergency reports
- `PUT /emergency-reports/:id/status` - Update report status

**Users:**
- `GET /users` - List local users from MongoDB

---

### 2. Mobile Module (`/api/v1/mobile`)
Dedicated APIs for the Flutter mobile application. These endpoints rely on local user state and JWT for mobile authentication (not web IAM session).

**Vehicles & Requests:**
- `GET /vehicles` - List user vehicles
- `GET /vehicles/:id` - Get vehicle details
- `GET /requests` - List request history for user
- `POST /requests` - Create a request from mobile
- `GET /requests/:id` - Request details

**Emergency Reports:**
- `GET /emergency-reports` - List user emergency reports
- `POST /emergency-reports` - Submit emergency report
- `GET /emergency-reports/:id` - Get emergency report details (with timeline)
- `PATCH /emergency-reports/:id` - Update status (e.g., mark RESOLVED)

**Notifications & History:**
- `GET /tracking/history` - List user trip history
- `GET /notifications` - List user notifications (derived from vehicle expiry and emergencies)

**Auth (Mobile):**
- `POST /auth/register` - Register a local mobile user
- `POST /auth/signin` - Sign in via local users or MFU IAM

**Mobile AI-Track Integration:**
- `GET /ai-track/cameras` - Read-only access to camera metadata
- `GET /ai-track/vehicles/recent` - Recent vehicles seen by AI
- `GET /ai-track/vehicles/full-route` - Vehicles visiting specific cameras
- `GET /ai-track/vehicle/:global_id/timeline` - Vehicle timeline & route
- `POST /ai-track/ownership/history` - Write user tracking history from Python
- `POST /ai-track/ownership/match` - Node-to-Python bridge for ownership match

---

### 3. AI-Track Module (`/api/v1/ai-track`)
General backend routes for AI vehicle tracking processing.

- `GET /cameras` - List AI Track cameras
- `GET /vehicles/recent` - List recently tracked vehicles
- `GET /vehicles/full-route` - Track full route of a vehicle
- `POST /register` - Register an AI tracked vehicle
- `GET /vehicle/:global_id/timeline` - Get tracking timeline for a specific vehicle

---

### 4. Accounts & Authentication (`/api/v1/`)
Manages system accounts, sessions, and multi-factor authentication. Handled by IAM proxy client.

**Authentication:**
- `POST /signin` - Web Admin Sign In
- `GET /auth/me` - Current user details
- `GET /auth/sessions` - List active sessions
- `POST /auth/logout` - Logout current session
- `POST /auth/2fa/request` - Request 2FA OTP
- `POST /auth/2fa/verify` - Verify 2FA OTP

**Account Directory:**
- `GET /accounts` - List accounts (IAM forwarded)
- `POST /accounts/invite` - Invite an account
- `PUT /accounts/:id` - Update an account
- `GET /accounts/:id/lifecycle` - Account lifecycle details

---

## Common Features

- **Standard Response Envelope:**
  ```json
  {
    "code": 20000,
    "message": "Success",
    "data": { ... }
  }
  ```
- **Error Response Envelope:**
  ```json
  {
    "code": 40000, // or 50000, 40400
    "message": "Error description"
  }
  ```
- **Authorization:** Web routes use `account.onCheckAuthorization` and `authorization.requirePermission` guards. Mobile routes handle auth separately.
