# RAG Agent Frontend

## What This Is

A React-based Single Page Application that enables employees to search internal documentation through a dual-mode AI chatbot (RAG Search + LLM Chat) with streaming responses. Includes a full Knowledge Base management system with folder hierarchy, container monitoring via Portainer, and three-tier role-based access control. Integrates with Directus (backend/auth/files) and n8n (AI orchestration) running in Docker, with purple-themed UI and full Russian localization.

## Core Value

Exceptional chat user experience that makes finding documentation feel natural and effortless.

## Requirements

### Validated

- ✓ Mock-first UI development with easy toggle between mock/real data modes — v1.0
- ✓ Chat interface with RAG Search and LLM Chat modes — v1.0
- ✓ Client-side streaming responses for ChatGPT-like UX — v1.0
- ✓ Message history persistence with user-scoped Directus storage — v1.0
- ✓ Knowledge base document browsing with folder hierarchy and CRUD — v1.0
- ✓ Custom Directus login with purple theme and Russian localization — v1.0
- ✓ Protected routes with authentication and role-based access — v1.0
- ✓ Sidebar navigation with company branding and user initials — v1.0
- ✓ Purple theme (#8466e4) with modern visual polish — v1.0
- ✓ Container monitoring dashboard via Portainer API — v1.0
- ✓ Three-tier RBAC (administrator/moderator/user) with UI gating — v1.0
- ✓ File management (upload, download, edit, move, delete) — v1.0

### Active

(None — all v1.0 requirements shipped)

### Out of Scope

- Mobile optimization — desktop-first, PWA not yet explored
- Advanced AI features (multi-model, fine-tuning) — current RAG + LLM covers needs
- User management UI — admin manages users through Directus directly
- Offline mode — real-time connectivity is core value

## Context

**Shipped v1.0** with 5,552 LOC TypeScript/TSX/CSS across 208 files.

**Tech stack:** React 19, TypeScript, Vite, Tailwind CSS, Shadcn/UI, React Query, React Router, Directus SDK, Zod.

**Users:** Company-wide deployment (100+ employees) searching internal documentation.

**Success Metric:** Team finds documents faster than current methods.

**Technical Environment:**
- All services run in Docker on localhost
- Directus handles auth, user data, and file storage via Nginx proxy
- n8n processes AI queries via webhook with session key support
- Portainer provides container monitoring data
- Frontend communicates via abstraction layer supporting mock/real modes (env-based toggle)

**Known Issues:**
- Settings page API configuration removed (Phase 8) — endpoints now .env-based
- Chat history stored in Directus (moved from localStorage in Phase 7.1)
- Color palette evolved from Deep Blue/Cyan to Purple (#8466e4) in Phase 9

## Constraints

- **Localhost deployment**: Must run in Docker localhost environment — non-negotiable
- **Tech stack**: React + TypeScript, Vite, Tailwind CSS, Shadcn/UI, Lucide Icons — locked per spec
- **Code quality tooling**: Prettier + ESLint + VSCode format-on-save required from day one
- **Nginx routing**: All API traffic routed through Nginx (no direct service URLs in frontend)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mock-first development | Approve UI/UX visually before backend integration complexity | ✓ Good — enabled fast UI iteration in Phases 1-6 |
| Code quality tooling upfront | Prettier, ESLint, VSCode settings configured before any code | ✓ Good — consistent code throughout |
| Directus for chat history | User-scoped storage instead of localStorage | ✓ Good — solved multi-user privacy issue |
| Shadcn/UI component library | Modern, accessible, Tailwind-native components | ✓ Good — used extensively throughout |
| SDK-managed auth storage | Let Directus SDK own auth lifecycle | ✓ Good — fixed session persistence bugs |
| Purple theme (#8466e4) | Modern, professional look replacing original blue palette | ✓ Good — consistent brand identity |
| Env-based API config | Removed frontend Settings page, rely on .env + Nginx | ✓ Good — simpler architecture |
| Client-side simulated streaming | n8n doesn't support token streaming | ✓ Good — achieves ChatGPT-like UX |
| Three-tier RBAC | administrator/moderator/user with frontend_role from Directus | ✓ Good — clean permission model |
| Silent redirect for unauthorized | No error messages, redirect to /chat | ✓ Good — seamless UX per role |

---
*Last updated: 2026-02-01 after v1.0 milestone*
