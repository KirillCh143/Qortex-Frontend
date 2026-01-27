# UAT Issues: Phase 11 - Portainer Container Monitoring

**Tested:** 2026-01-26, 2026-01-27
**Source:** .planning/phases/11-portainer-containers/11-01-SUMMARY.md, 11-02-SUMMARY.md
**Tester:** User via /gsd:verify-work

## Open Issues

### UAT-001: Missing .env configuration guidance for Portainer integration

**Discovered:** 2026-01-26
**Phase/Plan:** 11-02
**Severity:** Major
**Feature:** Portainer API integration (real mode)
**Description:** When VITE_USE_MOCK_DATA=false, the application attempts to connect to Portainer API but fails with "NetworkError when attempting to fetch resource" because the required environment variables are not configured. User is not aware which env vars need to be set.
**Expected:**
- Clear documentation or error message indicating required env vars: VITE_PORTAINER_URL, VITE_PORTAINER_TOKEN, VITE_PORTAINER_ENDPOINT_ID
- Helpful default values or example configuration
- Graceful error handling with actionable message when env vars are missing
**Actual:**
- Generic network error displayed: "Ошибка загрузки данных: Failed to fetch containers: NetworkError when attempting to fetch resource"
- No guidance on what configuration is needed
- Service attempts to use defaults (localhost:9443, endpoint '2', empty token) which fail silently
**Repro:**
1. Set VITE_USE_MOCK_DATA=false in .env
2. Do not set Portainer-specific env vars (VITE_PORTAINER_URL, VITE_PORTAINER_TOKEN, VITE_PORTAINER_ENDPOINT_ID)
3. Navigate to Settings page
4. Observe generic network error

### UAT-002: CORS issue when connecting to Portainer API directly

**Discovered:** 2026-01-26
**Phase/Plan:** 11-02
**Severity:** Blocker
**Feature:** Portainer API integration (real mode)
**Description:** Browser blocks requests to Portainer API with CORS error: "CORS header 'Access-Control-Allow-Origin' missing" and "CORS request did not succeed". Frontend cannot connect to Portainer directly due to Same Origin Policy.
**Expected:**
- Portainer requests should be proxied through Nginx (like Directus and n8n) to avoid CORS issues
- Configuration should use relative path or same-origin URL (e.g., http://localhost:8082 proxied to Portainer)
- Frontend makes request to /api/portainer/... which Nginx forwards to Portainer backend
**Actual:**
- Frontend attempts direct connection to Portainer at http://localhost:9443
- Browser blocks request with CORS error (status 400 on OPTIONS preflight)
- No Nginx proxy configuration exists for Portainer
**Repro:**
1. Configure VITE_PORTAINER_URL=http://localhost:9443 and valid API token
2. Set VITE_USE_MOCK_DATA=false
3. Navigate to Settings page
4. Open browser console and observe CORS errors
**Note:** This follows the same architecture pattern as Directus (port 8080) and n8n (port 8081), which are successfully proxied through Nginx. Portainer needs similar treatment.

### UAT-003: Incorrect default endpoint ID in .env example

**Discovered:** 2026-01-27
**Phase/Plan:** 11-01
**Severity:** Major
**Feature:** Portainer API Integration
**Description:** The .env file had VITE_PORTAINER_ENDPOINT_ID=2 by default, but user's actual Portainer endpoint ID is 3, causing "Object not found inside the database" 404 errors on initial testing
**Expected:** Container data loads successfully from Portainer API
**Actual:** API returned 404 error with message "Unable to find an environment with the specified identifier inside the database (bucket=endpoints, key=2)"
**Repro:**
1. Start app with endpoint ID 2 in .env
2. Navigate to Settings page
3. See error: "Ошибка загрузки данных: Failed to fetch containers: Portainer API error: Not Found"
**Note:** Fixed during UAT by checking actual endpoint via API and updating .env. The comment says "usually '2' for local Docker" but this varies by installation. Better error message or auto-detection would help.

### UAT-004: Paused containers show as "running" instead of "paused"

**Discovered:** 2026-01-27
**Phase/Plan:** 11-01
**Severity:** Major
**Feature:** Container status detection
**Description:** Containers with paused state display green "Запущен" (running) indicator instead of yellow "Приостановлен" (paused)
**Expected:** Paused containers should show yellow dot + "Приостановлен" label
**Actual:** Paused container "lightrag" shows green dot + "Запущен" label
**Repro:**
1. Pause a container in Docker (e.g., `docker pause lightrag`)
2. Refresh Settings page
3. Observe paused container shows as running with green indicator
**Root Cause:** The service code in src/services/portainer/portainer.service.ts checks `detail.State.Running` and `detail.State.Paused` from the detailed container API, but the logic may not properly handle Portainer's state response structure. The condition `if (detail.State.Running)` is evaluated before `else if (detail.State.Paused)`, and a paused container might still have Running=true.

### UAT-005: Paused containers display uptime instead of "—"

**Discovered:** 2026-01-27
**Phase/Plan:** 11-01
**Severity:** Minor
**Feature:** Uptime display for paused containers
**Description:** Paused containers show uptime (e.g., "1d 5h") when they should display "—" (dash)
**Expected:** Paused containers should show "—" in the "Время работы" (Uptime) column
**Actual:** Paused container shows uptime value calculated from StartedAt timestamp
**Repro:**
1. Pause a container in Docker
2. Check Uptime column for paused container
3. See uptime value instead of dash
**Root Cause:** Related to UAT-004 - since paused state isn't detected correctly, the uptime logic at portainer.service.ts:119 uses `detail.State.Running ? formatUptime(...) : '-'` and treats paused container as running, calculating uptime instead of returning dash.

### UAT-006: Health status always shows "—" for all containers

**Discovered:** 2026-01-27
**Phase/Plan:** 11-01
**Severity:** Major
**Feature:** Container health status display
**Description:** All containers show "—" (dash) in the "Состояние" (Health) column, even when health information is available from the API
**Expected:** Containers with health checks should show "Здоровый" (healthy), "Нездоровый" (unhealthy), or "—" (none) based on actual health status
**Actual:** All containers show "—" regardless of health check status
**Repro:**
1. View Settings page with containers that have health checks configured
2. Observe Health column shows "—" for all containers
3. Check browser network tab - API response includes Health.Status field in container list
**Root Cause:** The service code at portainer.service.ts:110-116 sets `health = 'none'` by default and only checks `detail.Config.Health` (health check configuration) but doesn't read the actual health status. The initial list API response (`/containers/json`) already includes `Health.Status` field which could be used without additional detail calls.

## Resolved Issues

### UAT-001: Missing .env configuration guidance for Portainer integration
**Resolved:** 2026-01-27 - Fixed in 11-FIX.md
**Resolution:** Added comprehensive error messages with actionable guidance. Missing API token now shows where to get it, wrong endpoint ID shows how to find correct one, network errors suggest checking URL/connectivity. Commit: f83078d

### UAT-002: CORS issue when connecting to Portainer API directly
**Resolved:** Between 2026-01-26 and 2026-01-27
**Resolution:** Nginx proxy configuration added for Portainer at port 8082, following same pattern as Directus (8080) and n8n (8081). CORS errors no longer occur.

### UAT-003: Incorrect default endpoint ID in .env example
**Resolved:** 2026-01-27 - Fixed during UAT
**Resolution:** Updated .env file from VITE_PORTAINER_ENDPOINT_ID=2 to VITE_PORTAINER_ENDPOINT_ID=3 based on actual endpoint ID discovered via API query

### UAT-004: Paused containers show as "running" instead of "paused"
**Resolved:** 2026-01-27 - Fixed in 11-FIX.md
**Resolution:** Changed status detection logic to check Paused state before Running state. Docker/Portainer paused containers have both Running=true and Paused=true, so Paused must be checked first. Commit: de6f6f2

### UAT-005: Paused containers display uptime instead of "—"
**Resolved:** 2026-01-27 - Fixed in 11-FIX.md
**Resolution:** Updated uptime calculation to exclude paused containers (check both Running && !Paused). Paused containers now show "—" as expected. Commit: de6f6f2

### UAT-006: Health status always shows "—" for all containers
**Resolved:** 2026-01-27 - Fixed in 11-FIX.md
**Resolution:** Changed to read Health.Status from list API response instead of Config.Health from detail calls. Now correctly displays "Здоровый" (healthy) and "Нездоровый" (unhealthy) when health checks are present. Commit: 33ae276

---

*Phase: 11-portainer-containers*
*Plan: 11-02*
*Tested: 2026-01-26*
