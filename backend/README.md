# Earthquake Monitor — Backend

Spring Boot 3.2 · Java 21 · PostgreSQL 15

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | 21 | Must match `pom.xml` `<java.version>` |
| Maven | — | Included via `mvnw` wrapper, no install needed |
| PostgreSQL | 15+ | Or Docker Desktop to run it in a container |
| Docker | optional | Only needed for the Dockerized DB option |
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

## Database Configuration

Default settings are in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/earthquakedb
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
```

> **Note:** Hibernate creates the `earthquakes` table automatically on first run. No SQL migration scripts needed.

### Docker database details

| | |
|-|-|
| DB name | `earthquakedb` |
| User | `postgres` |
| Password | `postgres` |
| Port | `5432 → 5432` |

### Override settings without editing files

```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/earthquakedb"
$env:SPRING_DATASOURCE_USERNAME="postgres"
$env:SPRING_DATASOURCE_PASSWORD="postgres"
.\mvnw.cmd spring-boot:run
```

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
3. Keeps only events with magnitude **≥ 1.0** (configurable)
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