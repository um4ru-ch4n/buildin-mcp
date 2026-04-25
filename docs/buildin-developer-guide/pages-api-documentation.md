# Pages API Documentation


## Overview

Pages API provides complete page management capabilities, including:

- **Create pages**: Create new pages in pages or databases
- **Get pages**: Retrieve detailed page information by ID
- **Update pages**: Modify page properties, icons, covers, etc.
- **Get page child blocks**: Get page child block lists (supports pagination and recursion)
Supports creating child pages under regular pages, and also supports creating record pages in databases.


## Base URL


### Production Environment


```
https://api.buildin.ai/v1
```


## Authentication

All API requests must include a valid bot token in the Authorization header:


```
Authorization: Bearer <bot_token>
```


## API Endpoints


### 1. Create Page

Create a new page.

**Request**


```
POST /v1/pages
```

**Request Body**


```json
{
  "parent": {
    "page_id": "Parent Page ID",
    "database_id": "Database ID"
  },
  "icon": {
    "emoji": "📄",
    "external": {
      "url": "Icon URL"
    }
  },
  "cover": {
    "external": {
      "url": "Cover URL"
    }
  },
  "properties": {
    "title": {
      "type": "title",
      "title": [
        {
          "text": {
            "content": "Page Title"
          }
        }
      ]
    }
  }
}
```

**Parameter Descriptions:**


| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| parent | object | No | Parent page or database. If not specified, will be created in default location |
| parent.page_id | string | No | Parent page ID (choose one with database_id) |
| parent.database_id | string | No | Database ID (choose one with page_id) |
| icon | object | No | Page icon |
| icon.emoji | string | No | Emoji icon |
| icon.external | object | No | External icon |
| cover | object | No | Page cover |
| properties | object | Yes | Page properties |


> **Default Parent:** When `parent` is not specified, the page will be created in the default location, which you can find and manage in your workspace.


> **Fault Tolerance:** When the specified `parent.page_id` or `parent.database_id` does not exist, the API will use the default location to create the page, ensuring the creation operation can complete successfully.

**Response**


```json
{
  "object": "page",
  "id": "Page ID",
  "created_time": "2023-12-01T10:00:00.000Z",
  "created_by": {
    "object": "user",
    "id": "User ID"
  },
  "last_edited_time": "2023-12-01T10:00:00.000Z",
  "last_edited_by": {
    "object": "user",
    "id": "User ID"
  },
  "archived": false,
  "properties": {
    "title": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "Page Title"
          }
        }
      ]
    }
  },
  "parent": {
    "type": "page_id",
    "page_id": "Parent Page ID"
  },
  "url": "https://api.buildin.ai/docs/Page ID" // Production environment
}
```


### 2. Get Page

Get detailed page information by page ID.

**Request**


```
GET /v1/pages/{page_id}
```

**Path Parameters**

- `page_id`: Page ID
**Response**


```json
{
  "object": "page",
  "id": "Page ID",
  "created_time": "2023-12-01T10:00:00.000Z",
  "created_by": {
    "object": "user",
    "id": "Creator ID"
  },
  "last_edited_time": "2023-12-01T10:00:00.000Z",
  "last_edited_by": {
    "object": "user",
    "id": "Editor ID"
  },
  "archived": false,
  "properties": {
    "title": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "Page Title"
          }
        }
      ]
    },
    "Description": {
      "id": "property-uuid",
      "type": "rich_text",
      "rich_text": [
        {
          "type": "text",
          "text": {
            "content": "Page description content"
          }
        }
      ]
    }
  },
  "parent": {
    "type": "page_id",
    "page_id": "Parent Page ID"
  },
  "url": "https://api.buildin.ai/docs/Page ID",
  "icon": {
    "type": "emoji",
    "emoji": "📝"
  },
  "cover": {
    "type": "external",
    "external": {
      "url": "https://example.com/cover.jpg"
    }
  }
}
```


### 3. Update Page

Update page properties, icon, cover, or archive status.

**Request**


```
PATCH /v1/pages/{page_id}
```

**Path Parameters**

- `page_id`: Page ID
**Request Body**


```json
{
  "properties": {
    "title": {
      "type": "title",
      "title": [
        {
          "text": {
            "content": "Updated Title"
          }
        }
      ]
    },
    "Description": {
      "type": "rich_text",
      "rich_text": [
        {
          "text": {
            "content": "Updated description"
          }
        }
      ]
    },
    "Status": {
      "type": "select",
      "select": {
        "name": "Completed"
      }
    }
  },
  "icon": {
    "emoji": "✅"
  },
  "cover": {
    "external": {
      "url": "https://example.com/new-cover.jpg"
    }
  },
  "archived": false
}
```

**Response**


```json
{
  "object": "page",
  "id": "Page ID",
  "created_time": "2023-12-01T10:00:00.000Z",
  "created_by": {
    "object": "user",
    "id": "Creator ID"
  },
  "last_edited_time": "2023-12-01T10:30:00.000Z",
  "last_edited_by": {
    "object": "user",
    "id": "Editor ID"
  },
  "archived": false,
  "properties": {
    // Updated properties
  },
  "parent": {
    "type": "page_id",
    "page_id": "Parent Page ID"
  },
  "url": "https://api.buildin.ai/docs/Page ID",
  "icon": {
    "type": "emoji",
    "emoji": "✅"
  },
  "cover": {
    "type": "external",
    "external": {
      "url": "https://example.com/new-cover.jpg"
    }
  }
}
```


### 4. Get Page Child Blocks

Get the child block list of a specified page.

**Request**


```
GET /v1/blocks/{pageId}/children
```


> **Important Note:** Pages in Buildin are special block objects, so the Blocks API's child block retrieval interface is used.

**Query Parameters**

- `page_size` (optional): Number of blocks returned per page, maximum 100, default 50
- `start_cursor` (optional): Pagination cursor, using child block ID as cursor value
- `recursive` (optional): Whether to recursively get all child blocks, `true` or `false`, default `false`
**Response**


```json
{
  "object": "list",
  "results": [
    {
      "object": "block",
      "id": "Block ID",
      "created_time": "2023-12-01T10:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "User ID"
      },
      "last_edited_time": "2023-12-01T10:00:00.000Z",
      "last_edited_by": {
        "object": "user",
        "id": "User ID"
      },
      "archived": false,
      "has_children": true,
      "type": "paragraph",
      "paragraph": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Text content",
              "link": null
            },
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            },
            "plain_text": "Text content",
            "href": null
          }
        ],
        "color": "default"
      }
    }
  ],
  "next_cursor": "abc-123-def-456",
  "has_more": true,
  "type": "block",
  "block": {},
  "page": {
    "id": "Page ID",
    "title": "Page Title"
  },
  "total_count": null,
  "pagination_info": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 125
  }
}
```


## Page Property Formats

Page properties define all property types and formats for pages and database records. For detailed property structures, data types, usage methods, etc., please refer to:

 Page Properties Documentation

This documentation includes complete property specifications:

- **Basic Properties** - title, rich_text, number, checkbox, etc.
- **Selection Properties** - select, multi_select and other dropdown types
- **Relation Properties** - people, files, date and other complex types
- **System Properties** - created_time, created_by and other read-only properties
- **Format Requirements** - Data formats and validation rules for various property types
- **Usage Examples** - Complete examples for creating and updating properties

## Rich Text Object Formats

Rich text objects returned by the API follow unified format specifications. For detailed rich text object structures, supported block types, color definitions, etc., please refer to:

 Block Objects Documentation

This documentation includes complete specification descriptions:

- **Rich Text (RichText)** - Detailed formats for text, mentions, formulas and other types
- **Annotations** - Formatting options like bold, italic, colors, etc.
- **Supported Block Types** - All available block types and their properties
- **Color Definitions** - Complete list of color values
- **Icon Formats** - Emoji, file, external link icons
- **Date Formats** - Support for various date and time formats

## Usage Examples


### Get Direct Child Blocks of Page (Cursor Pagination - Recommended)

**Note:** Pages in Buildin are also a type of block object, so getting page child blocks requires using the Blocks API.


```http
# First page
GET /v1/blocks/abc123/children?page_size=10
Authorization: Bearer your_bot_token

# Use returned next_cursor to get next page
GET /v1/blocks/abc123/children?page_size=10&start_cursor=abc-123-def-456
Authorization: Bearer your_bot_token
```


> **API Reference:** For detailed child block retrieval instructions, please refer to Blocks API Documentation.


### Create New Page


```http
POST /v1/pages
Authorization: Bearer your_bot_token
Content-Type: application/json

{
  "parent": {
    "page_id": "parent-page-id"
  },
  "properties": {
    "title": {
      "type": "title",
      "title": [
        {
          "text": {
            "content": "New Page Title"
          }
        }
      ]
    }
  }
}
```


### Create Page (No Parent Required)

You can create a page without specifying a parent, and the page will be created in the default location:


```http
POST /v1/pages
Authorization: Bearer your_bot_token
Content-Type: application/json

{
  "properties": {
    "title": {
      "type": "title",
      "title": [
        {
          "text": {
            "content": "Generated Meeting Notes"
          }
        }
      ]
    },
    "Content": {
      "type": "rich_text",
      "rich_text": [
        {
          "text": {
            "content": "Generated content"
          }
        }
      ]
    }
  },
  "icon": {
    "emoji": "🤖"
  }
}
```


### Get Page Details


```http
GET /v1/pages/abc123
Authorization: Bearer your_bot_token
```


### Update Page


```http
PATCH /v1/pages/abc123
Authorization: Bearer your_bot_token
Content-Type: application/json

{
  "properties": {
    "title": {
      "type": "title",
      "title": [
        {
          "text": {
            "content": "Updated Page Title"
          }
        }
      ]
    },
    "Description": {
      "type": "rich_text",
      "rich_text": [
        {
          "text": {
            "content": "This is the updated page description"
          }
        }
      ]
    }
  },
  "icon": {
    "emoji": "✅"
  },
  "archived": false
}
```


### Create Database Page

Create a new page (record) in a database:


```http
POST /v1/pages
Authorization: Bearer your_bot_token
Content-Type: application/json

{
  "parent": {
    "database_id": "database-uuid"
  },
  "properties": {
    "Title": {
      "type": "title",
      "title": [
        {
          "text": {
            "content": "New Task"
          }
        }
      ]
    },
    "Status": {
      "type": "select",
      "select": {
        "name": "In Progress"
      }
    },
    "Priority": {
      "type": "select",
      "select": {
        "name": "High"
      }
    },
    "Completed": {
      "type": "checkbox",
      "checkbox": false
    },
    "Due Date": {
      "type": "date",
      "date": {
        "start": "2024-01-15"
      }
    }
  }
}
```


### Batch Update Page Properties


```http
PATCH /v1/pages/abc123
Authorization: Bearer your_bot_token
Content-Type: application/json

{
  "properties": {
    "Status": {
      "type": "select",
      "select": {
        "name": "Completed"
      }
    },
    "Completed": {
      "type": "checkbox",
      "checkbox": true
    },
    "Completion Time": {
      "type": "date",
      "date": {
        "start": "2024-01-10T14:30:00"
      }
    }
  },
  "archived": false
}
```


## Pagination Mechanism Based on subNodes

FlowUs uses a pagination mechanism based on the parent block's `subNodes` field to maintain user-set block order:


### Cursor Format


```
start_cursor = "block_id"
Example: "abc-123-def-456"
```


### How It Works

**Maintain User Sorting**: Strictly return child blocks in the order of the parent block's `subNodes` field

**Simple Cursor**: Use child block ID as cursor, simple and easy to use

**Efficient Query**: Pagination based on array index, excellent performance

**Consistent Order**: Ensure returned child blocks order matches what users see in the interface


### Pagination Logic

Get child block ID list from parent block's `subNodes` array

Find starting position in array based on `start_cursor`

Use array slicing to get current page's child block IDs

Batch query child block details and filter permissions

Return results and next page cursor


## Pagination Features


### Direct Child Block Query (Non-recursive)

- **Based on subNodes**: Use parent block's `subNodes` field for pagination
- **Advantages**:
  - Maintain user-set block order
  - Efficient array index operations
  - Simple and intuitive block ID cursor
  - Maintain order consistency even with new data insertion

### Recursive Child Block Query

- **Offset Pagination**: Use offset for pagination
- **Include Total Count**: Return accurate pagination information
- **Recursive Depth Limit**: Maximum 50 levels to prevent infinite recursion

### Usage Recommendations

**Prioritize non-recursive mode**: Suitable for most scenarios, maintains user sorting

**Set reasonable page size**: Recommend 20-50 items, maximum not exceeding 100

**Use simple cursor**: Block ID-based cursor is more intuitive and easy to use


## Error Handling

The API returns standard HTTP status codes and error information:


### Common Error Codes

- `400 Bad Request`: Request parameter error
  - Missing required `parent` parameter
  - Incorrect `properties` format
  - Invalid icon or cover URL format
  - Parent type doesn't match properties (e.g., using database properties in regular page)
- `401 Unauthorized`: Authentication failed
  - Missing `Authorization` header
  - Token format error or expired
  - Invalid bot token
- `403 Forbidden`: Insufficient permissions
  - Bot lacks required capabilities (e.g., `insertContent`, `updateContent`)
  - Bot doesn't have access to target page
  - Attempting to operate unauthorized pages or databases
- `404 Not Found`: Resource doesn't exist
  - Page ID doesn't exist
  - **Parent page or database doesn't exist** (Fault tolerance: API will use default location to create page)
  - Referenced property or relation object doesn't exist
- `500 Internal Server Error`: Server error
  - Page creation or update failed
  - Operation execution failed
  - Permission validation failed

### Error Response Format


```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Request parameter validation failed: Missing required parent parameter"
}
```


### Specific Scenario Error Examples


#### Create Page Errors


```json
// Missing parent parameter
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Must specify parent.database_id or parent.page_id"
}

// Insufficient bot capabilities
{
  "object": "error",
  "status": 403,
  "code": "forbidden",
  "message": "Bot lacks insertContent capability"
}
```


#### Get Page Errors


```json
// Page doesn't exist
{
  "object": "error",
  "status": 404,
  "code": "not_found",
  "message": "Page does not exist"
}

// Insufficient permissions
{
  "object": "error",
  "status": 403,
  "code": "forbidden",
  "message": "Bot does not have access to this page"
}
```


#### Update Page Errors


```json
// Property type mismatch
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Property type mismatch: Expected title type, received text type"
}

// Insufficient bot capabilities
{
  "object": "error",
  "status": 403,
  "code": "forbidden",
  "message": "Bot lacks updateContent capability"
}
```

