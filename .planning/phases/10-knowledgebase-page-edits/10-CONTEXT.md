# Phase 10: Knowledgebase page edits - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<vision>
## How This Should Work

The knowledge base grid and list views should display comprehensive file information at a glance. Each file tile (in both grid and list views) shows:
- File name
- Uploader name (fetched from Directus user data)
- Upload date in Russian (months localized, not English)
- File size
- File type (docx, pdf, etc.)

The list view should use the same tile design as grid view but stacked vertically - one tile per row instead of multiple columns across. This creates visual consistency between the two views while accommodating different browsing preferences.

The detail panel should feel polished and professional with smooth slide-in animation from the right. The panel header reads "Информация о файле" with a close button. Users can download or delete files directly from the panel, with a confirmation dialog protecting against accidental deletions.

</vision>

<essential>
## What Must Be Nailed

- **Enhanced file tile information** - Complete metadata visible at a glance: uploader name, Russian-localized dates, file size, and file type displayed clearly in both grid and list views
- **Visual consistency** - Grid and list views share the same tile design, just different layout (multi-column vs single-column)
- **Russian localization** - All dates, labels, and text in Russian (no English month names)

</essential>

<boundaries>
## What's Out of Scope

- File editing capabilities (renaming, metadata editing) - view and delete only
- Making selection checkboxes functional (bulk actions deferred)
- Advanced features like drag-and-drop, enhanced search/filtering
- File content preview/editing

</boundaries>

<specifics>
## Specific Ideas

**Grid View Enhancements:**
- Under file name: uploader name (from Directus user data)
- Under file name: upload date in Russian (convert English months to Russian)
- Far right: file size and file type (docx, pdf, etc.)

**List View Redesign:**
- Remove current table-based list view component entirely
- Use same tile design as grid view
- Display one tile per row (single column layout)

**Detail Panel Improvements:**
- Smooth slide-in animation from right edge
- Header: "Информация о файле" with close button
- Add delete button next to existing download button
- Delete button triggers warning dialog before deletion
- Display file type information in panel

**Animation:**
- Standard smooth slide-in from right (similar to modern mobile app panels)

</specifics>

<notes>
## Additional Context

Priority is getting complete file information displayed clearly and consistently across both view modes. The user wants Russian localization throughout - no English labels or month names should remain.

The detail panel should feel modern and polished with proper animations and defensive UI (delete confirmation).

File type should be displayed both in the tile (grid/list views) and in the detail panel.

</notes>

---

*Phase: 10-knowledgebase-page-edits*
*Context gathered: 2026-01-24*
