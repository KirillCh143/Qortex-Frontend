# Environment Variables

This guide explains every environment variable used by the application, how the configuration system works, and how to set variables for production deployment.

## How Configuration Works

The app supports two configuration modes: **build-time** (Vite `.env`) and **runtime** (Docker environment variables). Runtime values always take priority.

### Resolution Order

When the app reads a variable via `getEnv(key)`, it checks three sources in order:

| Priority | Source | When it's set |
|---|---|---|
| 1 (highest) | `window.__RUNTIME_CONFIG__[key]` | Docker entrypoint injects values at container start |
| 2 | `import.meta.env[key]` | Vite bakes `.env` values into the bundle at build time |
| 3 (lowest) | Fallback default | Hardcoded in the `getEnv()` call |

### How Runtime Injection Works

1. `index.html` loads `/env-config.js` before the app script
2. In local development, `public/env-config.js` contains an empty `window.__RUNTIME_CONFIG__ = {}`  so Vite `.env` values are used as fallback
3. In Docker, `docker-entrypoint.sh` overwrites `dist/env-config.js` with actual environment variable values before starting the server
4. This means you can change configuration by restarting the container with new environment variables — no rebuild needed

### Key Files

| File | Role |
|---|---|
| `.env` | Local development defaults (read by Vite) |
| `docker-compose.yml` | Production values passed to the Docker container |
| `docker-entrypoint.sh` | Generates `env-config.js` from Docker environment variables at container start |
| `public/env-config.js` | Empty placeholder; overwritten by Docker entrypoint in production |
| `src/lib/env.ts` | `getEnv()` helper that reads from runtime config, then Vite env, then fallback |

---

## Variable Reference

### VITE_USE_MOCK_DATA

| | |
|---|---|
| **Purpose** | Toggle between mock data services and real backend API calls |
| **Values** | `true` — use built-in mock data (no backend needed); `false` — use real APIs |
| **Default** | `false` |
| **Required** | No |

When set to `true`, the app bypasses all real API calls and uses hardcoded mock responses. The authentication system also skips Directus and creates a mock user with `administrator` role. This is intended for frontend development without running backend services.

**Production value:** `false`

**Used in:**
- `src/lib/config.ts` — selects mock vs real service implementations for all services
- `src/lib/directus.ts` — skips Directus client creation when mocking
- `src/contexts/AuthContext.tsx` — skips real auth check and sets mock user

---

### VITE_SHOW_DEVTOOLS

| | |
|---|---|
| **Purpose** | Show or hide React Query DevTools panel in the browser |
| **Values** | `true` — show devtools; `false` — hide devtools |
| **Default** | `false` |
| **Required** | No |

Enables the React Query DevTools floating panel, useful for debugging API request states, cache contents, and query timing.

**Production value:** `false`

**Used in:**
- `src/providers/QueryProvider.tsx` — conditionally renders `<ReactQueryDevtools>`

---

### VITE_DIRECTUS_URL

| | |
|---|---|
| **Purpose** | Base URL of the Directus CMS backend |
| **Example** | `http://192.168.2.18:8080` |
| **Default** | `http://localhost:8080` |
| **Required** | Yes (unless `VITE_USE_MOCK_DATA=true`) |

The Directus SDK client is initialized with this URL. All authentication, user profile, file management, and chat message API calls go through it.

**Production value:** Set to the URL where your Directus instance is reachable from the user's browser. If Directus is behind a reverse proxy (e.g. nginx), use the proxy URL.

**Used in:**
- `src/lib/directus.ts` — passed to `createDirectus()` SDK constructor

---

### VITE_N8N_WEBHOOK_URL

| | |
|---|---|
| **Purpose** | Full URL of the n8n webhook endpoint that handles chat requests |
| **Example** | `http://192.168.2.18:8081/webhook/chat` |
| **Default** | `http://localhost:8081/webhook/chat` |
| **Required** | Yes (unless `VITE_USE_MOCK_DATA=true`) |

The chat feature sends user messages to this webhook URL and receives AI-generated responses. The frontend makes POST requests to this endpoint.

**Production value:** Use the **production** webhook path `/webhook/chat`. The development `.env` uses `/webhook-test/chat` which is n8n's test webhook (only active while the n8n workflow editor is open).

> **Important:** n8n has two webhook URLs per workflow:
> - `/webhook-test/...` — only works while the workflow is open in the n8n editor (for testing)
> - `/webhook/...` — works when the workflow is activated (for production)
>
> Always use `/webhook/chat` in production.

**Used in:**
- `src/lib/config.ts` — passed to `createWebhookService()` for chat API calls

---

### VITE_PORTAINER_URL

| | |
|---|---|
| **Purpose** | Base URL of the Portainer API |
| **Example** | `http://192.168.2.18:8082` |
| **Default** | `http://localhost:9443` |
| **Required** | Yes (for the Settings page to show container status) |

The Settings page queries Portainer to display Docker container health and status. This URL should point to Portainer's API (usually port 9443 for HTTPS or 9000 for HTTP, but may differ if behind a reverse proxy).

**Production value:** Set to the URL where Portainer is reachable from the user's browser.

**Used in:**
- `src/services/portainer/portainer.service.ts` — base URL for all Portainer API requests

---

### VITE_PORTAINER_TOKEN

| | |
|---|---|
| **Purpose** | API access token for authenticating Portainer API requests |
| **Example** | `ptr_abc123...` |
| **Default** | Empty string (will cause an error if not set) |
| **Required** | Yes (for the Settings page to show container status) |

Sent as the `X-API-Key` header on every Portainer API request. Without a valid token, the Settings page cannot fetch container data.

**How to generate a token:**
1. Open the Portainer web UI
2. Go to **My Account** (click your username in the top right)
3. Scroll to **Access Tokens**
4. Click **Add access token**
5. Give it a description (e.g. "Frontend app") and click **Create access token**
6. Copy the token — it starts with `ptr_`

**Production value:** A valid Portainer API token.

> **Security note:** This token is embedded in the frontend JavaScript bundle and visible in the browser. This is acceptable for internal/intranet deployments. For public-facing deployments, consider proxying Portainer API calls through a backend service that holds the token server-side.

**Used in:**
- `src/services/portainer/portainer.service.ts` — sent as `X-API-Key` header

---

### VITE_PORTAINER_ENDPOINT_ID

| | |
|---|---|
| **Purpose** | Portainer environment/endpoint ID to query for containers |
| **Example** | `2`, `3` |
| **Default** | `2` |
| **Required** | No (defaults to `2`) |

Portainer manages one or more Docker environments (endpoints). This ID tells the app which environment to query. The Portainer API uses this in the URL path: `/api/endpoints/{id}/docker/containers/json`.

**How to find your endpoint ID:**
1. Open the Portainer web UI
2. Go to **Environments** (or **Endpoints** in older versions)
3. Click on your environment — the ID is in the URL: `.../endpoints/{id}/...`
4. Alternatively, query the API:
   ```
   curl -H "X-API-Key: YOUR_TOKEN" https://your-portainer/api/endpoints
   ```

**Production value:** The numeric ID of your Docker environment in Portainer.

**Used in:**
- `src/services/portainer/portainer.service.ts` — used in API URL paths

---

## Production Setup

### Option 1: Docker Compose (Recommended)

Set all variables in `docker-compose.yml` under the `environment` key:

```yaml
services:
  frontend:
    build: .
    ports:
      - '3000:3000'
    environment:
      - VITE_USE_MOCK_DATA=false
      - VITE_SHOW_DEVTOOLS=false
      - VITE_DIRECTUS_URL=http://your-server:8080
      - VITE_N8N_WEBHOOK_URL=http://your-server:8081/webhook/chat
      - VITE_PORTAINER_URL=http://your-server:8082
      - VITE_PORTAINER_TOKEN=ptr_your_token_here
      - VITE_PORTAINER_ENDPOINT_ID=2
    restart: unless-stopped
```

Then run:
```bash
docker compose up -d
```

To change a variable, update `docker-compose.yml` and restart:
```bash
docker compose down && docker compose up -d
```

### Option 2: Docker Run

Pass variables with `-e` flags:

```bash
docker run -d \
  -p 3000:3000 \
  -e VITE_USE_MOCK_DATA=false \
  -e VITE_SHOW_DEVTOOLS=false \
  -e VITE_DIRECTUS_URL=http://your-server:8080 \
  -e VITE_N8N_WEBHOOK_URL=http://your-server:8081/webhook/chat \
  -e VITE_PORTAINER_URL=http://your-server:8082 \
  -e VITE_PORTAINER_TOKEN=ptr_your_token_here \
  -e VITE_PORTAINER_ENDPOINT_ID=2 \
  your-image-name
```

### Option 3: Local Development

Edit the `.env` file in the project root:

```env
VITE_USE_MOCK_DATA=false
VITE_SHOW_DEVTOOLS=false
VITE_DIRECTUS_URL=http://localhost:8080
VITE_N8N_WEBHOOK_URL=http://localhost:8081/webhook-test/chat
VITE_PORTAINER_URL=http://localhost:8082
VITE_PORTAINER_TOKEN=ptr_your_token_here
VITE_PORTAINER_ENDPOINT_ID=2
```

Then run `npm run dev`. Vite reads `.env` automatically.

> **Note:** In local development, use `/webhook-test/chat` for the n8n URL so you can test with the n8n editor open.

## Production Checklist

- [ ] `VITE_USE_MOCK_DATA` is `false`
- [ ] `VITE_SHOW_DEVTOOLS` is `false`
- [ ] `VITE_DIRECTUS_URL` points to your Directus instance (reachable from the browser)
- [ ] `VITE_N8N_WEBHOOK_URL` uses `/webhook/chat` (not `/webhook-test/chat`)
- [ ] `VITE_PORTAINER_URL` points to your Portainer instance (reachable from the browser)
- [ ] `VITE_PORTAINER_TOKEN` contains a valid API token
- [ ] `VITE_PORTAINER_ENDPOINT_ID` matches your Docker environment in Portainer
- [ ] All URLs use the correct protocol and port for your network setup
- [ ] If services are behind a reverse proxy, URLs point to the proxy (not internal addresses)
