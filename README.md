# Earthquake Monitor

A full-stack web application that fetches, filters, stores and visualizes real-time earthquake data from the USGS public API.

**Stack:** Java 21 · Spring Boot 3.2 · PostgreSQL 15 · React 18 · Vite · Leaflet · Docker

---

## Project Structure

```
Earthquake/
├── backend/          Spring Boot REST API
├── frontend/         React + Vite UI
├── database/         docker-compose.yml  (DB only)
├── docker_app/       docker-compose.yml  (full stack — recommended)
└── README.md
```

---

## Option 1 — Full Stack with Docker (recommended)

Starts **PostgreSQL + Backend + Frontend** with a single command.

```bash
cd docker_app
docker compose up -d
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3005 |
| Backend  | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

Stop everything:

```bash
docker compose down
```

---

## Option 2 — Run Locally (manual)

### Step 1 — Start the Database

```bash
cd database
docker compose up -d
```

This starts PostgreSQL 15 on `localhost:5432` with:

| | |
|-|-|
| Database | `earthquakedb` |
| User | `postgres` |
| Password | `postgres` |

### Step 2 — Start the Backend

**Requirements:** Java 21, Maven (included via `mvnw` wrapper)

```bash
cd backend

# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Backend starts at `http://localhost:8080`

### Step 3 — Start the Frontend

**Requirements:** Node.js 18+, npm 9+

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:3005`

---

## Database Configuration

Default settings in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/earthquakedb
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
```

> Hibernate creates the `earthquakes` table automatically on first run.

Override without editing files (PowerShell):

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/earthquakedb"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="postgres"
.\mvnw.cmd spring-boot:run
```

---

## REST API Endpoints

All responses: `{ "success": true, "message": "...", "data": [...] }`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/earthquakes` | Get all stored earthquakes |
| `GET` | `/api/earthquakes/{id}` | Get single earthquake by ID |
| `POST` | `/api/earthquakes/fetch` | Sync from USGS, clear DB, save filtered data |
| `GET` | `/api/earthquakes/filter?minMag=X` | Filter by minimum magnitude |
| `GET` | `/api/earthquakes/filter/after?time=T` | Filter events after ISO 8601 timestamp |
| `GET` | `/api/earthquakes/filter/combined?minMag=X&after=T` | Combined filter |
| `DELETE` | `/api/earthquakes/{id}` | Delete a specific record |

---

## Filter Logic

On each USGS sync the backend:

1. Fetches the GeoJSON feed — last 1 hour of events
2. Skips features with `null` magnitude or `null` time
3. Keeps only events with magnitude **≥ 1.0**
4. Deletes all existing DB records, then saves the filtered batch

Configurable in `application.properties`:

```properties
earthquake.filter.min-magnitude=1.0
```

---

## Auto-Refresh Scheduler

The backend automatically syncs fresh data from USGS every 5 minutes:

```properties
earthquake.scheduler.enabled=true
earthquake.scheduler.rate-minutes=5
```

---

## Running Tests

Tests use an in-memory H2 database — no PostgreSQL required:

```bash
cd backend
.\mvnw.cmd test
```

---

## Assumptions

- The USGS `all_hour` feed is the data source — it updates continuously
- Only earthquakes with magnitude **≥ 1.0** are stored (configurable)
- On each sync, all existing records are deleted and replaced to avoid duplicates
- Features with `null` magnitude or `null` time in the GeoJSON feed are silently skipped
- The scheduler is disabled during tests

---

## Optional Improvements Implemented

| Feature | Details |
|---------|---------|
| Map visualization | Interactive dark Leaflet map with color-coded circle markers |
| Delete record | Delete individual earthquake records via UI or API |
| Auto-refresh scheduler | Backend syncs USGS data every 5 minutes automatically |
| Swagger / OpenAPI | Available at `/swagger-ui.html` |
| Combined filter | Filter by both magnitude and time in one request |
| Docker support | Full stack runs with a single `docker compose up -d` |
| Global exception handler | Specific HTTP status codes for each error type |
| Stats dashboard | Total events, max/avg magnitude, M4+ count |
| Tsunami flag | Displayed in table when tsunami warning is active |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8080 in use | Add `server.port=8081` to `application.properties` |
| PostgreSQL connection refused | Run `docker compose up -d` in the `database/` folder |
| Only 1 earthquake saved | Lower `earthquake.filter.min-magnitude` to `1.0` |
| Frontend 500 error (Docker) | Proxy target in `vite.config.js` must be `http://earthquake-backend:8080` |
| Frontend 500 error (local) | Proxy target in `vite.config.js` must be `http://localhost:8080` |
| Container name conflict | Run `docker rm -f earthquake-db` then `docker compose up -d` |
