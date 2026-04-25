# Page Properties API Documentation


## Overview

Page Properties define the property formats for pages and database records. This document details the data structures, usage methods, and format requirements for different property types.

Page properties are widely used in:

- **Page titles**: Title properties for regular pages
- **Database records**: Various properties for records in multi-dimensional tables
- **Page metadata**: Icons, covers, creation time, etc.

## Basic Concepts


### Property Object Structure

Each property object contains the following basic fields:


```json
{
  "Property Name": {
    "id": "Property UUID",
    "type": "Property Type",
    "Property Type": "Property Value"
  }
}
```

**Field Descriptions:**

- `Property Name`: User-readable property name, used as object key
- `id`: Unique identifier of the property (UUID)
- `type`: Property type, defines data format and behavior
- `Property Type`: Same key as type field, contains actual property value

## Supported Property Types

Buildin supports 15 different property types, covering all needs from basic data to complex relationships:


### Basic Property Types

- `title` - Title property
- `rich_text` - Rich text property
- `number` - Number property
- `checkbox` - Checkbox property
- `url` - URL property
- `email` - Email property
- `phone_number` - Phone number property

### Selection Property Types

- `select` - Single select dropdown
- `multi_select` - Multi-select dropdown

### Time and People Properties

- `date` - Date/time property
- `people` - People property

### File and Relation Properties

- `files` - File attachment property
- `relation` - Database relation property

### Computed Property Types (Read-only)

- `formula` - Formula calculation property

### 1. Title Property (title)

Main title for pages and database records.

**API Format:**


```json
{
  "Title": {
    "id": "title",
    "type": "title",
    "title": [
      {
        "type": "text",
        "text": {
          "content": "Page Title Content",
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
        "plain_text": "Page Title Content",
        "href": null
      }
    ]
  }
}
```

**Simplified Format for Create/Update:**


```json
{
  "Title": {
    "type": "title",
    "title": [
      {
        "text": {
          "content": "Page Title Content"
        }
      }
    ]
  }
}
```


### 2. Rich Text Property (rich_text)

Supports formatted text content.

**API Format:**


```json
{
  "Description": {
    "id": "property-uuid",
    "type": "rich_text",
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is rich text",
          "link": null
        },
        "annotations": {
          "bold": true,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "blue"
        },
        "plain_text": "This is rich text",
        "href": null
      }
    ]
  }
}
```

**Format for Create/Update:**


```json
{
  "Description": {
    "type": "rich_text",
    "rich_text": [
      {
        "text": {
          "content": "This is rich text"
        }
      }
    ]
  }
}
```


### 3. Number Property (number)

Numeric type property.

**API Format:**


```json
{
  "Price": {
    "id": "price-uuid",
    "type": "number",
    "number": 99.99
  }
}
```

**Format for Create/Update:**


```json
{
  "Price": {
    "type": "number",
    "number": 99.99
  }
}
```


### 4. Select Property (select)

Single select dropdown property.

**API Format:**


```json
{
  "Status": {
    "id": "status-uuid",
    "type": "select",
    "select": {
      "id": "option-uuid",
      "name": "In Progress",
      "color": "yellow"
    }
  }
}
```

**Format for Create/Update:**


```json
{
  "Status": {
    "type": "select",
    "select": {
      "name": "In Progress"
    }
  }
}
```


### 5. Multi-Select Property (multi_select)

Multi-select dropdown property.

**API Format:**


```json
{
  "Tags": {
    "id": "tags-uuid",
    "type": "multi_select",
    "multi_select": [
      {
        "id": "tag1-uuid",
        "name": "Important",
        "color": "red"
      },
      {
        "id": "tag2-uuid",
        "name": "Urgent",
        "color": "orange"
      }
    ]
  }
}
```

**Format for Create/Update:**


```json
{
  "Tags": {
    "type": "multi_select",
    "multi_select": [
      {
        "name": "Important"
      },
      {
        "name": "Urgent"
      }
    ]
  }
}
```


### 6. Checkbox Property (checkbox)

Boolean value property.

**API Format:**


```json
{
  "Completed": {
    "id": "completed-uuid",
    "type": "checkbox",
    "checkbox": true
  }
}
```

**Format for Create/Update:**


```json
{
  "Completed": {
    "type": "checkbox",
    "checkbox": true
  }
}
```


### 7. Date Property (date)

Date and time property.

**API Format:**


```json
{
  "Due Date": {
    "id": "due-date-uuid",
    "type": "date",
    "date": {
      "start": "2024-01-15T10:30:00",
      "end": "2024-01-16T18:00:00",
      "time_zone": null
    }
  }
}
```

**Format for Create/Update:**


```json
{
  "Due Date": {
    "type": "date",
    "date": {
      "start": "2024-01-15T10:30:00",
      "end": "2024-01-16T18:00:00"
    }
  }
}
```

**Date Format Description:**

- `start`: Start date/time (required)
- `end`: End date/time (optional)
- Supported formats:
  - Date: `YYYY-MM-DD`
  - Date/time: `YYYY-MM-DDTHH:MM:SS`
  - With timezone: `YYYY-MM-DDTHH:MM:SS+08:00`

### 8. People Property (people)

User reference property.

**API Format:**


```json
{
  "Assignee": {
    "id": "assignee-uuid",
    "type": "people",
    "people": [
      {
        "object": "user",
        "id": "user-uuid"
      }
    ]
  }
}
```

**Format for Create/Update:**


```json
{
  "Assignee": {
    "type": "people",
    "people": [
      {
        "id": "user-uuid"
      }
    ]
  }
}
```


### 9. Files Property (files)

File attachment property.

**API Format:**


```json
{
  "Attachments": {
    "id": "files-uuid",
    "type": "files",
    "files": [
      {
        "name": "Document.pdf",
        "type": "external",
        "external": {
          "url": "https://example.com/document.pdf"
        }
      },
      {
        "name": "Image.jpg",
        "type": "file",
        "file": {
          "url": "https://api.buildin.ai/oss/image.jpg",
          "expiry_time": "2024-01-15T10:30:00.000Z"
        }
      }
    ]
  }
}
```

**Format for Create/Update:**


```json
{
  "Attachments": {
    "type": "files",
    "files": [
      {
        "name": "Document.pdf",
        "external": {
          "url": "https://example.com/document.pdf"
        }
      }
    ]
  }
}
```


### 10. URL Property (url)

URL link property.

**API Format:**


```json
{
  "Website": {
    "id": "url-uuid",
    "type": "url",
    "url": "https://example.com"
  }
}
```

**Format for Create/Update:**


```json
{
  "Website": {
    "type": "url",
    "url": "https://example.com"
  }
}
```


### 11. Email Property (email)

Email address property.

**API Format:**


```json
{
  "Contact Email": {
    "id": "email-uuid",
    "type": "email",
    "email": "contact@example.com"
  }
}
```

**Format for Create/Update:**


```json
{
  "Contact Email": {
    "type": "email",
    "email": "contact@example.com"
  }
}
```


### 12. Phone Number Property (phone_number)

Phone number property.

**API Format:**


```json
{
  "Contact Phone": {
    "id": "phone-uuid",
    "type": "phone_number",
    "phone_number": "+86 138-0013-8000"
  }
}
```

**Format for Create/Update:**


```json
{
  "Contact Phone": {
    "type": "phone_number",
    "phone_number": "+86 138-0013-8000"
  }
}
```


### 13. Relation Property (relation)

Property that relates to other database records.

**API Format:**


```json
{
  "Related Projects": {
    "id": "relation-uuid",
    "type": "relation",
    "relation": [
      {
        "id": "related-page-uuid-1"
      },
      {
        "id": "related-page-uuid-2"
      }
    ],
    "has_more": false
  }
}
```

**Format for Create/Update:**


```json
{
  "Related Projects": {
    "type": "relation",
    "relation": [
      {
        "id": "related-page-uuid-1"
      },
      {
        "id": "related-page-uuid-2"
      }
    ]
  }
}
```

**Special Notes:**

- `relation` array contains related page IDs
- `has_more` indicates whether there are more related items (pagination)
- Related pages must be in the specified target database
- Bidirectional relations automatically create reverse relations in target records

### 14. Formula Property (formula)

Read-only property calculated based on other properties.

**API Format:**


```json
{
  "Total Price": {
    "id": "formula-uuid",
    "type": "formula",
    "formula": {
      "type": "number",
      "number": 15000,
      "string": null
    }
  }
}
```

**Format for Database Configuration:**


```json
{
  "Total Price": {
    "type": "formula",
    "formula": {
      "expression": "prop(\"Unit Price\") * prop(\"Quantity\")",
      "version": 2,
      "refProps": {
        "Unit Price": "price-property-uuid",
        "Quantity": "quantity-property-uuid"
      }
    }
  }
}
```

**Special Notes:**

- Formula properties are read-only and cannot be modified directly
- `formula.type` can be `number`, `string`, `boolean`, or `date`
- `formula.expression` defines the calculation expression
- `refProps` contains mappings of other properties referenced in the formula
- Calculation results automatically update when referenced properties change
**Common Formula Expressions:**

- Mathematical operations: `prop("Price") * prop("Quantity")`
- String concatenation: `prop("First Name") + " " + prop("Last Name")`
- Conditional logic: `if(prop("Completed"), "Done", "Pending")`
- Date calculations: `dateBetween(prop("End Date"), prop("Start Date"), "days")`
**Rollup Function Types:**

- `count` - Count
- `count_values` - Count non-empty values
- `empty` - Count empty values
- `not_empty` - Count non-empty values
- `sum` - Sum
- `average` - Average
- `min` - Minimum
- `max` - Maximum
- `range` - Range (max - min)
**Special Notes:**

- Rollup properties are read-only, automatically calculated based on related records
- `relation_property_id` specifies the relation property to roll up
- `rollup_property_id` specifies the target property in related records to roll up
- `array` contains all original values participating in the rollup

## System Properties

The following properties are automatically managed by the system and are read-only:


### Created Time (created_time)


```json
{
  "Created Time": {
    "id": "created_time",
    "type": "created_time",
    "created_time": "2024-01-15T10:30:00.000Z"
  }
}
```


### Created By (created_by)


```json
{
  "Created By": {
    "id": "created_by",
    "type": "created_by",
    "created_by": {
      "object": "user",
      "id": "user-uuid"
    }
  }
}
```


### Last Edited Time (last_edited_time)


```json
{
  "Last Edited Time": {
    "id": "last_edited_time",
    "type": "last_edited_time",
    "last_edited_time": "2024-01-15T10:35:00.000Z"
  }
}
```


### Last Edited By (last_edited_by)


```json
{
  "Last Edited By": {
    "id": "last_edited_by",
    "type": "last_edited_by",
    "last_edited_by": {
      "object": "user",
      "id": "user-uuid"
    }
  }
}
```


## Usage Examples


### Setting Properties When Creating Page


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
            "content": "New Project Plan"
          }
        }
      ]
    },
    "Status": {
      "type": "select",
      "select": {
        "name": "Planning"
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
    "Start Date": {
      "type": "date",
      "date": {
        "start": "2024-01-15"
      }
    },
    "Assignee": {
      "type": "people",
      "people": [
        {
          "id": "user-uuid"
        }
      ]
    },
    "Budget": {
      "type": "number",
      "number": 50000
    },
    "Description": {
      "type": "rich_text",
      "rich_text": [
        {
          "text": {
            "content": "This is an important project plan"
          }
        }
      ]
    }
  }
}
```


### Updating Page Properties


```http
PATCH /v1/pages/page-uuid
Authorization: Bearer your_bot_token
Content-Type: application/json

{
  "properties": {
    "Status": {
      "type": "select",
      "select": {
        "name": "In Progress"
      }
    },
    "Completed": {
      "type": "checkbox",
      "checkbox": true
    },
    "Actual Budget": {
      "type": "number",
      "number": 45000
    }
  }
}
```


### Complex Property Example


```json
{
  "properties": {
    "Project Title": {
      "type": "title",
      "title": [
        {
          "text": {
            "content": "Buildin API Integration Project"
          }
        }
      ]
    },
    "Project Description": {
      "type": "rich_text",
      "rich_text": [
        {
          "text": {
            "content": "Develop Buildin API integration features, including:"
          }
        },
        {
          "text": {
            "content": "\n1. Page Management API"
          }
        },
        {
          "text": {
            "content": "\n2. Database Operations API"
          }
        },
        {
          "text": {
            "content": "\n3. Permission Management System"
          }
        }
      ]
    },
    "Project Tags": {
      "type": "multi_select",
      "multi_select": [
        {
          "name": "API Development"
        },
        {
          "name": "Backend"
        },
        {
          "name": "Integration"
        }
      ]
    },
    "Project Timeline": {
      "type": "date",
      "date": {
        "start": "2024-01-01T09:00:00",
        "end": "2024-03-31T18:00:00"
      }
    },
    "Team Members": {
      "type": "people",
      "people": [
        {
          "id": "user1-uuid"
        },
        {
          "id": "user2-uuid"
        }
      ]
    },
    "Project Documents": {
      "type": "files",
      "files": [
        {
          "name": "API Design Document.pdf",
          "external": {
            "url": "https://example.com/api-design.pdf"
          }
        },
        {
          "name": "Technical Specification.docx",
          "external": {
            "url": "https://example.com/tech-spec.docx"
          }
        }
      ]
    },
    "Related Customers": {
      "type": "relation",
      "relation": [
        {
          "id": "customer-uuid-1"
        },
        {
          "id": "customer-uuid-2"
        }
      ]
    },
    "Project Progress": {
      "type": "formula",
      "formula": {
        "expression": "if(prop(\"Completed Tasks\") > 0, prop(\"Completed Tasks\") / prop(\"Total Tasks\") * 100, 0)"
      }
    }
  }
}
```


## Property Validation Rules


### Required Properties

- **title**: When creating a page, at least one title type property is required
- **Database records**: Must conform to the property structure defined in the database schema

### Format Validation

- **Date format**: Must conform to ISO 8601 standard
- **Email format**: Must be a valid email address format
- **URL format**: Must be a valid HTTP/HTTPS URL
- **Number range**: Supports integers and floating point numbers, maximum 15 digits precision

### Length Limitations

- **Text content**: Maximum 2000 characters per rich text block
- **Option names**: Maximum 100 characters
- **URL length**: Maximum 2000 characters
- **File names**: Maximum 255 characters

## Important Notes


### Property Name Mapping

- API uses user-readable property names as keys
- Internal storage uses UUIDs as property identifiers
- Only property names need to be provided when creating, system automatically generates UUIDs

### Database Property Constraints

- Page properties must conform to the schema definition of the parent database
- Selection type values must be predefined options in the database
- Relation properties need to reference valid record IDs, and target records must be in the specified database
- Formula properties are read-only and cannot be modified directly through API, only configured in database schema
- Rollup properties depend on relation properties, requiring correct relation relationships first
- Formula and rollup property calculation results automatically update when referenced data changes

### Performance Recommendations

- For batch operations, recommend updating maximum 50 properties at once
- Large rich text content should be processed in segments
- File properties recommend using external links rather than uploads

## Error Handling


### Common Errors

- `400 Bad Request`: Incorrect property format
- `403 Forbidden`: No permission to modify properties
- `404 Not Found`: Referenced property or related object does not exist
- `422 Unprocessable Entity`: Property value does not conform to database schema

### Error Examples

**Selection Property Value Error:**


```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Property 'Status' value 'Invalid Status' is not in the allowed options list"
}
```

**Relation Property Error:**


```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Relation property 'Related Projects' references record 'invalid-uuid' that does not exist in target database"
}
```

**Attempting to Modify Read-only Property:**


```json
{
  "object": "error",
  "status": 400,
  "code": "read_only_property",
  "message": "Formula property 'Total Price' is read-only and cannot be modified directly"
}
```

**Formula Expression Error:**


```json
{
  "object": "error",
  "status": 400,
  "code": "formula_error",
  "message": "Formula expression syntax error: Cannot parse 'prop(\"Non-existent Property\")'"
}
```

