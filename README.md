# RideIT — Cab & Bike Booking App (MERN)

RideIT is a full‑stack cab/bike booking website built with **React + Vite + Tailwind** (frontend) and **Node.js + Express + MongoDB** (backend). It supports **JWT authentication**, booking **cab/bike rides** (including **rental mode**), and viewing ride history.

---

## Tech Stack

**Frontend**
- React 19 + React Router
- Vite
- Tailwind CSS
- Axios

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

---

## Features

- User registration & login (JWT)
- Book rides as **cab** or **bike**
- Rental rides with **start/end time** validation
- Multiple payment methods: `cash`, `upi`, `card`
- “My Rides” dashboard (current / completed / cancelled)
- Update ride status (API-supported)

---

## Website Pages & Flow

- **Home (`/`)**
  - Main booking experience for Cab/Bike
  - Pickup/Drop selection from predefined locations
  - Fare calculation on the frontend
  - Creates a ride by calling the backend API

- **Register (`/register`)**
  - Create an account (name/phone/password required; email optional in UI)

- **Login (`/login`)**
  - Login using phone + password
  - JWT token is stored in `localStorage`

- **My Rides (`/my-rides`)**
  - Protected page (requires login)
  - Lists rides by status: CURRENT / COMPLETED / CANCELLED

---

## Project Structure

```
.
├─ client/                 # React frontend (Vite)
├─ server/                 # Express API server
└─ README.md
```

> Note: There is also a nested `client/client/` directory in this workspace. The main app uses `client/`.

---

## Prerequisites

- **Node.js 18+** (recommended: latest LTS)
- **MongoDB** running locally (or a remote MongoDB URI)

Recommended:
- npm 9+ (usually bundled with Node)

---

## Quick Start (Local Development)

### 1) Backend (API)

```bash
cd server
npm install
```

Create `server/.env`:

```env
JWT_SECRET=your_super_secret_key
```

Start the API:

```bash
npm run dev
```

The API runs on:
- `http://localhost:5000`

### 2) Frontend (Web)

In a second terminal:

```bash
cd client
npm install
npm run dev
```

The web app runs on (Vite default):
- `http://localhost:5173`

---

## How Auth Works (High Level)

- On login, the backend returns a JWT token.
- The frontend stores the token in `localStorage` under `token`.
- Axios attaches `Authorization: Bearer <token>` automatically (see `client/src/services/api.js`).
- Protected API routes validate the token and load the user.

---

## Configuration

### Database

The backend currently connects to MongoDB using a hard-coded URI:

- `mongodb://127.0.0.1:27017/cab_booking_db`

You can change it in `server/config/db.js` if you want to use a different database.

### API Base URL (Frontend)

The frontend Axios base URL is currently hard-coded in:

- `client/src/services/api.js` → `http://localhost:5000/api`

---

## Data Model (Summary)

### User

- `name`, `email`, `phone`, `password`, `role`

### Ride

- `mode`: `cab` | `bike`
- `rideType`: e.g. `Mini`, `SUV`, `Bike`, `Rental Bike`
- `pickup`, `drop` for normal rides
- `rentalStart`, `rentalEnd` for rental rides
- `fare` (calculated on frontend)
- `paymentMethod`: `cash` | `upi` | `card`
- `status`: `CURRENT` | `COMPLETED` | `CANCELLED`

---

## API Reference

Base URL:
- `http://localhost:5000/api`

### Auth

**Register**
- `POST /users/register`

Body:
```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "phone": "9999999999",
  "password": "secret"
}
```

**Login**
- `POST /users/login`

Body:
```json
{
  "phone": "9999999999",
  "password": "secret"
}
```

Response includes a JWT token:
```json
{ "token": "..." }
```

### Rides (Protected)

All ride endpoints require:

`Authorization: Bearer <token>`

**Create ride**
- `POST /rides`

Body (normal ride):
```json
{
  "mode": "cab",
  "rideType": "Mini",
  "pickup": "Lovely Professional University",
  "drop": "Law Gate",
  "fare": 60,
  "paymentMethod": "cash"
}
```

Body (rental ride):
```json
{
  "mode": "bike",
  "rideType": "Rental Bike",
  "rentalStart": 10,
  "rentalEnd": 12,
  "fare": 50,
  "paymentMethod": "upi"
}
```

**Get my rides**
- `GET /rides/my`

**Update ride status**
- `PUT /rides/:id/status`

Body:
```json
{ "status": "COMPLETED" }
```

Allowed statuses:
- `CURRENT`
- `COMPLETED`
- `CANCELLED`

---

## Scripts

### Frontend (`client/`)
- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build

### Backend (`server/`)
- `npm run dev` — start with nodemon
- `npm start` — start with node

---

## Security / Production Notes

This project is currently optimized for learning/local development.

- Passwords are stored/validated in plain text (not safe for production).
- MongoDB URI and frontend API base URL are hard-coded.

If you want, I can harden this project by adding password hashing (bcrypt), environment-based config, and basic request validation.

---

## Troubleshooting

- **401 Invalid token**: ensure `server/.env` contains `JWT_SECRET` and restart the API.
- **MongoDB connection failed**: ensure MongoDB is running and the URI in `server/config/db.js` is reachable.
- **Deploying to Linux**: some imports may be case-sensitive; verify model file names match the `require(...)` paths.

---

## Author

- Name: [Vivek Raj](https://github.com/vivekraj3456/)
- Project: RideIT
