# Blocks API Documentation


## Overview

Blocks API provides capabilities for retrieving, creating, updating, and deleting various types of content blocks. It supports paragraphs, headings, lists, multimedia, layout, and other block types, as well as complete color and formatting features.


## Basic Information


### API Version


```
v1
```


### Base URL


#### Environment


```
https://api.buildin.ai/v1
```


### Authentication

All API requests must include a valid bot token in the Authorization header:


```http
Authorization: Bearer <bot_token>
```


> **Getting Bot Token:** Please refer to the Plugin Development Guide to learn how to create integration applications and obtain bot access tokens.


## API Endpoints


### 1. Get Single Block

Retrieve detailed information about a specific block.

**Request**


```http
GET /v1/blocks/{block_id}
```

**Path Parameters**

- `block_id` (string, required): The ID of the block to retrieve
**Response Example**


```json
{
  "object": "block",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "parent": {
    "type": "block_id",
    "block_id": "550e8400-e29b-41d4-a716-446655440001"
  },
  "created_time": "2023-12-01T10:00:00.000Z",
  "created_by": {
    "object": "user",
    "id": "user-550e8400-e29b-41d4-a716-446655440000"
  },
  "last_edited_time": "2023-12-01T10:30:00.000Z",
  "last_edited_by": {
    "object": "user",
    "id": "user-550e8400-e29b-41d4-a716-446655440001"
  },
  "archived": false,
  "has_children": true,
  "type": "paragraph",
  "data": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a paragraph block",
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
        "plain_text": "This is a paragraph block",
        "href": null
      }
    ],
    "text_color": "default",
    "background_color": "default"
  }
}
```


### 2. Get Block Children

Retrieve the direct children of a specific block, with pagination support.

**Request**


```http
GET /v1/blocks/{block_id}/children
```

**Path Parameters**

- `block_id` (string, required): Parent block ID
**Query Parameters**

- `page_size` (integer, optional): Number of blocks to return per page, range 1-100, default 50
- `start_cursor` (string, optional): Pagination cursor, using child block ID as cursor value
**Response Example**


```json
{
  "object": "list",
  "results": [
    {
      "object": "block",
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "type": "paragraph",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Child block content",
              "link": null
            }
          }
        ],
        "text_color": "default",
        "background_color": "default"
      }
    }
  ],
  "next_cursor": "550e8400-e29b-41d4-a716-446655440002",
  "has_more": true,
  "type": "block",
  "block": {}
}
```


### 3. Append Child Blocks

Append one or more child blocks to a specific block.

**Request**


```http
PATCH /v1/blocks/{block_id}/children
```

**Path Parameters**

- `block_id` (string, required): Parent block ID
**Request Body**


```json
{
  "children": [
    {
      "type": "paragraph",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "New paragraph content",
              "link": null
            },
            "annotations": {
              "bold": false,
              "italic": false,
              "strikethrough": false,
              "underline": false,
              "code": false,
              "color": "default"
            }
          }
        ],
        "text_color": "blue",
        "background_color": "yellow"
      }
    }
  ]
}
```

**Limitations**

- Maximum 100 child blocks per request
- Each child block must specify a valid type
**Response Example**


```json
{
  "object": "list",
  "results": [
    {
      "object": "block",
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "type": "paragraph",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "New paragraph content",
              "link": null
            }
          }
        ],
        "text_color": "blue",
        "background_color": "yellow"
      }
    }
  ],
  "next_cursor": null,
  "has_more": false,
  "type": "block",
  "block": {}
}
```


### 4. Update Block

Update the content, type, or properties of an existing block.

**Request**


```http
PATCH /v1/blocks/{block_id}
```

**Path Parameters**

- `block_id` (string, required): The ID of the block to update

#### 4.1 Update Block Content

**Request Body Example**


```json
{
  "data": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "Updated paragraph content",
          "link": null
        },
        "annotations": {
          "bold": true,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "red"
        }
      }
    ],
    "text_color": "red",
    "background_color": "yellow"
  }
}
```


#### 4.2 Change Block Type

**Request Body Example**


```json
{
  "type": "heading_1",
  "data": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "Now it's a heading",
          "link": null
        },
        "annotations": {
          "bold": true,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "default"
        }
      }
    ],
    "text_color": "blue",
    "background_color": "default"
  }
}
```


#### 4.3 Archive Block

**Request Body Example**


```json
{
  "archived": true
}
```

**Response Example**


```json
{
  "object": "block",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "heading_1",
  "data": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "Now it's a heading",
          "link": null
        }
      }
    ],
    "text_color": "blue",
    "background_color": "default"
  }
}
```


### 5. Delete Block

Delete a specific block and all its child blocks. This operation is irreversible.

**Request**


```http
DELETE /v1/blocks/{block_id}
```

**Path Parameters**

- `block_id` (string, required): The ID of the block to delete
**Response Example**


```json
{
  "object": "block",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "deleted": true
}
```


## Supported Block Types

Buildin Blocks API supports rich block types covering text, media, layout, and other content forms:


### Block Type Overview


| Category | Block Types | Description |
| --- | --- | --- |
| Text Blocks | paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item, to_do, quote, toggle | Basic text content blocks supporting rich text formatting and colors |
| Media Blocks | code, image, file, bookmark, embed | Code, images, files, and other media content blocks |
| Special Blocks | callout, equation, link_to_page, template, synced_block | Special functional blocks like callouts, formulas, page references, etc. |
| Layout Blocks | divider, column_list, column, table, table_row | Structural blocks for page layout |
| Child Object Blocks | child_page, child_database | Blocks that reference child pages and child databases |


### Color Support

All text block types support a dual-color system:

- **Block-level colors**: `text_color` and `background_color`
- **Rich text-level colors**: `annotations.color`
Supported color values: `default`, `gray`, `brown`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red`


> **Detailed Description:** For specific object structures, property definitions, and usage examples for each block type, please refer to the Block Objects Documentation.


## Rich Text Objects

Rich text objects are used to represent formatted text content and support the following types:


### Supported Rich Text Types


| Type | Description | Usage |
| --- | --- | --- |
| text | Basic text content | Supports links, formatting (bold, italic, strikethrough, underline, code, color) |
| mention | Mention objects | User mentions (@user), page mentions, date mentions |
| equation | Mathematical formulas | LaTeX format mathematical expressions |


### Formatting Support

All rich text types support `annotations` formatting:

- **Styles**: `bold`, `italic`, `strikethrough`, `underline`, `code`
- **Colors**: `color` (supports all standard color values)
- **Links**: `href` and `text.link`

> **Detailed Description:** For complete structure definitions and usage examples of rich text objects, please refer to the Block Objects Documentation.


## Usage Examples


### Create Complex Content Structure


```http
PATCH /v1/blocks/parent-block-id/children
Authorization: Bearer your_bot_token
Content-Type: application/json

{
  "children": [
    {
      "type": "heading_1",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Project Documentation",
              "link": null
            },
            "annotations": {
              "bold": true,
              "color": "blue"
            }
          }
        ],
        "text_color": "blue",
        "background_color": "default"
      }
    },
    {
      "type": "callout",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "This is an important notice, please read carefully!",
              "link": null
            }
          }
        ],
        "icon": {
          "emoji": "⚠️"
        },
        "text_color": "default",
        "background_color": "yellow"
      }
    },
    {
      "type": "paragraph",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Project Lead: ",
              "link": null
            }
          },
          {
            "type": "mention",
            "mention": {
              "type": "user",
              "user": {
                "id": "user-123"
              }
            }
          },
          {
            "type": "text",
            "text": {
              "content": ", Due Date: ",
              "link": null
            }
          },
          {
            "type": "mention",
            "mention": {
              "type": "date",
              "date": {
                "start": "2023-12-31",
                "end": null,
                "time_zone": null
              }
            }
          }
        ],
        "text_color": "default",
        "background_color": "default"
      }
    },
    {
      "type": "to_do",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Complete requirements analysis",
              "link": null
            }
          }
        ],
        "checked": true,
        "text_color": "green",
        "background_color": "default"
      }
    },
    {
      "type": "to_do",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "Complete code development",
              "link": null
            }
          }
        ],
        "checked": false,
        "text_color": "default",
        "background_color": "default"
      }
    },
    {
      "type": "code",
      "data": {
        "rich_text": [
          {
            "type": "text",
            "text": {
              "content": "function calculateProgress() {\n  const completed = tasks.filter(t => t.done).length;\n  const total = tasks.length;\n  return (completed / total) * 100;\n}",
              "link": null
            }
          }
        ],
        "language": "javascript"
      }
    },
    {
      "type": "divider",
      "data": {}
    },
    {
      "type": "table",
      "data": {
        "table_width": 3,
        "has_column_header": true,
        "has_row_header": false
      }
    }
  ]
}
```


### Update Block Content and Colors


```http
PATCH /v1/blocks/block-id
Authorization: Bearer your_bot_token
Content-Type: application/json

{
  "data": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is updated content, ",
          "link": null
        },
        "annotations": {
          "bold": true,
          "color": "red"
        }
      },
      {
        "type": "text",
        "text": {
          "content": "part of the text has special formatting.",
          "link": null
        },
        "annotations": {
          "italic": true,
          "underline": true,
          "color": "blue"
        }
      }
    ],
    "text_color": "default",
    "background_color": "yellow"
  }
}
```


## Error Handling


### HTTP Status Codes


| Status Code | Description |
| --- | --- |
| 200 | Request successful |
| 400 | Bad request parameters |
| 401 | Authentication failed, invalid or expired token |
| 403 | Insufficient permissions, bot lacks access rights |
| 404 | Block does not exist or has been deleted |
| 422 | Request format correct but contains semantic errors |
| 429 | Request rate limit exceeded |
| 500 | Server error |


### Error Response Format


```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Request parameter validation failed",
  "details": {
    "field": "children",
    "reason": "Must provide at least one child block"
  }
}
```


### Common Error Types


#### 1. Parameter Validation Error (validation_error)


```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Must provide at least one child block"
}
```


#### 2. Insufficient Permissions (forbidden)


```json
{
  "object": "error",
  "status": 403,
  "code": "forbidden",
  "message": "Bot does not have permission to access this block"
}
```


#### 3. Block Not Found (not_found)


```json
{
  "object": "error",
  "status": 404,
  "code": "not_found",
  "message": "Specified block does not exist"
}
```


#### 4. Unsupported Block Type (unsupported_block_type)


```json
{
  "object": "error",
  "status": 422,
  "code": "unsupported_block_type",
  "message": "Unsupported block type: invalid_type"
}
```


## API Limits


### Request Limits

- **Single block creation count**: Maximum 100 child blocks
- **Rich text length**: Maximum 2000 characters per rich text paragraph
- **Nesting depth**: Block nesting depth not exceeding 50 levels
- **Page size**: Maximum page size for pagination queries is 100

### Rate Limits

- **Read operations**: 1000 requests per minute
- **Write operations**: 100 requests per minute
- **Batch operations**: 10 requests per minute

### Storage Limits

- **File size**: Maximum 100MB per file
- **Image dimensions**: Maximum 20MB, recommended not to exceed 4K
- **Total storage**: Limited by space plan

## Best Practices


### 1. Operation Optimization

- **Batch operations**: Create multiple blocks at once instead of one by one
- **Pagination handling**: Use pagination for large numbers of child blocks
- **Reasonable usage**: Avoid unnecessary API calls

### 2. Error Handling

- **Retry mechanism**: Implement reasonable retry for temporary errors
- **Graceful degradation**: Provide alternative solutions when certain block types are not supported
- **User feedback**: Provide clear error messages to users

### 3. Content Structure

- **Clear hierarchy**: Use heading levels reasonably to organize content
- **Consistent formatting**: Maintain consistent formatting for the same type of content
- **Moderate colors**: Avoid excessive use of colors that cause visual interference

### 4. Permission Management

- **Minimum permissions**: Bot should only request necessary permissions
- **Permission checking**: Check bot permissions before operations
- **Error handling**: Handle insufficient permission scenarios

## Quick Reference


### Common Block Type Creation Templates


#### Paragraph


```json
{
  "type": "paragraph",
  "data": {
    "rich_text": [{"type": "text", "text": {"content": "Content"}}],
    "text_color": "default",
    "background_color": "default"
  }
}
```


#### Heading


```json
{
  "type": "heading_1",
  "data": {
    "rich_text": [{"type": "text", "text": {"content": "Title"}}],
    "text_color": "default",
    "background_color": "default"
  }
}
```


#### To-do


```json
{
  "type": "to_do",
  "data": {
    "rich_text": [{"type": "text", "text": {"content": "Task"}}],
    "checked": false,
    "text_color": "default",
    "background_color": "default"
  }
}
```


#### Code Block


```json
{
  "type": "code",
  "data": {
    "rich_text": [{"type": "text", "text": {"content": "Code"}}],
    "language": "javascript"
  }
}
```


#### Callout Block


```json
{
  "type": "callout",
  "data": {
    "rich_text": [{"type": "text", "text": {"content": "Notice"}}],
    "icon": {"emoji": "💡"},
    "text_color": "default",
    "background_color": "yellow"
  }
}
```

