# Phase 13: User Roles and Permissions - Context

**Gathered:** 2026-02-01
**Status:** Ready for research

<vision>
## How This Should Work

There are three user roles defined by a `frontend_role` field already added to the Directus Users collection: **administrator**, **moderator**, and **user**.

Each role sees a tailored version of the app — no broken buttons, no "access denied" pages. If you can't do something, you simply don't see the option. The app feels complete at every role level.

- **Administrator**: Full access to everything (current behavior — chat, knowledge base with full CRUD, settings/Portainer monitoring page).
- **Moderator**: Same as administrator but the Settings page (container monitoring) is completely hidden — no sidebar link, no route access.
- **User**: No Settings page (same as moderator) AND the Knowledge Base is read-only — they can browse folders, view file details, and download files, but create folder, upload file, edit file info, and delete file controls are all hidden.

All three roles have full access to the Chat page (both RAG and LLM modes).

</vision>

<essential>
## What Must Be Nailed

- **Rock-solid enforcement** — Permissions actually work. Users can't access restricted pages even by typing URLs directly. Route guards redirect unauthorized users cleanly.
- **Seamless per-role UX** — Each role feels like a complete, intentional app. Hidden elements don't leave awkward gaps or broken layouts. A "user" role person using the Knowledge Base should feel like the page was designed exactly for browsing and downloading.

</essential>

<boundaries>
## What's Out of Scope

- No role management UI in the frontend — roles are assigned exclusively through the Directus admin panel
- No per-folder or per-file permissions — all users see the same content, just with different actions available
- No content-level restrictions — this is purely feature-level gating (page access + action visibility)

</boundaries>

<specifics>
## Specific Ideas

- Sidebar links hidden entirely for pages the role can't access (not grayed out, not locked — just gone)
- Knowledge Base action buttons (create folder, upload file, edit, delete) hidden completely for "user" role (not disabled — hidden)
- Direct URL navigation to restricted pages should redirect (e.g., a moderator typing /settings gets sent to /chat)
- The `frontend_role` field values are: "administrator", "moderator", "user"

</specifics>

<notes>
## Additional Context

The Directus Users collection already has the `frontend_role` field set up. The frontend just needs to read this value and gate features accordingly. No backend permission changes needed — this is purely frontend role-based UI gating.

Three-tier hierarchy: administrator > moderator > user (each lower tier loses access to specific features).

</notes>

---

*Phase: 13-user-roles-and-permissions*
*Context gathered: 2026-02-01*
