# Plant Care Reminder 🌱

A beginner-friendly plant watering tracker built with React, Vite, Express, and Supabase (Postgres).

## Requirements

- Node.js 18 or newer and npm
- A Supabase project

## Connect Supabase

The project URL and publishable key are configured in `server/.env`. The publishable key is meant to identify the project; it is not a database password or a secret service-role key. Keep all Supabase access in the backend.

1. Open your Supabase project and go to **SQL Editor → New query**.
2. Open `server/supabase-schema.sql`, paste its contents into the SQL Editor, and run it. This creates the `plants` and `care_logs` tables, row-level security policies, and an atomic watering function.
3. Confirm `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `server/.env` match your Supabase project. Never put a secret/service-role key in the frontend.
4. Start the server. `GET /api/health` and the startup message confirm the tables are reachable.

This MVP has no sign-in screen, so the SQL policies intentionally allow anonymous users to read and change the plant data. This is suitable only for a private demo. Before deploying publicly, add Supabase Auth and restrict row-level policies to each user's records.

The root `.gitignore` excludes `.env` files. `server/.env.example` shows the required variable names without credentials.

## Install and run

Open two terminals from the project root:

```powershell
cd server
npm install
npm run dev
```

```powershell
cd client
npm install
npm run dev
```

Open the Vite URL printed in the client terminal (normally `http://localhost:5173`). The API runs on `http://localhost:5000` by default. To change the frontend API URL, set `VITE_API_URL` in `client/.env` (for example `http://localhost:5000/api`).

Production commands:

```powershell
cd server
npm start
```

```powershell
cd client
npm run build
npm run preview
```

## Using the app

1. Add a plant with its type, watering interval, last watered date, and optional notes.
2. Use **My Plants** to view calculated next watering dates and status, edit details, remove a plant, or mark it watered.
3. The dashboard summarizes plants due today, overdue plants, upcoming reminders, and recently watered plants.
4. **Care History** shows saved watering records. Deleting a plant also deletes its care logs.

Dates use UTC calendar days to avoid local timezone shifts. “Mark as Watered” records the current UTC calendar date and creates a history entry in one database transaction.

## API

- `GET /api/health` — API and Supabase health
- `POST /api/plants` — create a plant
- `GET /api/plants` — list plants with calculated watering status
- `GET /api/plants/attention` — due and overdue plants
- `GET /api/plants/:id` — get a plant
- `PUT /api/plants/:id` — update a plant
- `DELETE /api/plants/:id` — delete a plant and its care logs
- `POST /api/plants/:id/water` — update watering date and create a care log
- `GET /api/plants/:id/logs` — history for one plant
- `GET /api/logs` — care history for all plants

## Validation and testing

Plant names and types are required; watering intervals must be whole numbers from 1 to 3650 days, and dates must be valid calendar dates. The UI displays loading, validation, and API error states. You can manually test create, list, edit, delete, watering, attention sorting, and care history in the browser.

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

No sample records are inserted automatically.
