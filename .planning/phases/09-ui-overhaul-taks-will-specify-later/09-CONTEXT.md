# Phase 9: UI-Overhaul - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<vision>
## How This Should Work

This phase is a pixel-perfect implementation of the design mockups. The app already has all functionality working - now it needs to look exactly like the designs.

Five key changes:

1. **Sidebar user section** - Move user icon and logout button from header to bottom of sidebar. Next to the user icon, display the user's name and family name. The icon itself should show initials (first letter of name + first letter of family name).

2. **Chat page** - Match the design exactly as shown in `Chat.png`. Clean white background, purple user messages, gray assistant messages with icon, modern input field with purple send button.

3. **Knowledge base - Tiles view** - Match `Tiles.png` exactly. Cards with file icons, selection checkboxes, metadata display, purple "Добавить" button.

4. **Knowledge base - Lines view** - Match `Lines.png` exactly. List/table format with file icons, names, metadata, selection checkboxes.

5. **Dialogs** - Folder creation dialog matches `Folder_add.png` (clean white modal, purple "Создать" button, dropdown for parent folder). File upload dialog should follow the same design pattern.

</vision>

<essential>
## What Must Be Nailed

- **All five components equally important** - Sidebar, chat, knowledge base (both views), and dialogs all need to match designs for cohesive experience
- **Purple accent color consistency** - The purple theme (#8466e4) must be consistent everywhere: buttons, active states, focus states, icons
- **Pixel-perfect implementation** - Spacing, shadows, border-radius, typography, icon sizes all match the mockups exactly
- **Pure visual changes only** - No backend changes, no API modifications, no new features - ONLY visual/frontend changes

</essential>

<boundaries>
## What's Out of Scope

- **New features or functionality** - This is purely visual polish. No new buttons, actions, or behavior beyond what's in the designs
- **Backend changes** - No API modifications, database schema changes, or backend logic updates
- **Mobile optimization** - Desktop-first implementation. Mobile responsive design is not part of this phase
- **Performance optimization** - Focus is visual accuracy, not performance improvements
- **Internationalization** - Keep existing Russian text as-is, no new translation work

</boundaries>

<specifics>
## Specific Ideas

**Purple theme (#8466e4):**
- Primary buttons (Создать, Добавить, send button)
- Active/selected states (selected files, active tabs)
- Focus states on inputs
- Link hover states

**User initials logic:**
- Extract first letter of `first_name` field
- Extract first letter of `last_name` field
- Display as uppercase (e.g., "ИП" for Иван Петров)

**Reference files:**
- Chat: `USER_IMPUT_FILES/Design/Chat/Chat.png`
- KB Tiles: `USER_IMPUT_FILES/Design/Knowledgebase/Tiles.png`
- KB Lines: `USER_IMPUT_FILES/Design/Knowledgebase/Lines.png`
- Folder dialog: `USER_IMPUT_FILES/Design/Knowledgebase/Folder_add.png`

**Design consistency:**
- All dialogs should follow `Folder_add.png` pattern (white background, clean inputs, purple action buttons)
- File upload dialog mirrors folder creation design
- Consistent spacing, shadows, border-radius across all components

</specifics>

<notes>
## Additional Context

This phase is the final polish before the app is production-ready. Phases 1-8 delivered all functionality - authentication, chat with RAG/LLM modes, knowledge base with folders, file management. Now we make it look professional and polished.

User emphasized:
- Everything is equally important (no partial implementation)
- Strictly visual/frontend changes only
- Purple theme consistency is critical
- No backend or API changes whatsoever

</notes>

---

*Phase: 09-ui-overhaul-taks-will-specify-later*
*Context gathered: 2026-01-21*
