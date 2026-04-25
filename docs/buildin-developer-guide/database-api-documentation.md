# Database API Documentation

Database API provides complete management functionality for Buildin multi-dimensional tables (databases), including creation, querying, retrieval, and update operations.


## Overview

Database API supports the following features:

- Create new databases
- Get database information
- Query database records (supports filtering, sorting, pagination)
- Update database configuration

## Authentication

All API requests must include Bot Token in the Header:


```
Authorization: Bearer <your_bot_token>
```


## Base URL


### Production Environment


```
https://api.buildin.ai/v1
```


## Data Format Description


### Data Format Description

Database API uses standardized data formats to ensure cross-platform compatibility:


## Database Object

Database objects contain the following properties:


```json
{
  "object": "database",
  "id": "uuid",
  "created_time": "2024-01-01T00:00:00.000Z",
  "created_by": {
    "object": "user",
    "id": "uuid"
  },
  "last_edited_time": "2024-01-01T00:00:00.000Z",
  "last_edited_by": {
    "object": "user",
    "id": "uuid"
  },
  "title": [
    {
      "type": "text",
      "text": {
        "content": "Database Title"
      }
    }
  ],
  "icon": {
    "type": "emoji",
    "emoji": "📋"
  },
  "cover": {
    "type": "external",
    "external": {
      "url": "https://example.com/cover.jpg"
    }
  },
  "properties": {
    "property_id": {
      "id": "property_id",
      "name": "Property Name",
      "type": "property_type"
    }
  },
  "parent": {
    "type": "page_id",
    "page_id": "uuid"
  },
  "url": "https://api.buildin.ai/docs/xxx", // Production environment
  "archived": false,
  "is_inline": false
}
```


## Property Types

Supported property types and their configurations:


### Basic Property Types


#### title


```json
{
  "id": "title",
  "name": "Title",
  "type": "title",
  "title": {}
}
```


#### rich_text


```json
{
  "id": "description",
  "name": "Description",
  "type": "rich_text",
  "rich_text": {}
}
```


#### number


```json
{
  "id": "amount",
  "name": "Amount",
  "type": "number",
  "number": {
    "format": "number"
  }
}
```


#### checkbox


```json
{
  "id": "completed",
  "name": "Is Completed",
  "type": "checkbox",
  "checkbox": {}
}
```

**Data Format:**

- API accepts: `{"checkbox": true}` or `{"checkbox": false}`

#### date


```json
{
  "id": "due_date",
  "name": "Due Date",
  "type": "date",
  "date": {}
}
```

**Data Format:**

- API format: `{"start": "2024-01-01T10:30:00", "end": null}`

#### url


```json
{
  "id": "website",
  "name": "Website",
  "type": "url",
  "url": {}
}
```


#### email


```json
{
  "id": "email",
  "name": "Email",
  "type": "email",
  "email": {}
}
```


#### phone_number


```json
{
  "id": "phone",
  "name": "Phone",
  "type": "phone_number",
  "phone_number": {}
}
```


### Selection Property Types


#### select


```json
{
  "id": "status",
  "name": "Status",
  "type": "select",
  "select": {
    "options": [
      {
        "id": "option_id",
        "name": "Option Name",
        "color": "blue"
      }
    ]
  }
}
```


#### multi_select


```json
{
  "id": "tags",
  "name": "Tags",
  "type": "multi_select",
  "multi_select": {
    "options": [
      {
        "id": "option_id",
        "name": "Tag Name",
        "color": "green"
      }
    ]
  }
}
```


### Relation Property Types


#### people


```json
{
  "id": "assignee",
  "name": "Assignee",
  "type": "people",
  "people": {}
}
```

**Data Format:**

- API format: `[{"object": "user", "id": "user-uuid"}]`

#### files


```json
{
  "id": "attachments",
  "name": "Attachments",
  "type": "files",
  "files": {}
}
```

**Data Format:**

- API format: `[{"name": "file.pdf", "type": "external", "external": {"url": "..."}}]`

#### relation


```json
{
  "id": "project",
  "name": "Related Project",
  "type": "relation",
  "relation": {
    "database_id": "related_database_id",
    "synced_property_id": "synced_property_id"
  }
}
```


#### rollup


```json
{
  "id": "task_count",
  "name": "Task Count",
  "type": "rollup",
  "rollup": {
    "relation_property_id": "relation_property_id",
    "rollup_property_id": "property_to_rollup",
    "function": "count"
  }
}
```


#### formula


```json
{
  "id": "calculated_field",
  "name": "Calculated Field",
  "type": "formula",
  "formula": {
    "expression": "prop(\"other_property_id\")",
    "version": 2,
    "refProps": {
      "other_property_id": "Referenced Property Name"
    }
  }
}
```

**Note:** Formula properties mainly support reading, with limited creation and update functionality.


### System Property Types


#### created_time


```json
{
  "id": "created_time",
  "name": "Created Time",
  "type": "created_time",
  "created_time": {}
}
```


#### created_by


```json
{
  "id": "created_by",
  "name": "Created By",
  "type": "created_by",
  "created_by": {}
}
```


#### last_edited_time


```json
{
  "id": "last_edited_time",
  "name": "Last Edited Time",
  "type": "last_edited_time",
  "last_edited_time": {}
}
```


#### last_edited_by


```json
{
  "id": "last_edited_by",
  "name": "Last Edited By",
  "type": "last_edited_by",
  "last_edited_by": {}
}
```


## API Endpoints


### 1. Create Database

Create a new database.


```
POST /v1/databases
```


#### Request Body


```json
{
  "parent": {
    "type": "page_id",
    "page_id": "string"
  },
  "title": [
    {
      "type": "text",
      "text": {
        "content": "string"
      }
    }
  ],
  "icon": {
    "type": "emoji",
    "emoji": "string"
  },
  "cover": {
    "type": "external",
    "external": {
      "url": "string"
    }
  },
  "properties": {
    "property_id": {
      "id": "string",
      "name": "string",
      "type": "property_type"
    }
  },
  "is_inline": false
}
```


#### Parameter Description


| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| parent | object | Yes | Parent page information |
| title | array | Yes | Database title |
| icon | object | No | Database icon |
| cover | object | No | Database cover |
| properties | object | Yes | Database property configuration |
| is_inline | boolean | No | Whether it's an inline database, default false |


#### Response

Returns the created database object.


#### Example


```json
{
  "parent": {
    "type": "page_id",
    "page_id": "123e4567-e89b-12d3-a456-426614174000"
  },
  "title": [
    {
      "type": "text",
      "text": {
        "content": "Task Management"
      }
    }
  ],
  "icon": {
    "type": "emoji",
    "emoji": "📋"
  },
  "properties": {
    "title": {
      "id": "title",
      "name": "Task Name",
      "type": "title"
    },
    "status": {
      "id": "status",
      "name": "Status",
      "type": "select",
      "select": {
        "options": [
          {
            "name": "To Do",
            "color": "red"
          },
          {
            "name": "In Progress",
            "color": "yellow"
          },
          {
            "name": "Done",
            "color": "green"
          }
        ]
      }
    },
    "due_date": {
      "id": "due_date",
      "name": "Due Date",
      "type": "date"
    }
  }
}
```


### 2. Get Database

Get information about a specific database.


```
GET /v1/databases/{database_id}
```


#### Path Parameters


| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| database_id | string | Yes | Database ID |


#### Response

Returns the database object.


### 3. Query Database

Query records in the database, supports filtering, sorting, and pagination.


```
POST /v1/databases/{database_id}/query
```


#### Path Parameters


| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| database_id | string | Yes | Database ID |


#### Request Body


```json
{
  "start_cursor": "string",
  "page_size": 50
}
```


#### Parameter Description


| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| start_cursor | string | No | Pagination cursor |
| page_size | number | No | Page size, maximum 100, default 50 |
| after_created_at | number | No | Filter records with creation time later than this timestamp |
| after_updated_at | number | No | Filter records with update time later than this timestamp |


#### Response


```json
{
  "object": "list",
  "results": [
    {
      "object": "page",
      "id": "uuid",
      "created_time": "2024-01-01T00:00:00.000Z",
      "created_by": {
        "object": "user",
        "id": "uuid"
      },
      "last_edited_time": "2024-01-01T00:00:00.000Z",
      "last_edited_by": {
        "object": "user",
        "id": "uuid"
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
                "content": "Task Title"
              }
            }
          ]
        }
      },
      "parent": {
        "type": "database_id",
        "database_id": "uuid"
      },
      "url": "https://api.buildin.ai/docs/xxx" // Production environment
    }
  ],
  "next_cursor": "string",
  "has_more": false,
  "type": "page",
  "page": {}
}
```


### 4. Update Database

Update database configuration, including title, icon, cover, properties, etc.


```
PATCH /v1/databases/{database_id}
```


#### Path Parameters


| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| database_id | string | Yes | Database ID |


#### Request Body


```json
{
  "title": [
    {
      "type": "text",
      "text": {
        "content": "string"
      }
    }
  ],
  "icon": {
    "type": "emoji",
    "emoji": "string"
  },
  "cover": {
    "type": "external",
    "external": {
      "url": "string"
    }
  },
  "properties": {
    "property_id": {
      "id": "string",
      "name": "string",
      "type": "property_type"
    }
  },
  "archived": false
}
```


#### Parameter Description


| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| title | array | No | Database title |
| icon | object | No | Database icon |
| cover | object | No | Database cover |
| properties | object | No | Properties to update (pass null to delete property) |
| archived | boolean | No | Whether archived |


#### Response

Returns the updated database object.


#### Examples


#### Update Title and Icon


```json
{
  "title": [
    {
      "type": "text",
      "text": {
        "content": "Updated Database Title"
      }
    }
  ],
  "icon": {
    "type": "external",
    "external": {
      "url": "https://example.com/new-icon.png"
    }
  }
}
```


#### Add New Properties


```json
{
  "properties": {
    "assignee": {
      "id": "assignee",
      "name": "Assignee",
      "type": "people"
    },
    "estimated_hours": {
      "id": "estimated_hours",
      "name": "Estimated Hours",
      "type": "number"
    }
  }
}
```


#### Delete Property


```json
{
  "properties": {
    "old_property": null
  }
}
```


#### Archive Database


```json
{
  "archived": true
}
```


## Data Type Support

Database API supports rich data types, including:

- **Basic Types**: Text, number, checkbox, date, URL, email, phone
- **Selection Types**: Single select, multi-select
- **Relation Types**: People, files, relation, rollup, formula
- **System Types**: Created time, created by, last edited time, last edited by
For detailed formats and usage methods of various data types, please refer to the property type descriptions above.


## Error Handling

The API uses standard HTTP status codes to return error information:

- `400 Bad Request`: Request parameter error
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
Error response format:


```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Detailed error message"
}
```


## Usage Limitations

- Each database supports a maximum of 100 properties
- Query returns a maximum of 100 records per page
- Single select and multi-select properties are limited to 100 options
- Database title maximum length is 100 characters
- Formula properties mainly support reading, creation functionality may be limited

## Best Practices

**Pagination Query**: For large databases, it's recommended to use appropriate page sizes for pagination queries

**Filter Optimization**: Use filters reasonably to reduce the amount of returned data

**Property Design**: Design database properties based on actual needs, avoid redundancy

**Permission Management**: Ensure the bot has appropriate read/write permissions

**Error Handling**: Implement appropriate error handling and retry mechanisms

**Data Processing**: Use the format requirements for various data types correctly


## Testing Recommendations

**Verify Type Conversion**: Test creation and querying of various property types

**Check Date Format**: Confirm the correct format for date and time

**Test File Upload**: Verify correct handling of files

**Checkbox Functionality**: Test handling of true/false values

**Formula Properties**: Verify reading and display of complex formulas

**People Properties**: Test correct mapping of user UUIDs


## Example Use Cases


### Task Management System

Create a task management database:


```json
{
  "parent": {
    "type": "page_id",
    "page_id": "workspace-page-id"
  },
  "title": [
    {
      "type": "text",
      "text": {
        "content": "Task Management"
      }
    }
  ],
  "icon": {
    "type": "emoji",
    "emoji": "✅"
  },
  "properties": {
    "name": {
      "id": "name",
      "name": "Task Name",
      "type": "title"
    },
    "status": {
      "id": "status",
      "name": "Status",
      "type": "select",
      "select": {
        "options": [
          {"name": "To Do", "color": "red"},
          {"name": "In Progress", "color": "yellow"},
          {"name": "Done", "color": "green"}
        ]
      }
    },
    "assignee": {
      "id": "assignee",
      "name": "Assignee",
      "type": "people"
    },
    "due_date": {
      "id": "due_date",
      "name": "Due Date",
      "type": "date"
    },
    "priority": {
      "id": "priority",
      "name": "Priority",
      "type": "select",
      "select": {
        "options": [
          {"name": "Low", "color": "green"},
          {"name": "Medium", "color": "yellow"},
          {"name": "High", "color": "red"}
        ]
      }
    }
  }
}
```


### Customer Relationship Management

Create a CRM database:


```json
{
  "parent": {
    "type": "page_id",
    "page_id": "crm-page-id"
  },
  "title": [
    {
      "type": "text",
      "text": {
        "content": "Customer Management"
      }
    }
  ],
  "properties": {
    "company": {
      "id": "company",
      "name": "Company Name",
      "type": "title"
    },
    "contact_person": {
      "id": "contact_person",
      "name": "Contact Person",
      "type": "rich_text"
    },
    "email": {
      "id": "email",
      "name": "Email",
      "type": "email"
    },
    "phone": {
      "id": "phone",
      "name": "Phone",
      "type": "phone_number"
    },
    "website": {
      "id": "website",
      "name": "Website",
      "type": "url"
    },
    "industry": {
      "id": "industry",
      "name": "Industry",
      "type": "select",
      "select": {
        "options": [
          {"name": "Technology", "color": "blue"},
          {"name": "Finance", "color": "green"},
          {"name": "Education", "color": "yellow"},
          {"name": "Healthcare", "color": "red"}
        ]
      }
    },
    "deal_stage": {
      "id": "deal_stage",
      "name": "Deal Stage",
      "type": "select",
      "select": {
        "options": [
          {"name": "Prospect", "color": "gray"},
          {"name": "Initial Contact", "color": "yellow"},
          {"name": "Needs Confirmation", "color": "orange"},
          {"name": "Proposal", "color": "blue"},
          {"name": "Negotiation", "color": "purple"},
          {"name": "Closed Won", "color": "green"}
        ]
      }
    }
  }
}
```

