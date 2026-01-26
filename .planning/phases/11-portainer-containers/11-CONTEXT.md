# Phase 11: Table with Containers statuses from Portainer - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<vision>
## How This Should Work

The Settings page gets repurposed into a system monitoring/admin page. When users navigate to Settings, they see a container status monitoring table instead of chat preferences.

The table shows container health at a glance with a manual refresh button and timestamp showing when data was last updated. Users click refresh to pull the latest status from Portainer - simple and straightforward, no complex auto-refresh logic.

The focus is on quick scanning - being able to see which containers are healthy vs problematic without clicking into details. This is a monitoring dashboard, not a management interface.

</vision>

<essential>
## What Must Be Nailed

- **Portainer API integration** - Successfully connecting to Portainer and pulling real container data reliably
- **Design consistency** - Table matches the overall frontend design from Phase 9 (purple theme, polished styling, Russian localization)
- **At-a-glance status** - Color-coded indicators make it instantly clear which containers need attention

</essential>

<boundaries>
## What's Out of Scope

- Container actions (start/stop/restart) - this is read-only monitoring, not container management
- Detailed logs or shell access - no deep-dive features, just status overview at the table level
- Historical data or analytics - no charts, trends, or historical tracking, just current state
- Container creation or configuration - no ability to create new containers or modify existing ones

This phase is purely read-only monitoring. Management features could come in a future phase if needed.

</boundaries>

<specifics>
## Specific Ideas

- **Remove Chat Preferences section completely** - The "Chat Preferences" controls currently on the Settings page should be removed entirely
- **Color-coded status indicators** - Visual cues (green for running, red for stopped, yellow for unhealthy) for easy scanning
- **Manual refresh with timestamp** - Button to refresh data, displaying last updated time so users know freshness
- **Container information to display:**
  - Container name
  - Status (running/stopped)
  - Uptime
  - Health checks (passing/failing)

</specifics>

<notes>
## Additional Context

This phase transforms the Settings page from user preferences (chat settings) into a system monitoring page. The page will focus on operational visibility for admins/devops users rather than end-user configuration.

The Settings page currently has Chat Preferences that need to be removed. After Phase 11, Settings becomes the container monitoring dashboard.

</notes>

---

*Phase: 11-portainer-containers*
*Context gathered: 2026-01-26*
