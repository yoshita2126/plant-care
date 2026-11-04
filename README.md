# Plant Care Reminder 🌱

A plant watering tracker built with React, Vite, Express, and Supabase.

## Requirements

- Node.js 22 or newer and npm
- A Supabase project

## Configure Supabase

1. In the Supabase project, open **SQL Editor** and run the contents of [`server/supabase.sql`](./server/supabase.sql). This creates the tables and the atomic watering function.
2. Set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in `server/.env`, using the project URL and a secret key from **Project Settings → API Keys**. The secret key is only for the backend; never put it in the client or commit it.
3. Keep `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_JWKS_URL` out of this server configuration unless you add browser-side Supabase access or JWT authentication. This app currently calls its Express API without Supabase Auth.

To add eight example plants, run [`server/seed-plants.sql`](./server/seed-plants.sql) in the Supabase SQL Editor after creating the tables. The seed is safe to rerun and will not duplicate those rows.

The committed `server/.env.example` contains placeholders only. The root `.gitignore` excludes `.env` files. Set `PORT` to `5000` or another available backend port. The secret key was included in the setup message; rotate it in Supabase before using it.

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

The API runs on `http://localhost:5000` by default. `GET /api/health` checks Supabase access to the `plants` table. The server will not start if Supabase cannot be reached or the required configuration is missing.

## Deploy to Render

The root `render.yaml` defines a Node API web service and a static frontend. In Render, create a **Blueprint** from this GitHub repository and select the `main` branch. Render builds both services and configures the frontend API URL and backend CORS origin.

Run [`server/supabase.sql`](./server/supabase.sql) in the Supabase SQL Editor before deployment. When prompted, enter `SUPABASE_URL` and `SUPABASE_SECRET_KEY` as environment values for the `plant-care-api` service. Treat the secret key as a password: never commit it or add it to the frontend service. The API health check is `/api/health`.

## API

- `GET /api/health` — Supabase connectivity
- `POST /api/plants` — create a plant
- `GET /api/plants` — list plants with calculated watering status
- `GET /api/plants/attention` — due and overdue plants
- `GET /api/plants/:id` — retrieve one plant
- `PUT /api/plants/:id` — update plant fields
- `DELETE /api/plants/:id` — delete a plant and its care logs in a transaction
- `POST /api/plants/:id/water` — update `lastWatered` and add a care log in a transaction
- `GET /api/plants/:id/logs` — history for one plant
- `GET /api/logs` — care history for all plants

Plant IDs are Supabase UUIDs. Watering intervals are whole numbers of days. Dates entered by the app are stored as calendar dates; watering log timestamps default to the current time. Deleting a plant also deletes its care logs via a database foreign-key cascade.

## Verify the database and API

After setting the Supabase environment variables, running the SQL setup, and starting the backend, check the connection:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

The response should report `status: ok` and `database: supabase`. In the Supabase Table Editor, verify that `plants` and `care_logs` exist.

Exercise the endpoints using the running API or the web app. For example:

```powershell
$plant = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/plants -ContentType "application/json" -Body '{"name":"Rose","type":"Flowering Plant","wateringInterval":3,"lastWatered":"2026-11-01","notes":"Indirect sunlight"}'
$plantId = $plant.plant._id
Invoke-RestMethod "http://localhost:5000/api/plants/$plantId"
Invoke-RestMethod -Method Put -Uri "http://localhost:5000/api/plants/$plantId" -ContentType "application/json" -Body '{"notes":"Keep in indirect sunlight"}'
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/plants/$plantId/water" -ContentType "application/json" -Body '{}'
Invoke-RestMethod "http://localhost:5000/api/plants/$plantId/logs"
Invoke-RestMethod -Method Delete -Uri "http://localhost:5000/api/plants/$plantId"
```

The plant and its watering history should be removed together. No sample data or local/mock database is used.
