---
phase: 11-portainer-containers
plan: 11-FIX
type: fix
---

<objective>
Fix 3 major UAT issues from Phase 11 container monitoring.

Source: 11-ISSUES.md
Priority: 0 critical, 3 major, 1 minor (auto-fixed with major)
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

**Issues being fixed:**
@.planning/phases/11-portainer-containers/11-ISSUES.md

**Original plans for reference:**
@.planning/phases/11-portainer-containers/11-01-PLAN.md
@.planning/phases/11-portainer-containers/11-02-PLAN.md

**Key files:**
@src/services/portainer/portainer.service.ts
@src/services/portainer/types.ts
</context>

<tasks>

<task type="auto">
  <name>Fix UAT-004 & UAT-005: Paused container detection and uptime display</name>
  <files>src/services/portainer/portainer.service.ts</files>
  <action>
Fix paused container status detection in portainer.service.ts:

**Root cause:** The current logic checks `if (detail.State.Running)` before `else if (detail.State.Paused)`. However, in Docker/Portainer, a paused container can have both Running=true AND Paused=true simultaneously (paused means "running but suspended"). The condition priority is wrong.

**Fix:**
1. Change the status mapping logic at lines 103-108 to check Paused FIRST:
   ```typescript
   let status: ContainerStatus = 'stopped'
   if (detail.State.Paused) {
     status = 'paused'
   } else if (detail.State.Running) {
     status = 'running'
   }
   ```

2. Update uptime logic at line 119 to account for paused status:
   ```typescript
   const uptime = (detail.State.Running && !detail.State.Paused) ? formatUptime(detail.State.StartedAt) : '-'
   ```

**Why this works:** Paused containers should take precedence over running state. A paused container is technically "running but suspended", so Paused=true is the more specific condition and should be checked first.

**Test approach:**
- After fix, paused containers should show yellow "Приостановлен" status
- Paused containers should show "—" for uptime, not calculated time
- Running containers should still show green "Запущен" with uptime
- Stopped containers should still show red "Остановлен" with "—"
  </action>
  <verify>TypeScript compiles. Service correctly identifies paused state before running state.</verify>
  <done>Paused containers show yellow "Приостановлен" status with "—" uptime. Running and stopped containers unaffected.</done>
</task>

<task type="auto">
  <name>Fix UAT-006: Health status display</name>
  <files>src/services/portainer/portainer.service.ts</files>
  <action>
Fix health status detection in portainer.service.ts:

**Root cause:** The code at lines 110-116 only checks `detail.Config.Health` (health check *configuration*) but never reads the actual *health status*. The initial list API response already includes `Health.Status` field which contains the actual health state.

**Two options for fix:**

**Option A (simpler, uses existing data):** Use Health.Status from the list API response instead of making detail calls
- The `/containers/json` response already includes a `Health` object with `Status` field
- Add Health to the PortainerContainer interface
- Map Health.Status directly: "healthy" → 'healthy', "unhealthy" → 'unhealthy', undefined/none → 'none'
- This eliminates need for detail calls entirely (performance win)

**Option B (current approach, read from detail):** Fix the detail mapping to read State.Health
- Keep detail calls but actually read `detail.State.Health.Status`
- Map: "healthy" → 'healthy', "unhealthy" → 'unhealthy', no health check → 'none'

**Recommended: Option A** - Simpler, faster, uses data already available. No need for expensive detail API calls.

**Implementation (Option A):**
1. Update PortainerContainer interface (line ~14) to include optional Health field:
   ```typescript
   Health?: {
     Status: string
   }
   ```

2. Remove or simplify the health mapping logic at lines 110-116:
   ```typescript
   // Map health from list API (already includes Health.Status)
   let health: ContainerHealth = 'none'
   if (container.Health?.Status) {
     if (container.Health.Status === 'healthy') {
       health = 'healthy'
     } else if (container.Health.Status === 'unhealthy') {
       health = 'unhealthy'
     }
   }
   ```

3. Apply this BEFORE the detail calls loop, using data from the list response
4. Consider whether detail calls are still needed - if only for health, they can be removed entirely

**Test approach:**
- Containers with health checks should show "Здоровый" (healthy) or "Нездоровый" (unhealthy)
- Containers without health checks should show "—"
- Check browser network tab to confirm Health.Status is in the list response
  </action>
  <verify>TypeScript compiles. Health status correctly mapped from API response Health.Status field.</verify>
  <done>Containers display actual health status ("Здоровый", "Нездоровый", or "—") based on Health.Status from API.</done>
</task>

<task type="auto">
  <name>Fix UAT-001: Improve error messages for missing configuration</name>
  <files>src/services/portainer/portainer.service.ts</files>
  <action>
Improve error handling in portainer.service.ts to provide actionable guidance:

**Root cause:** Generic "NetworkError" or "Portainer API error" messages don't tell users what's wrong or how to fix it.

**Fix:**
1. Add configuration validation at the start of getContainers():
   ```typescript
   async getContainers() {
     // Validate configuration
     if (!apiToken) {
       throw new Error(
         'Portainer API token not configured. Set VITE_PORTAINER_TOKEN in .env file. ' +
         'Get token from: Portainer UI → Settings → Users → [Your user] → Add access token'
       )
     }

     try {
       const response = await fetch(...)

       if (!response.ok) {
         if (response.status === 404) {
           throw new Error(
             `Portainer endpoint not found (ID: ${endpointId}). ` +
             'Check VITE_PORTAINER_ENDPOINT_ID in .env. ' +
             'Find correct ID: Portainer UI → Endpoints, or run: ' +
             `curl -H "X-API-Key: ${apiToken}" ${portainerUrl}/api/endpoints`
           )
         }
         throw new Error(`Portainer API error: ${response.statusText}`)
       }
       // ... rest of implementation
     } catch (error) {
       if (error instanceof TypeError && error.message.includes('fetch')) {
         throw new Error(
           'Cannot connect to Portainer API. Check VITE_PORTAINER_URL in .env ' +
           `(current: ${portainerUrl}). Ensure Portainer is running and accessible.`
         )
       }
       throw error
     }
   }
   ```

2. Update .env comments to be more helpful (if not already done):
   ```
   # Portainer API configuration
   # Get API token from: Portainer UI → Settings → Users → [Your user] → Add access token
   # Find endpoint ID from: Portainer UI → Endpoints (typically 1-3 for local Docker)
   # Or query: curl -H "X-API-Key: YOUR_TOKEN" http://localhost:9000/api/endpoints
   ```

**Test approach:**
- Remove API token → should see helpful error about getting token
- Use wrong endpoint ID → should see helpful error about finding correct ID
- Use wrong URL → should see helpful error about connection
  </action>
  <verify>Error messages are actionable and guide users to fix configuration issues.</verify>
  <done>Missing/incorrect configuration produces clear error messages with instructions on how to fix.</done>
</task>

</tasks>

<verification>
Before declaring plan complete:
- [ ] TypeScript builds without errors: npm run build
- [ ] Paused containers show correct yellow status and "—" uptime
- [ ] Health status displays correctly for all container types
- [ ] Error messages provide actionable guidance
- [ ] No regressions: running and stopped containers still work correctly
</verification>

<success_criteria>
- All 3 major UAT issues addressed
- Paused container detection fixed (fixes both UAT-004 and UAT-005)
- Health status display fixed
- Error messages improved for troubleshooting
- Ready for re-verification with /gsd:verify-work
</success_criteria>

<output>
After completion, create `.planning/phases/11-portainer-containers/11-FIX-SUMMARY.md`
</output>
