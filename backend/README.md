# EMS Admin Backend

Express + MongoDB (MERN) API for the MediTrack EMS Admin panel.

Multi-tenant architecture: each company has one owner account and fully isolated data.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (bcrypt password hashing)
- CORS, Morgan logging, dotenv

## Prerequisites

- Node.js 18+
- MongoDB running locally or MongoDB Atlas URI

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

## Seed login credentials

| Email | Password |
|-------|----------|
| `owner@adilagencies.com` | `admin123` |

## API Endpoints

### Company (auth)
- `POST /api/company/create` — register new company + owner
- `POST /api/company/login` — `{ email, password }`
- `GET /api/company/profile` — protected
- `PUT /api/company/update` — protected
- `PUT /api/company/change-password` — protected

### Branches (protected, company-scoped)
- `GET /api/branches`
- `POST /api/branches`
- `GET /api/branches/:id`
- `PUT /api/branches/:id`
- `DELETE /api/branches/:id`

### Employees (protected, company-scoped)
- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

### Attendance (protected, company-scoped)
- `GET /api/attendance`
- `GET /api/attendance/stats`
- `GET /api/attendance/history/:employeeId`
- `POST /api/attendance`

### Tracking
- `GET /api/tracking/live` — protected
- `GET /api/tracking/stats` — protected
- `GET /api/tracking/:employeeId` — protected
- `POST /api/tracking/update` — field device update

### Dashboard (protected, company-scoped)
- `GET /api/dashboard/stats`

## Multi-tenant isolation

Every resource (Branch, Employee, Attendance, Tracking, Settings) belongs to a `company` ObjectId. All protected queries filter by `req.companyId` from the JWT.

## Auth

JWT payload: `{ userId, companyId }`

```
Authorization: Bearer <token>
```

## Folder Structure

```text
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── seed/
├── utils/
└── server.js
```
