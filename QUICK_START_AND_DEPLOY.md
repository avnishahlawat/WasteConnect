# WasteConnect - Quick Start, Architecture & Deployment Cheat Sheet

This document contains everything you need to know to run, demonstrate, and deploy this project.

---

## 1. Project Directory Structure

```text
wc-02/
├── client/                     # Frontend (React 18 + Vite + Tailwind + TypeScript)
│   ├── src/
│   │   ├── api/                # API client functions (TanStack Query / Axios / Fetch)
│   │   ├── components/         # Reusable UI widgets & map pickers
│   │   ├── contexts/           # AuthContext & State management
│   │   ├── pages/              # Pages for Citizen, Collector, Authority, Admin
│   │   └── types/              # TypeScript definitions
│   ├── .env                    # Frontend environment (VITE_API_URL)
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth (JWT), RBAC, error handling
│   │   ├── models/             # Mongoose schemas (User, Issue, Pickup, Area, etc.)
│   │   ├── routes/             # Express route declarations
│   │   ├── seed/               # Mock data seed script
│   │   └── services/           # AI provider and business logic
│   ├── .env                    # Backend secrets (MONGODB_URI, JWT_SECRET)
│   └── package.json
│
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
Open a terminal in `wc-02/server`:
```powershell
npm run dev
```
- API URL: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

### Start Frontend
Open a terminal in `wc-02/client`:
```powershell
npm run dev
```
- Web app: `http://localhost:5173`

### (Optional) Re-seed the Database
If you ever want to reset test data back to clean state:
```powershell
cd server
npm run seed
```

---

## 4. Demo Accounts for Presentations

Use these pre-configured accounts to showcase every user role:

| Persona | Email | Password | What to Demo |
|---|---|---|---|
| **Citizen** | `maya.chen@example.com` | `Password123!` | Request household pickup; report street litter with map pin and photo. |
| **Collector** | `alex.martinez@wasteconnect.io` | `Password123!` | Accept pickups from the available job pool; move tasks through the state machine. |
| **Authority** | `david.park@greenfield.gov` | `Password123!` | Triage civic issues, dispatch field teams, review SLAs. |
| **Admin** | `admin@wasteconnect.io` | `Admin@123!` | System-wide Hotspot Score map, user management, and audit logs. |

---

## 5. Deployment Guide (Free)

### Step A: Push to GitHub
Make sure your terminal is inside `wc-02`:
```powershell
cd c:\Users\avnis\OneDrive\Desktop\AGI\wc-02
git init
git add .
git commit -m "WasteConnect initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/wasteconnect.git
git push -u origin main
```

### Step B: Backend on Render.com (Free)
1. New **Web Service** on [render.com](https://render.com) connected to your GitHub repo.
2. Settings:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
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
4. Deploy!
