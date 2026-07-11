# EMS Admin Backend

Express + MongoDB (MERN) API for the MediTrack EMS Admin panel.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (bcrypt password hashing)
- CORS, Morgan logging, dotenv

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

## Setup

```bash
cd backend
npm install
```

Copy the environment file and adjust if needed:

```bash
cp .env.example .env
```

`.env` values:

| Key | Description |
|-----|-------------|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:5173`) |

## Seed the database

Loads the same data currently mocked in the frontend (`src/data/*`):

```bash
npm run seed
```

Login credentials created by the seed:

| User ID | Password | Role |
|---------|----------|------|
| `ADMIN001` | `admin123` | Super Admin |
| `MGR001` | `manager123` | Branch Manager |

## Run

```bash
npm run dev     # nodemon (development)
npm start       # node (production)
```

Health check: `GET http://localhost:5000/api/health`

## API Endpoints

### Auth
- `POST /api/auth/login` — `{ userId, password }`
- `GET /api/auth/me` — current user (requires token)

### Branches (protected)
- `GET /api/branches` — `?search=`
- `POST /api/branches`
- `GET /api/branches/:id`
- `PUT /api/branches/:id`
- `DELETE /api/branches/:id`

### Employees (protected)
- `GET /api/employees` — `?search=&branch=&designation=&status=`
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

### Attendance (protected)
- `GET /api/attendance` — `?date=&status=&method=`
- `GET /api/attendance/stats` — `?date=`
- `GET /api/attendance/history/:employeeId`
- `POST /api/attendance` — upsert by employee + date

### Tracking
- `GET /api/tracking/live` (protected)
- `GET /api/tracking/stats` (protected)
- `GET /api/tracking/:employeeId` (protected)
- `POST /api/tracking/update` — location update from field device

### Dashboard (protected)
- `GET /api/dashboard/stats`

## Auth usage

Send the token on protected routes:

```
Authorization: Bearer <token>
```

## Folder Structure

```text
backend/
├── config/          # db connection
├── controllers/     # route handlers
├── middleware/      # auth, error handling
├── models/          # Mongoose schemas
├── routes/          # Express routers
├── seed/            # seed data + script
├── utils/           # token, asyncHandler
├── .env             # environment (not committed)
└── server.js        # entry point
```
