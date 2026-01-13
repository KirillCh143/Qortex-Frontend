# RAG Agent Frontend

## What This Is

A React-based Single Page Application that enables employees to search internal documentation through a conversational chatbot interface. The system integrates with Directus (backend/auth) and n8n (AI orchestration) running in Docker on localhost, with a mock-first development approach to approve UI/UX before connecting real APIs.

## Core Value

Exceptional chat user experience that makes finding documentation feel natural and effortless.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Mock-first UI development with easy toggle between mock/real data modes
- [ ] Chat interface with RAG Search and LLM Chat modes
- [ ] Message history persistence (configurable localStorage-based session management)
- [ ] Knowledge base document browsing (view/download capabilities)
- [ ] Settings panel for API configuration and chat preferences
- [ ] Custom Directus login (not default interface)
- [ ] Protected routes with authentication
- [ ] Sidebar navigation with company branding
- [ ] User avatar display in header
- [ ] Color palette implementation (Deep Blue primary, Bright Blue secondary, Cyan accent)

### Out of Scope

- Admin features (user management, analytics, advanced configuration) — v1 focuses on end-user chat experience
- Mobile optimization — desktop-first, mobile can wait for v2
- Advanced AI features beyond basic RAG + LLM chat — keep it simple and focused

## Context

**Users:** Company-wide deployment (100+ employees) searching internal documentation

**Success Metric:** Team finds documents faster than current methods

**Development Approach:** Build UI with mock data first for visual approval, then integrate real APIs. Approval is self-directed (builder tests and decides when ready).

**Technical Environment:**
- All services run in Docker on localhost
- Directus handles auth, user data, and file storage (default: http://localhost:8055)
- n8n processes AI queries via webhook (default: http://localhost:5678/webhook/...)
- Frontend communicates with both via abstraction layer supporting mock/real modes

**Key Technical Details from Spec:**
- Session management via localStorage with configurable persistence
- Payload to n8n includes: question, mode (rag/llm), sessionId, history
- Chat history either persists (localStorage) or clears on refresh based on settings
- Knowledge base queries directus_files collection in real mode

## Constraints

- **Localhost deployment**: Must run in Docker localhost environment — non-negotiable
- **Tech stack**: React + TypeScript, Vite, Tailwind CSS, Shadcn/UI, Lucide Icons — locked per spec
- **Code quality tooling**: Prettier + ESLint + VSCode format-on-save required from day one
- **Mock-first approach**: UI must work with mock data before real API integration

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mock-first development | Approve UI/UX visually before backend integration complexity | — Pending |
| Code quality tooling upfront | Prettier, ESLint, VSCode settings configured before any code | — Pending |
| localStorage for session management | Simple, no backend session state needed, user-configurable persistence | — Pending |
| Shadcn/UI component library | Modern, accessible, Tailwind-native components | — Pending |

---
*Last updated: 2026-01-13 after initialization*
