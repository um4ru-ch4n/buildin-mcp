# Search API Documentation


## Overview

The Search API allows bots to perform intelligent searches within their authorized page scope. This interface supports full-text search and semantic search, returning relevant page results.


## API Details


### Search Pages

Search for relevant content within the bot's authorized page scope.

**Request Method:** `POST /v1/search`

**Request Headers:**


```
Authorization: Bearer your_bot_token_here
Content-Type: application/json
```

**Request Parameters:**


| Parameter | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| query | string | No | Search keywords | "" |
| start_cursor | string | No | Pagination cursor for getting next page results | - |
| page_size | number | No | Number of results per page, range 1-100 | 10 |

**Request Example:**


```json
{
  "query": "project plan",
  "start_cursor": "eyJvZmZzZXQiOjEwfQ==",
  "page_size": 20
}
```

**Response Format:**


```json
{
  "object": "list",
  "results": [
    {
      "object": "page",
      "id": "a1b2c3d4-5678-9012-3456-789012345678",
      "created_time": "2024-01-01T10:00:00.000Z",
      "last_edited_time": "2024-01-15T14:30:00.000Z",
      "parent": {
        "type": "database_id",
        "database_id": "d9824bdc-8445-4327-be8b-5b47500af6ce"
      },
      "archived": false,
      "properties": {
        "title": {
          "type": "title",
          "title": [
            {
              "type": "text",
              "text": {
                "content": "Project Plan Document"
              }
            }
          ]
        }
      }
    }
  ],
  "next_cursor": "eyJvZmZzZXQiOjIwfQ==",
  "has_more": true
}
```


## Response Object Description


### Search Result Object


| Property | Type | Description |
| --- | --- | --- |
| object | string | Fixed value "list" |
| results | Array<PageResult> | Array of search result pages |
| next_cursor | string | null | Next page cursor, null indicates no more results |
| has_more | boolean | Whether there are more results |


### Page Result Object


| Property | Type | Description |
| --- | --- | --- |
| object | string | Fixed value "page" |
| id | string | Unique identifier of the page |
| created_time | string | Page creation time (ISO 8601 format) |
| last_edited_time | string | Page last edited time (ISO 8601 format) |
| parent | ParentObject | Parent object of the page |
| archived | boolean | Whether the page is archived |
| properties | Object | Page properties, including title and other information |


### Parent Object Types

The parent object of a page can be one of the following types:


#### 1. Space Parent


```json
{
  "type": "space_id",
  "space_id": "workspace-uuid"
}
```


#### 2. Database Parent


```json
{
  "type": "database_id",
  "database_id": "database-uuid"
}
```


#### 3. Page Parent


```json
{
  "type": "page_id",
  "page_id": "page-uuid"
}
```


#### 4. Block Parent


```json
{
  "type": "block_id",
  "block_id": "block-uuid"
}
```


## Search Behavior


### Search Scope

- Search is limited to pages that the bot has authorized access to
- Includes page titles and page content
- Supports fuzzy matching and semantic search

### Search Result Sorting

- Default sorting by relevance
- When relevance is the same, sorted by last edited time in descending order

### Pagination Mechanism

- Uses Base64 encoded JSON cursor for pagination
- Cursor contains offset information: `{"offset": 20}`
- Maximum page size is 100 items

## Usage Examples


### Basic Search


```
curl -X POST https://api.buildin.ai/v1/search \
  -H "Authorization: Bearer your_bot_token" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "meeting minutes",
    "page_size": 10
  }'
```


### Paginated Search


```
# Get first page
curl -X POST https://api.buildin.ai/v1/search \
  -H "Authorization: Bearer your_bot_token" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "project",
    "page_size": 20
  }'

# Get next page (using returned next_cursor)
curl -X POST https://api.buildin.ai/v1/search \
  -H "Authorization: Bearer your_bot_token" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "project",
    "start_cursor": "eyJvZmZzZXQiOjIwfQ==",
    "page_size": 20
  }'
```


### Empty Query Search


```
# Returns all authorized pages
curl -X POST https://api.buildin.ai/v1/search \
  -H "Authorization: Bearer your_bot_token" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "",
    "page_size": 50
  }'
```


## Error Handling


### Common Error Codes


| Status Code | Error Code | Description |
| --- | --- | --- |
| 400 | validation_error | Request parameter format error |
| 401 | unauthorized | No valid authentication token provided |
| 403 | forbidden | Bot does not have search permissions |
| 429 | rate_limit | Request frequency exceeds limit |
| 500 | internal_error | Internal server error |


### Error Response Example


```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "page_size must be between 1 and 100"
}
```


## Permission Requirements

- Bot must have `readContent` permission
- Can only search pages that the bot has authorized access to
- Search results are automatically filtered to exclude pages without access permissions

## Performance Recommendations

**Reasonable Use of Pagination**: Recommend using default page size, avoid requesting too much data at once

**Search Term Optimization**: Using specific keywords can achieve better search results

**Frequency Control**: Avoid overly frequent search requests, recommend implementing appropriate debounce mechanisms

