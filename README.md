# Plant Care Reminder 🌱

A plant watering tracker built with React, Vite, Express, and MongoDB Atlas using Mongoose.

## Requirements

- Node.js 18 or newer and npm
- A MongoDB Atlas cluster and database user

## Configure MongoDB Atlas

1. In Atlas, create or select a cluster and create a database user with read/write access.
2. Add the address of the machine running the API to the cluster's Network Access allowlist.
3. Copy the application connection string from **Connect → Drivers**. Replace the password placeholder with the database user's password; URL-encode special characters in the password.
4. Put the complete URI in `server/.env` as `MONGODB_URI`. The backend selects the `plantCareDB` database regardless of the database name in the URI. Do not put this URI in the client or commit it.
5. The backend creates the `plants` and `careLogs` collections when it connects. Atlas transactions require a replica set; Atlas clusters provide this support.

The committed `server/.env.example` contains placeholders only. The root `.gitignore` excludes `.env` files. Set `PORT` to `5000` or another available backend port.

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

The API runs on `http://localhost:5000` by default. `GET /api/health` pings MongoDB and reports the selected database. The server will not start if the connection URI is missing or the database cannot be reached.

## API

- `GET /api/health` — MongoDB connectivity and selected database
- `POST /api/plants` — create a plant
- `GET /api/plants` — list plants with calculated watering status
- `GET /api/plants/attention` — due and overdue plants
- `GET /api/plants/:id` — retrieve one plant
- `PUT /api/plants/:id` — update plant fields
- `DELETE /api/plants/:id` — delete a plant and its care logs in a transaction
- `POST /api/plants/:id/water` — update `lastWatered` and add a care log in a transaction
- `GET /api/plants/:id/logs` — history for one plant
- `GET /api/logs` — care history for all plants

Plant IDs are MongoDB ObjectIds. Watering intervals are whole numbers of days. Dates entered by the app are stored at the start of their UTC calendar day; watering log timestamps default to the current time.

## Verify the database and API

After setting a real Atlas URI and starting the backend, check the connection:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

The response should report `status: ok` and `database: plantCareDB`. In Atlas, select `plantCareDB` in Data Explorer to verify that both collections exist.

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
