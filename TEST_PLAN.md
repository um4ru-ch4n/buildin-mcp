# Test Plan: buildin-mcp Full Functional Test

## Pre-requisites
- MCP server running in Docker on port 39271
- MCP connected in Claude Code config: `http://localhost:39271/mcp?token=<TOKEN>`
- All tools must work through MCP protocol (no curl workarounds)

## Phase 1: Page & Blocks

### 1.1 Create test page
- [ ] `create_page` — create "MCP Test Page" with icon 🧪 in root (no parent)
- [ ] Verify page appears in Buildin UI

### 1.2 Add diverse blocks
- [ ] `append_block_children` — add to test page:
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
- [ ] Verify all blocks render correctly in UI

### 1.3 Read blocks
- [ ] `get_page` — verify page metadata
- [ ] `get_block_children` — verify all blocks are returned
- [ ] `get_block` — get single block by ID

## Phase 2: Database

### 2.1 Create database
- [ ] `create_database` — create "Test Task Board" inside test page with fields:
  - Task Name (title)
  - Status (select: Backlog/In Progress/Review/Done)
  - Priority (select: Low/Medium/High)
  - Tags (multi_select: bug/feature/docs/infra)
  - Due Date (date)
  - Completed (checkbox)
  - Estimated Hours (number)
- [ ] `get_database` — verify schema

### 2.2 Create records (fully filled)
- [ ] `create_page` with parent=database_id — "Fix login timeout bug"
  - Status: In Progress, Priority: High, Tags: bug, Due: Apr 28, Hours: 4
- [ ] `create_page` — "Add dark mode support"
  - Status: Backlog, Priority: Medium, Tags: feature, Due: May 10, Hours: 8
- [ ] `create_page` — "Write API documentation"
  - Status: Review, Priority: Low, Tags: docs, Due: May 1, Hours: 3

### 2.3 Create records (partially filled — simulating template)
- [ ] `create_page` — "Setup CI/CD pipeline"
  - Status: Done, Priority: High, Tags: infra, Completed: true (rest default)
- [ ] `create_page` — "Refactor auth middleware"
  - Status: In Progress, Tags: feature+bug (rest default)

### 2.4 Read database
- [ ] `query_database` — verify all 5 records returned with correct properties

### 2.5 Verify in UI
- [ ] Check that DB appears inline inside test page
- [ ] Verify all records and field values display correctly

## Phase 3: Updates

### 3.1 Update page blocks
- [ ] `update_block` — change heading_1 text to "Updated Main Section"
- [ ] `update_block` — check the "Write documentation" to-do item
- [ ] Verify changes in UI

### 3.2 Update database records
- [ ] `update_page` — "Add dark mode support": change Status → In Progress, Priority → High
- [ ] `update_page` — "Write API documentation": set Completed → true, Status → Done
- [ ] Verify changes in UI

### 3.3 Update database schema
- [ ] `update_database` — add new property "Notes" (rich_text type)
- [ ] Verify new column appears in UI

## Phase 4: Search & User

### 4.1 Search
- [ ] `search` — query "MCP Test" → should find test page
- [ ] `search` — query "Task Board" → should find database
- [ ] `search` — empty query → should return accessible pages

### 4.2 User
- [ ] `get_me` — returns bot creator info

## Phase 5: Deletion

### 5.1 Delete blocks from page
- [ ] `delete_block` — delete the quote block
- [ ] `delete_block` — delete the equation block
- [ ] Verify blocks disappeared from page

### 5.2 Delete database records
- [ ] `delete_block` — delete "Setup CI/CD pipeline" record
- [ ] `delete_block` — delete "Refactor auth middleware" record
- [ ] `query_database` — verify only 3 records remain
- [ ] Verify in UI

### 5.3 Cleanup
- [ ] `update_page` — archive test page (archived: true)
- [ ] Verify page no longer visible in workspace
- [ ] (Optional) delete page permanently via delete_block

## Summary of tools tested
- [x] search
- [ ] get_me
- [ ] create_page (root + in database)
- [ ] get_page
- [ ] update_page (properties + archived)
- [ ] create_database
- [ ] get_database
- [ ] update_database
- [ ] query_database
- [ ] get_block
- [ ] get_block_children
- [ ] append_block_children
- [ ] update_block
- [ ] delete_block
