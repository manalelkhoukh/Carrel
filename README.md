# Carrel

A library seat reservation system — book a real seat in a real room, for a real time slot, with no double-bookings. Built as a full-stack learning project: a PostgreSQL/Express/Node backend and a React Native (Expo) mobile app.

## Features

**Reservations**
- Browse library rooms and see live seat availability
- Book a seat for a fixed 2-hour time slot within library hours (8am–8pm), today or tomorrow
- Server-side conflict prevention — a seat can never be double-booked for an overlapping time, enforced at the database level
- View and cancel your own reservations at any time, including mid-session

**Study tools**
- Persistent to-do list
- Pomodoro focus timer
- A live session screen with a before/during/after countdown for your booked seat
- A foreground vibration alarm when your session ends
- Ember — a small mascot with contextual encouragement while you study

**Accounts & admin**
- Signup/login with hashed passwords and JWT authentication
- Admin dashboard for managing rooms, seats, and reservations

## Tech stack

| Layer | Technology |
|---|---|
| Database | PostgreSQL, with a `gist` exclusion constraint preventing overlapping reservations |
| Backend | Node.js, Express |
| Auth | JWT, bcrypt |
| Mobile app | React Native via Expo, React Navigation |
| Local persistence | Expo SecureStore (auth), AsyncStorage (to-do list) |

## Project structure

```
backend/
  src/
    controllers/   # request handlers
    routes/        # Express route definitions
    middleware/     # auth, admin-role checks
    db/            # database connection pool
    utils/         # shared logic (e.g. time-slot generation)
  migrations/      # incremental SQL changes to an existing database
  schema.sql       # full schema for a fresh database

frontend/
  src/
    screens/       # one file per app screen
    components/    # shared UI pieces (buttons, mascot, etc.)
    navigation/     # React Navigation setup
    config/        # API base URL resolution
    theme.js       # shared colors, fonts, spacing
```

## Getting started

### Prerequisites
- Node.js
- PostgreSQL, running locally
- Expo Go on a phone, or an Android/iOS simulator

### Backend setup

```
cd backend
npm install
```

Create a database and load the schema:

```
createdb library_seat_reservation
psql -d library_seat_reservation -f schema.sql
```

Apply any migrations in `migrations/`, in order:

```
psql -d library_seat_reservation -f migrations/001_set_library_hours.sql
```

Copy `.env.example` to `.env` and fill in your own values:

```
cp .env.example .env
```

Start the server:

```
npm start
```

The API runs on `http://localhost:3000` by default.

### Frontend setup

```
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone. The app automatically detects your computer's local network address — no manual IP configuration needed.

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in, receive a JWT |
| GET | `/api/rooms` | List all rooms |
| GET | `/api/rooms/:roomId/slots` | List today's and tomorrow's bookable time slots for a room |
| GET | `/api/rooms/:roomId/seats?start_time=&end_time=` | Seat availability for a specific time range |
| POST | `/api/reservations` | Book a seat for a valid time slot |
| GET | `/api/reservations/me` | List your own reservations |
| PATCH | `/api/reservations/:id/cancel` | Cancel your own reservation |
| POST | `/api/admin/rooms` | Create a room (admin) |
| POST | `/api/admin/rooms/:roomId/seats` | Add a seat to a room (admin) |
| PATCH | `/api/admin/seats/:seatId` | Activate/deactivate a seat (admin) |
| GET | `/api/admin/reservations` | List all reservations (admin) |
| DELETE | `/api/admin/reservations/:id` | Cancel any reservation (admin) |

## Development notes

This project doubles as a software engineering learning exercise — [`LEARNING_NOTES.md`](./LEARNING_NOTES.md) is a running log of concepts, decisions, bugs, and fixes from building it, written up session by session.

## License

Not yet licensed for reuse.
