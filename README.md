# WasteConnect

**Civic Waste Intelligence and Municipal Operations Platform**

> Connecting communities to cleaner cities.

WasteConnect is a portfolio-grade full-stack platform that connects **Citizens**, **Collectors**, **Municipal Authority Staff**, and **Platform Administrators** through two primary workflows:

1. **Private/Household Waste Collection** — Citizens request pickups; collectors fulfill them
2. **Public Waste Issue Reporting** — Citizens report public issues; authorities triage, assign, and resolve

---

## Technology Stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Recharts, React Leaflet |
| Backend | Node.js, Express.js, TypeScript, REST API |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs, role-based access control |
| AI | Pluggable AIProvider (Mock / OpenAI / Gemini) |
| Maps | React Leaflet + OpenStreetMap |

---

## Project Structure

```
wc-02/
├── client/          # React + Vite frontend
├── server/          # Express + TypeScript backend
├── docs/            # Architecture & API documentation
├── .env.example     # Environment variable template
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas URI

### 1. Clone and install

```bash
git clone <repo-url>
cd wc-02
```

### 2. Configure environment

```bash
# Copy and fill in environment variables
cp .env.example server/.env
```

Required variables:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Long random string (use `openssl rand -hex 64`)
- `CLIENT_URL` — Frontend URL (default: `http://localhost:5173`)

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Seed the database

```bash
cd server && npm run seed
```

This creates the full Greenfield Municipal Region dataset including:
- 15 users (citizens, collectors, authority staff, admins)
- 5 service areas
- 10 waste categories
- 50+ pickup requests with full event history
- 50+ public issues with timelines
- Hotspot data, feedback, notifications, audit logs

### 5. Run in development

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

## Development Credentials

> These credentials are for development only. Do not use in production.

| Role | Email | Password |
|---|---|---|
| Citizen | maya.chen@example.com | Password123! |
| Citizen | rahul.sharma@example.com | Password123! |
| Citizen | priya.nair@example.com | Password123! |
| Collector | alex.martinez@wasteconnect.io | Password123! |
| Collector | james.okonkwo@wasteconnect.io | Password123! |
| Collector | fatima.hassan@wasteconnect.io | Password123! |
| Authority | david.park@greenfield.gov | Password123! |
| Authority | sarah.johnson@greenfield.gov | Password123! |
| Authority | amir.khan@greenfield.gov | Password123! |
| Admin | admin@wasteconnect.io | Admin@123! |
| Admin | ops.admin@wasteconnect.io | Admin@123! |
| Admin | data.admin@wasteconnect.io | Admin@123! |

---

## Roles

| Role | Description |
|---|---|
| **Citizen** | Request waste pickups, report public issues, track resolutions |
| **Collector** | Accept and fulfill pickup requests, log collection details |
| **Authority** | Triage public issues, assign field teams, manage resolutions |
| **Admin** | Platform administration, user management, system analytics |

---

## Key Features

- **Pickup State Machine** — PENDING → AVAILABLE → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED
- **Issue State Machine** — REPORTED → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
- **WasteConnect Hotspot Score** — Transparent, formula-based scoring (0–100) per service area
- **Role-Based Authorization** — Server-side ownership + jurisdiction checks on every request
- **AI Layer** — Optional waste classification and issue categorization (graceful fallback)
- **Geospatial Maps** — Issue markers, hotspot visualization, service area overlays

---

## Hotspot Score Formula

```
hotspotScore = (
  reportFrequency     × 0.25  +
  unresolvedRatio     × 0.25  +
  severityScore       × 0.20  +
  recurrenceRate      × 0.15  +
  resolutionDelay     × 0.15
) × 100, clamped to 0–100
```

Score ranges: LOW (0–20) · MODERATE (21–40) · ELEVATED (41–60) · HIGH (61–80) · CRITICAL (81–100)

This is the "WasteConnect Hotspot Score" — a project-defined metric for development/research purposes only.

---

## API Documentation

See [`docs/api/`](./docs/api/) for full OpenAPI-style documentation.

Base URL: `http://localhost:5000/api`

Key endpoint groups:
- `POST /auth/register` · `POST /auth/login` · `GET /auth/me`
- `GET|POST /citizen/pickups` · `POST /citizen/issues`
- `GET /collector/available-pickups` · `POST /collector/pickups/:id/accept`
- `GET /authority/issues` · `PUT /authority/issues/:id/resolve`
- `GET /admin/dashboard` · `GET /admin/audit-logs`

---

## Docker

```bash
# Build and run everything
docker-compose up --build

# Seed (after containers start)
docker exec wasteconnect_server npm run seed
```

---

## Security

- JWT authentication on all protected routes
- bcrypt password hashing (rounds: 12)
- Helmet security headers
- CORS restricted to `CLIENT_URL`
- Rate limiting (100 req/15min)
- Server-side ownership + jurisdiction validation
- Input validation via Zod
- No sensitive data in API responses or logs

---

## Fictional Data Notice

All seed data (users, issues, pickup requests, locations) is entirely fictional and belongs to the imaginary "Greenfield Municipal Region." It does not represent any real municipality, individual, or organization.

---

## License

MIT
