# Earthquake Monitor — Database

PostgreSQL 15 · Docker

---

## Prerequisites

| Tool | Notes |
|------|-------|
| Docker Desktop | Required to run PostgreSQL in a container |
| PostgreSQL 15+ | Alternative if running locally without Docker |

---

## Quick Start with Docker

```bash
cd database
docker compose up -d
```

Stops the container (data is preserved in the volume):

```bash
docker compose down
```

Stops and removes all data:

```bash
docker compose down -v
```

---

## Connection Details

| | |
|-|-|
| Host | `localhost` |
| Port | `5432` |
| Database | `earthquakedb` |
| User | `postgres` |
| Password | `postgres` |

JDBC URL:

```
jdbc:postgresql://localhost:5432/earthquakedb
```

---

## Schema

The `earthquakes` table is created automatically by Hibernate on first backend startup (`ddl-auto=update`). No manual SQL scripts are needed.

```sql
-- Created automatically, shown here for reference
CREATE TABLE earthquakes (
    id         BIGSERIAL PRIMARY KEY,
    usgs_id    VARCHAR UNIQUE NOT NULL,
    magnitude  DOUBLE PRECISION,
    mag_type   VARCHAR(20),
    place      VARCHAR(500),
    title      VARCHAR(500),
    time       TIMESTAMP NOT NULL,
    longitude  DOUBLE PRECISION,
    latitude   DOUBLE PRECISION,
    depth      DOUBLE PRECISION,
    url        VARCHAR(1000),
    tsunami    INTEGER
);
```

---

## docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: earthquake-db
    environment:
      POSTGRES_DB: earthquakedb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - earthquake_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  earthquake_data:
```

---

## Connect with a SQL Client

Use any PostgreSQL client (DBeaver, pgAdmin, IntelliJ Database tool):

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `earthquakedb` |
| User | `postgres` |
| Password | `postgres` |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Container name conflict | Run `docker rm -f earthquake-db` then `docker compose up -d` |
| Port 5432 already in use | Stop local PostgreSQL or change port mapping to `5433:5432` |
| Data lost after restart | Make sure you used `docker compose down` not `docker compose down -v` |
| Cannot connect from backend | Verify container is running: `docker ps` |