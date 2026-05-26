# Marksheet Management System

A MERN stack application for college marksheet operations. It manages admins, students, marksheets, academic master data, and issued-status tracking from a single authenticated dashboard.

## Current Capabilities

- JWT-based admin login with `admin` and `superadmin` roles
- Dashboard summaries for unissued marksheets, recent activity, academic-year trends, and distribution charts
- Marksheet CRUD with enrollment number, roll number, marksheet number, academic year, session, university, degree, subject, type, result, remarks, and issued status
- Search and filtering for marksheets by academic fields, date range, issued status, and student/enrollment text
- Student directory with manual student creation and marksheet creation from a selected student
- Student autocomplete while creating marksheets
- Academic Data page for managing universities, sessions, degrees, and subjects
- Academic master data is stored in MongoDB, not in a frontend JSON file
- Superadmin-only admin account management
- Dark/light theme persistence

## Tech Stack

- Frontend: React, React Router, Axios, Recharts, plain CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT and bcrypt

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
|-- package.json
`-- README.md
```

## Setup

Install dependencies from the project root:

```bash
npm install
npm run install:all
```

Create `backend/.env` from `backend/.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/marksheet_management
PORT=5000
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
```

Create `frontend/.env` from `frontend/.env.example` if the backend URL differs:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

Start both apps:

```bash
npm run dev
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Scripts

Run these from the project root:

- `npm run dev`: start backend in watch mode and frontend together
- `npm run start`: start backend and frontend together
- `npm run backend:dev`: start only the backend with nodemon
- `npm run backend`: start only the backend
- `npm run frontend`: start only the frontend
- `npm run frontend:build`: build the frontend
- `npm run install:all`: install backend and frontend dependencies
- `npm run docker:up`: start Docker Compose services
- `npm run docker:down`: stop Docker Compose services

## Roles

- `admin`: can manage marksheets, students, and academic master data
- `superadmin`: has all admin access plus admin-account management

Admin session data is persisted in local storage so refreshes keep the current logged-in admin context until logout or token expiry.

## Main Screens

- Login
- Dashboard
- Create Marksheet
- Marksheets Library
- Students Directory
- Academic Data
- Admin Management

## Academic Data

Universities, sessions, degrees, and subjects are stored in MongoDB through the `Academic` model. The old `frontend/src/data/academics.json` file has been removed and is no longer used by the app.

Academic Data access is available to all logged-in admins:

- `GET /api/academics`
- `PUT /api/academics`

## API Summary

Auth:

- `POST /api/auth/login`
- `POST /api/auth/register` superadmin only

Marksheets:

- `GET /api/marksheets`
- `GET /api/marksheets/summary`
- `GET /api/marksheets/search`
- `GET /api/marksheets/:id`
- `POST /api/marksheets/add`
- `PUT /api/marksheets/:id`
- `DELETE /api/marksheets/:id`
- `PATCH /api/marksheets/:id/toggle-issued`

Students:

- `GET /api/students`
- `POST /api/students`
- `GET /api/students/check`
- `GET /api/students/search`

Academic Data:

- `GET /api/academics`
- `PUT /api/academics`

Admin Management:

- `GET /api/admins` superadmin only
- `POST /api/admins` superadmin only
- `DELETE /api/admins/:id` superadmin only

## Deployment Notes

- Set `MONGODB_URI` to the production MongoDB database.
- Keep `JWT_SECRET` stable across backend restarts unless existing sessions should be invalidated.
- Set `REACT_APP_API_URL` to the deployed backend API URL before building the frontend.
- Academic master data must exist in MongoDB; it is no longer bundled as a static JSON file.
