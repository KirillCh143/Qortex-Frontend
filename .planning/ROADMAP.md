# Roadmap: RAG Agent Frontend

## Overview

This roadmap takes the RAG Agent Frontend from initial project setup through to a production-ready chat interface. We start with foundational tooling and layout, build authentication and chat interfaces using mock data for UI approval, then integrate real APIs with Directus and n8n. The journey emphasizes mock-first development to validate UX before backend complexity, culminating in a polished employee documentation search experience.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Foundation** - Initialize React + TypeScript stack with tooling and structure
- [x] **Phase 2: Core Layout & Navigation** - Build sidebar, header, and protected route structure
- [x] **Phase 3: Authentication System** - Custom Directus login with session management
- [x] **Phase 4: Chat Interface - Mock Mode** - Build chat UI with RAG/LLM modes using mock data
- [x] **Phase 5: Knowledge Base Interface** - Document browsing with view/download capabilities
- [x] **Phase 6: Settings Panel** - API configuration and chat preference controls
- [x] **Phase 7: API Integration Layer** - Connect to Directus and n8n with real/mock toggle
- [x] **Phase 7.1: Additional fixes (INSERTED)** - Urgent work discovered after Phase 7
- [x] **Phase 7.2: Session Persistence Fix (INSERTED)** - Fix auth session persistence bug
- [x] **Phase 7.3: Directory Structure Integration (INSERTED)** - Add folder hierarchy navigation and enhanced file management
- [x] **Phase 7.4: Fix files download (INSERTED)** - Fix file download functionality
- [x] **Phase 7.5: Login page design overhaul and redirect fix (INSERTED)** - Urgent work discovered after Phase 7.4
- [x] **Phase 8: Configuration Refactoring & UX Enhancements** - Remove settings UI, add markdown support, isolate chat contexts, fix layout, add file management
- [x] **Phase 9: UI Overhaul** - Purple theme, Russian localization, file type icons, and modern visual polish
- [x] **Phase 10: Knowledgebase page edits** - TBD
- [x] **Phase 11: Table with Containers statuses from Portainer** - Container monitoring dashboard with status table
- [x] **Phase 12: Small improvements and fixes** - Polish UI/UX with incremental improvements across chat and knowledge base interfaces
- [x] **Phase 13: User Roles and Permissions** - Implement user roles and permissions system

## Phase Details

### Phase 1: Project Foundation
**Goal**: Production-ready React + TypeScript + Vite project with code quality tooling configured
**Depends on**: Nothing (first phase)
**Research**: Unlikely (standard React + Vite setup with established tooling)
**Plans**: TBD

Plans:
- [x] 01-01: Initialize Vite + React + TypeScript project with dependencies
- [x] 01-02: Configure ESLint, Prettier, VSCode settings
- [x] 01-03: Set up Tailwind CSS, Shadcn/UI, and base folder structure

### Phase 2: Core Layout & Navigation
**Goal**: Complete application shell with sidebar, header, and routing
**Depends on**: Phase 1
**Research**: Unlikely (internal UI patterns using Shadcn/UI components)
**Plans**: TBD

Plans:
- [x] 02-01: Build sidebar with company branding and navigation
- [x] 02-02: Create header with user avatar and implement color palette
- [x] 02-03: Set up React Router with protected route structure

### Phase 3: Authentication System
**Goal**: Custom Directus login with localStorage session management
**Depends on**: Phase 2
**Research**: Likely (Directus authentication integration)
**Research topics**: Directus auth API endpoints, token management patterns, session handling with Directus
**Plans**: TBD

Plans:
- [x] 03-01: Build Directus SDK and AuthContext
- [x] 03-02: Create custom login page UI
- [x] 03-03: Implement protected routes and session persistence

### Phase 4: Chat Interface - Mock Mode ✓
**Goal**: Fully functional chat UI with RAG/LLM modes using mock data
**Depends on**: Phase 3
**Research**: Unlikely (internal UI development with mock data)
**Plans**: 3/3 complete
**Status**: Complete
**Completed**: 2026-01-14

Plans:
- [x] 04-01: Build chat message components and input interface
- [x] 04-02: Implement RAG Search and LLM Chat mode switching
- [x] 04-03: Add message history with localStorage persistence

### Phase 5: Knowledge Base Interface ✓
**Goal**: Document browsing interface with view/download capabilities
**Depends on**: Phase 4
**Research**: Unlikely (UI patterns similar to Phase 4, mock data first)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-14

Plans:
- [x] 05-01: Create document list and detail views
- [x] 05-02: Implement view/download functionality with mock data

### Phase 6: Settings Panel ✓
**Goal**: User-configurable settings for API endpoints and chat preferences
**Depends on**: Phase 5
**Research**: Unlikely (internal UI and state management)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-14

Plans:
- [x] 06-01: Build settings UI for API configuration
- [x] 06-02: Implement chat preference controls and persistence toggle

### Phase 7: API Integration Layer
**Goal**: Real API connections to Directus and n8n with seamless mock/real toggle
**Depends on**: Phase 6
**Research**: Likely (external service integration)
**Research topics**: Directus Files API for knowledge base queries, n8n webhook payload structure, error handling patterns for both services
**Plans**: TBD

Plans:
- [x] 07-01: Implement Directus integration (auth, files, user data)
- [x] 07-02: Build n8n webhook service for chat queries
- [x] 07-03: Connect all features to real APIs with toggle system

### Phase 7.1: Additional fixes (INSERTED) ✓
**Goal**: Fix critical user-specific chat history bug and improve session/DevTools configuration
**Depends on**: Phase 7
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-16

Plans:
- [x] 7.1-01: User-specific chat history in Directus
- [x] 7.1-02: Session duration & DevTools toggle

**Details:**
Phase 7.1 addressed three urgent issues discovered after Phase 7:
1. Chat history was shared across all users (localStorage) - fixed with user-scoped Directus storage
2. Sessions expired after 15 minutes - extended to 7 days via Directus server config
3. ReactQueryDevtools always included in bundle - added environment toggle

### Phase 7.2: Session Persistence Fix (INSERTED)
**Goal**: Fix session persistence bug causing logout on page refresh
**Depends on**: Phase 7.1
**Plans**: 1 plan
**Status**: Complete (2026-01-17)

Plans:
- [x] 7.2-01: Fix Directus SDK authentication to use SDK-managed storage

**Details:**
Phase 7.2 addresses critical session persistence bug discovered after Phase 7.1:
- Users get 401 "Invalid user credentials" on page refresh
- Session doesn't persist across browser restarts
- Root cause: Manual localStorage management conflicts with Directus SDK's internal auth storage
- Solution: Let SDK fully manage authentication lifecycle (storage, restoration, auto-refresh)

### Phase 7.3: Directory Structure Integration (INSERTED) ✓
**Goal**: Enhance Knowledge Base with folder hierarchy navigation and improved file management
**Depends on**: Phase 7.2
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-17

Plans:
- [x] 7.3-01: Implement folder hierarchy components
- [x] 7.3-02: Integrate folder sidebar and view toggle

**Details:**
Phase 7.3 addresses Knowledge Base UX improvements requested after Phase 7.2:
1. Directory Structure Integration (Sidebar and Navigation):
   - Folder hierarchy with multi-level nesting support
   - Dynamic file list filtered by selected folder
   - Header with folder name and file count display
   - List View and Grid View toggle buttons
2. File Selection and Action Refinement:
   - Remove "Preview" button from file details modal
   - Implement functional "Download" button

### Phase 7.4: Fix files download (INSERTED) ✓
**Goal**: Fix file download functionality issues
**Depends on**: Phase 7.3
**Plans**: 1/1 complete
**Status**: Complete
**Completed**: 2026-01-17

Plans:
- [x] 7.4-01: Fix download URL path concatenation and authentication

**Details:**
Phase 7.4 addresses critical file download bugs discovered after Phase 7.3:
1. Double-slash bug in URL construction (404 errors) - fixed by removing leading slash
2. Missing authentication on asset requests (403 errors) - fixed by adding Bearer token header
3. Downloads now work end-to-end with correct URL formatting and authentication

### Phase 7.5: Login page design overhaul and redirect fix (INSERTED) ✓
**Goal**: Polish login page with modern purple theme and prevent authenticated users from accessing login
**Depends on**: Phase 7.4
**Plans**: 1/1 complete
**Status**: Complete
**Completed**: 2026-01-17

Plans:
- [x] 7.5-01: Login page redesign and authenticated redirect

**Details:**
Phase 7.5 addresses login page UX improvements requested after Phase 7.4:
1. Complete visual redesign matching reference design (USER_IMPUT_FILES/Design/Login/):
   - Modern purple/white theme (#8466e4) replacing old blue
   - Atom icon in purple gradient circle
   - Russian branding text (Nexus AI, Вход в систему, Войти)
   - Consistent rounded-3xl styling and h-14 heights for all form elements
   - Fixed footer with Russian copyright text
2. Authenticated user redirect:
   - Prevents logged-in users from accessing /login page
   - Auto-redirects to /chat using React Router navigate with replace: true
   - Fixes UX issue from USER_IMPUT_FILES/TO_DO.md

### Phase 8: Configuration Refactoring & UX Enhancements ✓
**Goal**: Simplify configuration architecture and improve user experience across chat and knowledge base
**Depends on**: Phase 7.5
**Research**: Unlikely (internal refactoring and UI improvements)
**Plans**: 5/5 complete
**Status**: Complete (parallel execution)
**Completed**: 2026-01-20

Plans:
- [x] 08-01: Remove Settings Page API configuration, migrate to .env with Nginx-based routing
- [x] 08-02: Add Markdown rendering for chat responses
- [x] 08-03: Isolate chat contexts (separate history per mode)
- [x] 08-04: Fix layout and scrolling (fixed sidebar/header, scrollable content)
- [x] 08-05: Add file management to Knowledge Base (create folders, upload files)

**Details:**
Phase 8 addresses architectural improvements and UX enhancements:
1. Configuration Refactoring:
   - Remove frontend Settings page API configuration section (Phase 6)
   - Move endpoint config to .env with single Nginx base URL
   - Rely on Nginx routing rules for Directus/n8n traffic
2. Chat UX Improvements:
   - Markdown renderer for LLM/RAG responses (headers, lists, code blocks)
   - Isolated chat contexts (separate history for RAG vs LLM modes)
3. Layout & Scrolling Fix:
   - Fixed sidebar, header, and page container (non-scrollable)
   - Scrollable content areas only (chat messages, knowledge base documents)
4. Knowledge Base File Management:
   - Create folders via frontend
   - Upload files directly to Directus

### Phase 9: UI Overhaul ✓
**Goal**: Apply purple theme (#8466e4), Russian localization, file type icons, and modern visual polish across all UI components
**Depends on**: Phase 8
**Research**: None (visual design implementation)
**Plans**: 5/5 complete
**Status**: Complete
**Completed**: 2026-01-21

Plans:
- [x] 09-01: Sidebar user section redesign - Move user controls to sidebar bottom with initials
- [x] 09-02: Chat page visual overhaul - Purple theme for messages, buttons, and mode toggles
- [x] 09-03: Knowledge Base grid view - File type icons with colored backgrounds and checkboxes
- [x] 09-04: Knowledge Base list view - Table with checkboxes, icons, and polished styling
- [x] 09-05: Dialog components redesign - Purple theme and Russian labels for folder/file dialogs

**Details:**
Phase 9 completed comprehensive UI overhaul with purple theme and Russian localization:

1. **Purple Brand Color (#8466e4):**
   - Applied consistently across all primary actions (buttons, focus states, active states)
   - Darker purple (#7049f3) for hover states
   - Replaces previous cyan/blue accents

2. **Layout Improvements:**
   - User section relocated from header to sidebar bottom
   - Avatar displays user initials (first + last name)
   - Header simplified to title-only display
   - Message bubbles with sharp corners (user: top-right, assistant: top-left)
   - Larger avatars (10x10) with refined borders

3. **Russian Localization:**
   - Dialog buttons: "Создать", "Отмена", "Загрузить"
   - Form labels: "Название папки", "Родительская папка", "Корневая папка"
   - Folder/file management UI in Russian

4. **File Type Visualization:**
   - Icons with colored backgrounds: PDF (red), DOCX (blue), XLSX (green), text (gray)
   - Selection checkboxes in grid and list views (visual only, no state management)
   - Polished table styling with light gray headers and hover states

5. **Modern Visual Polish:**
   - Circular purple send button in chat
   - Clean white backgrounds with subtle shadows
   - Consistent spacing and padding throughout
   - Professional, modern appearance

### Phase 10: Knowledgebase page edits
**Goal**: [To be planned]
**Depends on**: Phase 9
**Plans**: 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 10 to break down)

**Details:**
[To be added during planning]

### Phase 11: Table with Containers statuses from Portainer ✓
**Goal**: Transform Settings page into container monitoring dashboard with Portainer integration
**Depends on**: Phase 10
**Research**: Likely (Portainer API integration)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-01-26

Plans:
- [x] 11-01: Portainer API Integration (service layer + React Query hook)
- [x] 11-02: Container Monitoring UI (Settings page transformation + refresh controls)

**Details:**
Phase 11 repurposes the Settings page into a container monitoring dashboard. Removes Chat Preferences section and replaces with a table showing Docker container statuses from Portainer. Features include:
- Portainer API service layer with real/mock toggle (following established patterns)
- Container status table with color-coded indicators (green/red/yellow)
- Manual refresh button with timestamp showing last update
- Purple theme and Russian localization matching Phase 9 design
- Read-only monitoring (no container actions)

### Phase 12: Small improvements and fixes ✓
**Goal**: Polish UI/UX with incremental improvements across chat and knowledge base interfaces
**Depends on**: Phase 11
**Research**: Unlikely (internal UI/UX improvements)
**Plans**: 5/5 complete
**Status**: Complete
**Completed**: 2026-01-30

Plans:
- [x] 12-01: UI/UX Polish (typing indicator + download loading state fix)
- [x] 12-02: Extract Detail Panel Component
- [x] 12-03: File Management Features (inline editing + folder relocation)
- [x] 12-04: Webhook Session Key
- [x] 12-05: Streaming Responses Implementation

**Details:**
Phase 12 addresses incremental improvements and polish identified during user testing:
1. UI/UX Polish:
   - Typing indicator for bot responses (animated dots)
   - Fix download loading state scoping (per-file instead of global)
2. Component Extraction:
   - Extract detail panel from KnowledgeBase.tsx into reusable component
3. Layout Refinement:
   - Improve spacing, alignment, and visual hierarchy in Knowledge Base
4. Folder Tree Enhancement:
   - Better expand/collapse UX and visual indicators
5. Streaming Responses:
   - Implement real-time streaming for chat responses

### Phase 13: User Roles and Permissions ✓
**Goal**: Implement user roles and permissions system
**Depends on**: Phase 12
**Research**: Likely (Directus roles/permissions API, frontend route guarding patterns)
**Plans**: 2/2 complete
**Status**: Complete
**Completed**: 2026-02-01

Plans:
- [x] 13-01: Role Infrastructure (User type, usePermissions hook, ProtectedRoute)
- [x] 13-02: UI Gating (Sidebar, routes, Knowledge Base CRUD controls)

**Details:**
Phase 13 implements three-tier role-based access control:
1. Role Infrastructure:
   - User type extended with frontend_role field from Directus
   - usePermissions hook with boolean permissions (canAccessSettings, canManageFiles)
   - ProtectedRoute enhanced with optional allowedRoles prop
2. UI Gating:
   - Sidebar Settings link hidden for non-administrators
   - /settings route protected, unauthorized silently redirected to /chat
   - Knowledge Base CRUD controls hidden for user role
   - FileDetailPanel Edit/Delete hidden, Download always visible
   - No visual gaps — each role sees a complete-feeling app

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 8 → 9 → 10 → 11 → 12 → 13

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 3/3 | Complete | 2026-01-14 |
| 2. Core Layout & Navigation | 3/3 | Complete | 2026-01-14 |
| 3. Authentication System | 3/3 | Complete | 2026-01-14 |
| 4. Chat Interface - Mock Mode | 3/3 | Complete | 2026-01-14 |
| 5. Knowledge Base Interface | 2/2 | Complete | 2026-01-14 |
| 6. Settings Panel | 2/2 | Complete | 2026-01-14 |
| 7. API Integration Layer | 3/3 | Complete | 2026-01-15 |
| 7.1. Additional fixes (INSERTED) | 2/2 | Complete | 2026-01-16 |
| 7.2. Session Persistence Fix (INSERTED) | 1/1 | Complete | 2026-01-17 |
| 7.3. Directory Structure Integration (INSERTED) | 2/2 | Complete | 2026-01-17 |
| 7.4. Fix files download (INSERTED) | 1/1 | Complete | 2026-01-17 |
| 7.5. Login page design overhaul and redirect fix (INSERTED) | 1/1 | Complete | 2026-01-17 |
| 8. Configuration Refactoring & UX Enhancements | 5/5 | Complete | 2026-01-20 |
| 9. UI Overhaul | 5/5 | Complete | 2026-01-21 |
| 10. Knowledgebase page edits | 0/0 | Not planned | - |
| 11. Table with Containers statuses from Portainer | 2/2 | Complete | 2026-01-26 |
| 12. Small improvements and fixes | 5/5 | Complete | 2026-01-30 |
| 13. User Roles and Permissions | 2/2 | Complete | 2026-02-01 |
