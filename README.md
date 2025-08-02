# CAHN Project Tracking

A full-stack project tracking application with separate backend and frontend codebases.

---

## Project Structure

- `backend/` — Node.js API server
- `frontend/` — React frontend application

---

## Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

---

## Setup & Running

### 1. Clone the repository

```bash
git clone <repository-url>
cd cahnprojecttracking

### 2. Initial Dependencies

npm install
npm install --prefix backend
npm install --prefix frontend

## Make sure to run frontend and backend concurrently.
backend runs with npm run dev, and frontend runs with npm start


###Authentication
The frontend stores JWT token and user data in localStorage.

API requests include the token for protected endpoints.

On 401 errors, user is logged out automatically.


###Technologies
Backend: Node.js, Express (assumed)

Frontend: React, TailwindCSS, Axios

Tools: concurrently for running both servers simultaneously

###Notes
Proxy is configured in frontend/package.json for API calls during development.

TailwindCSS is configured via tailwind.config.js and postcss.config.js in the frontend.

Ensure to configure environment variables correctly before running.
