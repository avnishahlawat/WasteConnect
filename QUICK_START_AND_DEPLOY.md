# WasteConnect - Quick Start, Architecture & Deployment Cheat Sheet

This document contains everything you need to know to run, demonstrate, and deploy this project as a complete **MERN Stack** platform in **pure JavaScript and React JSX**.

---

## 1. Project Directory Structure (Pure MERN Stack)

```text
wasteconnect/
├── client/                     # Frontend (React 18 JSX + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                # API client functions (Axios)
│   │   ├── components/         # Reusable UI widgets & map pickers
│   │   ├── contexts/           # AuthContext & state management
│   │   ├── pages/              # Citizen, Collector, Authority, Admin Pages
│   │   │   ├── admin/          # UsersPage (+ Add User), Dashboard, Pickups
│   │   │   ├── auth/           # LoginPage (1-Click Demo & Google Sign-In)
│   │   │   └── citizen/        # MyPickups (Clean decimal weights)
│   │   ├── App.jsx             # React Router v6 setup
│   │   └── main.jsx            # Entry point
│   ├── vercel.json             # Vercel SPA rewrite configuration (fixes 404s)
│   ├── vite.config.js          # Vite config
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── package.json
│
├── server/                     # Backend (Node.js + Express.js in pure JavaScript)
│   ├── src/
│   │   ├── controllers/        # Request handlers (authController, adminController, etc.)
│   │   ├── middleware/         # Auth (JWT), RBAC, error handling
│   │   ├── models/             # Mongoose schemas (User, Issue, Pickup, Area, etc.)
│   │   ├── routes/             # Express routes (/auth, /citizen, /admin, etc.)
│   │   ├── seed/               # Database seed script with Indian personas & clean weights
│   │   ├── services/           # Business logic & hotspot scoring
│   │   ├── app.js              # Express application setup
│   │   └── server.js           # Server entrypoint with auto-initialized default Admin
│   ├── .env                    # Backend secrets (MONGODB_URI, JWT_SECRET)
│   └── package.json            # Node.js ES Modules ("type": "module")
│
├── vercel.json                 # Root Vercel SPA rewrite rules
├── MERN_ARCHITECTURE.md        # Comprehensive MERN Architecture Guide & Viva Defense Manual
└── QUICK_START_AND_DEPLOY.md   # This cheat sheet
```

---

## 2. Your Database & Credentials

### MongoDB Atlas Connection
- **Cluster**: `Cluster0` (`ac-7nbo9pm-shard-00-02.qglr56y.mongodb.net`)
- **Database User**: `offlinefool7777_db_user`
- **Database Name**: `wasteconnect`
- **Connection URI**:
  ```text
  mongodb+srv://offlinefool7777_db_user:LVTL2Bj6TEVdcIXj@cluster0.qglr56y.mongodb.net/wasteconnect?retryWrites=true&w=majority&appName=Cluster0
  ```

---

## 3. How to Run Locally

### Start Backend
Open a terminal in `server`:
```powershell
npm run dev
# Or with standard Node:
node src/server.js
```
- API Base URL: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

### Start Frontend
Open a terminal in `client`:
```powershell
npm run dev
```
- Web app: `http://localhost:5173`

### (Optional) Re-seed the Database
To reset the test data with authentic Indian personas and clean weights:
```powershell
cd server
npm run seed
```

---

## 4. Demo Accounts for Presentations

The login page supports **"Continue with Google"** with a modern account chooser, native browser email selection, and standard email/password authentication:

| Persona | Name | Email | Password | What to Demo |
|---|---|---|---|---|
| **Admin** | Rajiv Mehta | `admin@wasteconnect.in` | `Admin@123!` | System-wide Hotspot Score map, **User management (+ Add User)**, and audit logs. |
| **Admin (Legacy)** | System Admin | `admin@wasteconnect.io` | `Admin@123!` | Default fallback admin account. |
| **Authority** | Neha Gupta | `neha.gupta@greenfield.gov.in` | `Password123!` | Triage civic issues, dispatch field teams, review SLAs. |
| **Collector** | Vikram Singh | `vikram.singh@wasteconnect.in` | `Password123!` | Accept pickups from the available job pool; move tasks through the state machine. |
| **Collector** | Rajesh Kumar | `rajesh.kumar@wasteconnect.in` | `Password123!` | Review collection histories and weight records. |
| **Citizen** | Aarav Sharma | `aarav.sharma@example.com` | `Password123!` | Request household pickup with clean weights (`9.6 kg`), report street litter with map pin and photo. |
| **Citizen** | Priya Patel | `priya.patel@example.com` | `Password123!` | Track household collection status and view timeline. |
| **Personal Email / Google** | Anyone | Any personal email (e.g. `you@gmail.com`) | Self-registered or Google 1-click | Instant Citizen account creation with personal email. |

---

## 5. Deployment Guide (Free)

### Step A: Push to GitHub
Make sure your terminal is inside the project root:
```powershell
git add .
git commit -m "WasteConnect MERN Pure JS conversion, Vercel SPA fix, Indian personas, and clean weight display"
git push origin main
```

### Step B: Backend on Render.com (Free)
1. New **Web Service** on [render.com](https://render.com) connected to your GitHub repo.
2. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`
3. Environment Variables:
   - `MONGODB_URI` = `mongodb+srv://offlinefool7777_db_user:LVTL2Bj6TEVdcIXj@cluster0.qglr56y.mongodb.net/wasteconnect?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET` = `wasteconnect_super_secret_jwt_key_2026`
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `*` (or your Vercel URL)
4. Copy your backend URL: `https://wasteconnect-api-xxxx.onrender.com`

### Step C: Frontend on Vercel (Free)
1. Add **New Project** on [vercel.com](https://vercel.com) from your GitHub repo.
2. Settings:
   - Root Directory: `client`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variable:
   - `VITE_API_URL` = `https://wasteconnect-api-xxxx.onrender.com/api`
4. Deploy! The included `vercel.json` ensures that direct visits to `/login`, `/register`, or `/admin/dashboard` never return 404.
