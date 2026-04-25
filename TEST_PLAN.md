# Test Plan: buildin-mcp Full Functional Test

## Pre-requisites
- MCP server running in Docker on port 39271
- MCP connected in Claude Code config: `http://localhost:39271/mcp?token=<TOKEN>`
- All tools must work through MCP protocol (no curl workarounds)

## Phase 1: Page & Blocks

### 1.1 Create test page
- [x] `create_page` — create "MCP Test Page" in root (no parent)
- [x] Verify page appears in Buildin UI

### 1.2 Add diverse blocks
- [x] `append_block_children` — add to test page:
  - heading_1 (blue text)
  - paragraph with **bold**, *italic*, ~~strikethrough~~, `code` formatting
  - heading_2
  - 3x bulleted_list_item (one with bold text)
  - 3x numbered_list_item
  - heading_2
  - 3x to_do (one checked, two unchecked)
  - divider
  - heading_2
  - quote (Alan Kay quote)
  - callout (⚠️ icon, yellow background)
  - heading_3
  - code block (TypeScript)
  - heading_3
  - bookmark (GitHub URL)
  - equation (E=mc²)
  - paragraph with colored text (red/green/blue)
- [x] Verify all blocks render correctly in UI

### 1.3 Read blocks
- [x] `get_page` — verify page metadata
- [x] `get_block_children` — verify all blocks are returned
- [x] `get_block` — get single block by ID

## Phase 2: Database

### 2.1 Create database
- [x] `create_database` — create "Test Task Board" inside test page with fields:
  - Task Name (title)
  - Status (select: Backlog/In Progress/Review/Done)
  - Priority (select: Low/Medium/High)
  - Tags (multi_select: bug/feature/docs/infra)
  - Due Date (date)
  - Completed (checkbox)
  - Estimated Hours (number)
- [x] `get_database` — verify schema

### 2.2 Create records (fully filled)
- [x] `create_page` with parent=database_id — "Fix login timeout bug"
  - Status: In Progress, Priority: High, Tags: bug, Due: Apr 28, Hours: 4
- [x] `create_page` — "Add dark mode support"
  - Status: Backlog, Priority: Medium, Tags: feature, Due: May 10, Hours: 8
- [x] `create_page` — "Write API documentation"
  - Status: Review, Priority: Low, Tags: docs, Due: May 1, Hours: 3

### 2.3 Create records (partially filled)
- [x] `create_page` — "Setup CI/CD pipeline"
  - Status: Done, Priority: High, Tags: infra, Completed: true (rest default)
- [x] `create_page` — "Refactor auth middleware"
  - Status: In Progress, Tags: feature+bug (rest default)

### 2.4 Read database
- [x] `query_database` — verify all 5 records returned with correct properties

### 2.5 Verify in UI
- [x] Check that DB appears inline inside test page
- [x] Verify all records and field values display correctly

## Phase 3: Updates

### 3.1 Update page blocks
- [x] `update_block` — change heading_1 text to "Updated Main Section"
- [x] `update_block` — check the "Write documentation" to-do item
- [x] Verify changes in UI

### 3.2 Update database records
- [x] `update_page` — "Add dark mode support": change Status → In Progress, Priority → High
- [x] `update_page` — "Write API documentation": set Completed → true, Status → Done
- [x] Verify changes in UI

### 3.3 Update database schema
- [x] `update_database` — add new property "Notes" (rich_text type)
- [x] Verify new column appears in UI

## Phase 4: Search & User

### 4.1 Search
- [x] `search` — query "MCP Test" → found test page
- [x] `search` — query "Task Board" → returned empty (databases not indexed by search)
- [x] `search` — empty query → returns accessible pages

### 4.2 User
- [x] `get_me` — returns bot creator info (um4ru_ch4n, 17515560@mail.ru)

## Phase 5: Deletion

### 5.1 Delete blocks from page
- [x] `delete_block` — delete the quote block
- [x] `delete_block` — delete the equation block
- [x] Verify blocks disappeared from page

### 5.2 Delete database records
- [x] `delete_block` — delete "Setup CI/CD pipeline" record
- [x] `delete_block` — delete "Refactor auth middleware" record
- [x] `query_database` — verified 3 records remain (+ 1 template from UI)
- [x] Verify in UI

### 5.3 Cleanup
- [x] `update_page` — archive test page (archived: true)
- [x] `update_page` — archive "Root Test Page" (archived: true)
- [x] Verify pages no longer visible in workspace

## Summary of tools tested
- [x] search
- [x] get_me
- [x] create_page (root + in database)
- [x] get_page
- [x] update_page (properties + archived)
- [x] create_database
- [x] get_database
- [x] update_database
- [x] query_database
- [x] get_block
- [x] get_block_children
- [x] append_block_children
- [x] update_block
- [x] delete_block

**Result: 14/14 tools passed**

## Known Limitations (Buildin API, not MCP server)

1. **DB templates** — Database record templates are UI-only; not accessible via REST API
2. **Space root pages** — Cannot create pages directly in space root; API creates under default "Page created by API" container
3. **create_page in DB** — Properties (except title) are not applied on creation; requires a follow-up `update_page` call
4. **Search** — Databases are not indexed by search; only pages are returned
