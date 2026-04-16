# Earthquake Monitor — Frontend

React 18 · Vite · Leaflet

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |

---

## Quick Start

```bash
npm install
npm run dev
```

App runs at `http://localhost:3005`

> Backend must be running on `http://localhost:8080` before starting the frontend.

---

## Project Structure

```
frontend/
├── index.html
├── vite.config.js
├── Dockerfile
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Header.jsx
    │   ├── StatsBar.jsx
    │   ├── FilterPanel.jsx
    │   ├── EarthquakeTable.jsx
    │   ├── EarthquakeMap.jsx
    │   └── Toast.jsx
    ├── hooks/
    │   └── useEarthquakes.js
    └── services/
        └── earthquakeService.js
```

---

## Features

- **Table view** — color-coded magnitude, place, time, delete with confirmation
- **Stats bar** — total events, max magnitude, average magnitude, M4+ count
- **Filter panel** — filter by minimum magnitude and/or time
- **Sync button** — manually fetch latest data from USGS via backend
- **Auto-load** — loads stored earthquakes from DB on page open
- **Toast notifications** — success/error feedback on every action

---

## Vite Proxy Config

API calls are proxied through Vite to avoid CORS issues.
For local:
```js
// vite.config.js
plugins: [react()],
    server: {
    port: 3005,
        proxy: {
        '/api': {
            target: 'http://localhost:8080',
                changeOrigin: true,
        }
    }
}
```
For Docker:
```js
// vite.config.js
plugins: [react()],
     server: {
         port: 3005,
         host: '0.0.0.0',
         proxy: {
             '/api': {
                 target: 'http://earthquake-backend:8080',
                 changeOrigin: true,
             }
         }
     }
```
> When running inside Docker, switch the target to `http://earthquake-backend:8080` and rebuild the image.

---

## Run with Docker

Build the image:

```bash
docker build -t earthquake-frontend .
```

Run the container:

```bash
docker run --rm -p 3005:3005 earthquake-frontend
```

Then open `http://localhost:3005`

---

## Run all services (postgres + backend + frontend)

```bash
docker compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3005 |
| Backend | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page on load | Make sure backend is running on port 8080 |
| 500 error on fetch | Check that proxy target in `vite.config.js` matches backend host |
| Map not showing | Leaflet CSS is loaded via CDN in `index.html` — check internet access |
| No earthquakes shown | Click **SYNC USGS** to fetch and store latest data |
| Docker: 500 / no backend calls | Change proxy target to `http://earthquake-backend:8080` and rebuild image |