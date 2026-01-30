---
phase: 12-small-improvements-and-fixes
plan: 01
subsystem: ui
tags: [react, typescript, tailwind, react-query, ux]

# Dependency graph
requires:
  - phase: 09-design-system-refinement
    provides: Purple brand color (#8466e4) for primary actions and states
  - phase: 11-knowledge-base-fixes
    provides: Pattern of scoped loading states (not global)
provides:
  - Typing indicator pattern for async operations in chat
  - Scoped loading state pattern for download mutations
affects: [13-streaming-responses, chat, knowledge-base]

# Tech tracking
tech-stack:
  added: []
  patterns: [typing-indicator, scoped-loading-state]

key-files:
  created: []
  modified: [src/pages/Chat.tsx, src/pages/KnowledgeBase.tsx, src/components/FileListView.tsx]

key-decisions:
  - "Used bouncing dots animation with staggered delays for typing indicator instead of Loader2 spinner"
  - "Implemented downloadingFileId state to track specific file being downloaded instead of global mutation state"

patterns-established:
  - "Typing indicator: Display animated dots in MessageBubble-style container while mutation isPending"
  - "Scoped loading: Store item ID being processed in local state, check both isPending && itemId === currentId"

issues-created: []

# Metrics
duration: 15min
completed: 2026-01-30
---

# Phase 12 Plan 1: UI/UX Polish Summary

**Animated typing indicator for bot responses and per-file download loading states in Knowledge Base**

## Performance

- **Duration:** 15 min
- **Started:** 2026-01-30T[start-time]
- **Completed:** 2026-01-30T[end-time]
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added animated typing indicator that appears during bot response generation, providing visual feedback to users
- Fixed download button loading state bug where all files showed spinners instead of only the downloading file
- Established pattern for scoped loading states in list/grid views

## Task Commits

Each task was committed atomically:

1. **Task 1: Add typing indicator for bot responses** - `ed07206` (feat)
2. **Task 2: Fix download loading state scoping** - `22bf085` (fix)

## Files Created/Modified

- `src/pages/Chat.tsx` - Added typing indicator component that displays while chatMutation.isPending, using Avatar with Bot icon and three bouncing dots with staggered animation
- `src/pages/KnowledgeBase.tsx` - Added downloadingFileId state to track specific file being downloaded, updated grid view download button to show spinner only for downloading file
- `src/components/FileListView.tsx` - Added downloadingFileId state and updated list view download button to match grid view behavior

## Decisions Made

- **Typing indicator animation:** Used three bouncing dots with staggered animation delays (0ms, 150ms, 300ms) instead of Loader2 spinner for more natural "thinking" appearance
- **Download state management:** Implemented local downloadingFileId state instead of checking mutation.variables because it provides clearer intent and handles error cases explicitly with onError callback
- **Consistent styling:** Typing indicator matches MessageBubble assistant styling (left-aligned, gray background, bot avatar) for visual consistency

## Deviations from Plan

None - plan executed exactly as written

## Issues Encountered

None

## Next Phase Readiness

Ready for 12-02-PLAN.md (Extract Detail Panel Component). The typing indicator pattern can be referenced for other async loading states, and the scoped loading pattern is now established for list/grid views.

---
*Phase: 12-small-improvements-and-fixes*
*Completed: 2026-01-30*
