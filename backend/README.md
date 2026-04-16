# Earthquake Monitor — Backend

Spring Boot 3.2 · Java 21 · PostgreSQL 15

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | 21 | Must match `pom.xml` `<java.version>` |
| Maven | — | Included via `mvnw` wrapper, no install needed |
| PostgreSQL | 15+ | Or Docker Desktop to run it in a container |
| Internet | — | Outbound access to `earthquake.usgs.gov` |

---

## Quick Start

### Option A — Docker PostgreSQL (recommended)

```bash
# 1. Start the database container (from the backend/ directory)
docker compose up -d

# 2. Start the app
# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

### Option B — Local PostgreSQL

1. Make sure PostgreSQL is running on `localhost:5432`
2. Create the database:
   ```sql
   CREATE DATABASE earthquakedb;
   ```
3. Start the app:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```

### Run Tests

Tests use an in-memory H2 database — no PostgreSQL required.

```bash
.\mvnw.cmd test
```

---

## Application URLs

| | URL |
|-|-----|
| App | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |

---

## REST API Endpoints

All responses use the format:

```json
{ "success": true, "message": "...", "data": [...] }
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/earthquakes` | Get all stored earthquakes |
| `GET` | `/api/earthquakes/{id}` | Get single earthquake by ID |
| `POST` | `/api/earthquakes/fetch` | Sync from USGS, clear DB, save filtered data |
| `GET` | `/api/earthquakes/filter?minMag=X` | Filter by minimum magnitude |
| `GET` | `/api/earthquakes/filter/after?time=T` | Filter events after ISO 8601 timestamp |
| `GET` | `/api/earthquakes/filter/combined?minMag=X&after=T` | Combined magnitude + time filter |
| `DELETE` | `/api/earthquakes/{id}` | Delete a specific earthquake record |

---

## Auto-Refresh Scheduler

The backend automatically syncs fresh data from USGS on a configurable interval.

```properties
# application.properties
earthquake.scheduler.enabled=true
earthquake.scheduler.rate-minutes=5
```

> The scheduler is disabled during tests and only runs in the main Spring Boot runtime.

---

## Filter Logic

On each USGS sync the backend:

1. Fetches the GeoJSON feed from USGS (last 1 hour of events)
2. Skips features with `null` magnitude or `null` time
3. Filters by greater than specific magnitude and/or filtering after a specific time 
4. Deletes all existing DB records, then inserts the filtered batch

To change the threshold:

```properties
earthquake.filter.min-magnitude=1.0
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8080 already in use | Kill the process or add `server.port=8081` to `application.properties` |
| Connection refused (PostgreSQL) | Run `docker compose up -d` or verify PostgreSQL is running on port 5432 |
| `package jackson.datatype does not exist` | Add `jackson-datatype-jsr310` dependency to `pom.xml` |
| Only 1 earthquake saved | Lower `earthquake.filter.min-magnitude` to `1.0` in `application.properties` |
| USGS API not reachable | Check internet access — app returns HTTP 503 with an error message |