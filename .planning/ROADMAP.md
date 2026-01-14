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
- [ ] **Phase 3: Authentication System** - Custom Directus login with session management
- [ ] **Phase 4: Chat Interface - Mock Mode** - Build chat UI with RAG/LLM modes using mock data
- [ ] **Phase 5: Knowledge Base Interface** - Document browsing with view/download capabilities
- [ ] **Phase 6: Settings Panel** - API configuration and chat preference controls
- [ ] **Phase 7: API Integration Layer** - Connect to Directus and n8n with real/mock toggle
- [ ] **Phase 8: Polish & Testing** - End-to-end testing, refinement, and optimization

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
- [ ] 03-03: Implement protected routes and session persistence

### Phase 4: Chat Interface - Mock Mode
**Goal**: Fully functional chat UI with RAG/LLM modes using mock data
**Depends on**: Phase 3
**Research**: Unlikely (internal UI development with mock data)
**Plans**: TBD

Plans:
- [ ] 04-01: Build chat message components and input interface
- [ ] 04-02: Implement RAG Search and LLM Chat mode switching
- [ ] 04-03: Add message history with localStorage persistence

### Phase 5: Knowledge Base Interface
**Goal**: Document browsing interface with view/download capabilities
**Depends on**: Phase 4
**Research**: Unlikely (UI patterns similar to Phase 4, mock data first)
**Plans**: TBD

Plans:
- [ ] 05-01: Create document list and detail views
- [ ] 05-02: Implement view/download functionality with mock data

### Phase 6: Settings Panel
**Goal**: User-configurable settings for API endpoints and chat preferences
**Depends on**: Phase 5
**Research**: Unlikely (internal UI and state management)
**Plans**: TBD

Plans:
- [ ] 06-01: Build settings UI for API configuration
- [ ] 06-02: Implement chat preference controls and persistence toggle

### Phase 7: API Integration Layer
**Goal**: Real API connections to Directus and n8n with seamless mock/real toggle
**Depends on**: Phase 6
**Research**: Likely (external service integration)
**Research topics**: Directus Files API for knowledge base queries, n8n webhook payload structure, error handling patterns for both services
**Plans**: TBD

Plans:
- [ ] 07-01: Implement Directus integration (auth, files, user data)
- [ ] 07-02: Build n8n webhook service for chat queries
- [ ] 07-03: Connect all features to real APIs with toggle system

### Phase 8: Polish & Testing
**Goal**: Production-ready application with verified end-to-end functionality
**Depends on**: Phase 7
**Research**: Unlikely (internal testing and refinement)
**Plans**: TBD

Plans:
- [ ] 08-01: End-to-end testing with real Directus and n8n backends
- [ ] 08-02: UI refinements and performance optimization

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Foundation | 3/3 | Complete | 2026-01-14 |
| 2. Core Layout & Navigation | 3/3 | Complete | 2026-01-14 |
| 3. Authentication System | 0/3 | Not started | - |
| 4. Chat Interface - Mock Mode | 0/3 | Not started | - |
| 5. Knowledge Base Interface | 0/2 | Not started | - |
| 6. Settings Panel | 0/2 | Not started | - |
| 7. API Integration Layer | 0/3 | Not started | - |
| 8. Polish & Testing | 0/2 | Not started | - |
