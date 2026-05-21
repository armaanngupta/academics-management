# Marksheet Management System

A full-stack web application for managing college marksheet records, admin access, and issuance tracking.

The app includes:
- a React frontend for login, dashboard, marksheet creation, filtering, editing, and admin management
- an Express and MongoDB backend for authentication, data storage, and reporting
- role-based access with `superadmin` and `admin`

## What The App Does

This project is built for institution-side marksheet operations. Admins can create and manage marksheet records, track whether they have been issued, search by student or roll number, and review summary data from the dashboard.

Superadmins can also manage other admin accounts.

## Features

- Secure admin login with JWT-based authentication
- MongoDB persistence for admins and marksheets
- Marksheet create, edit, delete, and issued-status toggle
- Search and advanced filtering for marksheet records
- Dashboard summary with recent activity and distribution data
- Superadmin-only admin management
- Dark mode support
- Responsive layout for desktop and smaller screens

## Tech Stack

- Frontend: React, React Router, Axios, Recharts
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT and bcrypt
- Styling: Plain CSS

## Project Structure

```text
marksheet-management/
|-- backend/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- .env.example
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/
|   |-- .env.example
|   `-- package.json
|-- API_DOCUMENTATION.md
|-- DEPLOYMENT.md
|-- MONGODB_SETUP.md
|-- QUICKSTART.md
|-- TESTING_GUIDE.md
`-- package.json
```

## Root Scripts

Run these from the project root:

- `npm run dev`: starts backend in watch mode and frontend dev server together
- `npm run start`: starts backend and frontend together without backend nodemon
- `npm run backend:dev`: starts only the backend in dev mode
- `npm run backend`: starts only the backend
- `npm run frontend`: starts only the frontend
- `npm run frontend:build`: builds the frontend
- `npm run install:all`: installs dependencies in both `backend` and `frontend`

`npm run dev` is the main one-command workflow.

## Setup

### 1. Install dependencies

From the root:

```bash
npm install
npm run install:all
```

`npm install` at the root installs the root helper dependency used to run both apps together. `npm run install:all` installs the actual frontend and backend app dependencies.

### 2. Configure backend environment

Create `backend/.env` from `backend/.env.example`.

Required values:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
```

### 3. Configure frontend environment

Create `frontend/.env` from `frontend/.env.example` if needed.

Example:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

Note: the current frontend API client in [frontend/src/api.js](frontend/src/api.js) is still hardcoded to `http://localhost:5000/api`, so production deployment should align with that file or update it to use the environment variable.

### 4. Start the app

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Authentication And Roles

- `superadmin`: can log in, manage marksheets, and create or delete other admins
- `admin`: can log in and manage marksheets

Admin data is stored in MongoDB, so deployed admins continue to exist as long as the deployed backend points to the same database.

## Main Screens

- Login
- Dashboard
- Marksheet library
- Create marksheet
- Admin management

## API Summary

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/register`

Marksheets:

- `GET /api/marksheets`
- `GET /api/marksheets/summary`
- `GET /api/marksheets/search`
- `GET /api/marksheets/:id`
- `POST /api/marksheets/add`
- `PUT /api/marksheets/:id`
- `DELETE /api/marksheets/:id`
- `PATCH /api/marksheets/:id/toggle-issued`

Admin management:

- `GET /api/admins`
- `POST /api/admins`
- `DELETE /api/admins/:id`

## Deployment Notes

- Keep `MONGODB_URI` pointed at the correct production database
- Keep `JWT_SECRET` stable across restarts unless you want existing sessions invalidated
- Rotate any secrets that were ever committed or shared accidentally
