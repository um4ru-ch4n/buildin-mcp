# Block Objects Documentation


## Overview

This document describes in detail the object structures, property definitions, and data formats for all block types in the Buildin Blocks API. Each block object contains common properties and type-specific properties.


## Common Block Object Structure

All block objects contain the following common properties:


```json
{
  "object": "block",
  "id": "string",
  "parent": {
    "type": "block_id" | "page_id" | "workspace",
    "block_id"?: "string",
    "page_id"?: "string"
  },
  "created_time": "string (ISO 8601)",
  "created_by": {
    "object": "user",
    "id": "string"
  },
  "last_edited_time": "string (ISO 8601)",
  "last_edited_by": {
    "object": "user",
    "id": "string"
  },
  "archived": "boolean",
  "has_children": "boolean",
  "type": "string",
  "data": {
    // Block type-specific properties
  }
}
```


### Common Property Descriptions


| Property | Type | Description |
| --- | --- | --- |
| object | string | Fixed value "block" |
| id | string | Unique identifier of the block (UUID) |
| parent | object | Parent object information |
| created_time | string | Creation time (ISO 8601 format) |
| created_by | object | Creator information |
| last_edited_time | string | Last edit time (ISO 8601 format) |
| last_edited_by | object | Last editor information |
| archived | boolean | Whether archived |
| has_children | boolean | Whether contains child blocks |
| type | string | Block type |
| data | object | Block type-specific data content |


### Parent Object


```
type Parent = {
  type: "block_id";
  block_id: string;
} | {
  type: "page_id";
  page_id: string;
} | {
  type: "workspace";
}
```


### User Object


```json
{
  "object": "user",
  "id": "string"
}
```


## Text Block Types


### Paragraph

**Type Identifier:** `paragraph`


```json
{
  "type": "paragraph",
  "data": {
    "rich_text": "RichText[]",
    "text_color": "Color",
    "background_color": "Color"
  }
}
```

**Property Descriptions:**

- `rich_text`: Rich text content array
- `text_color`: Text color
- `background_color`: Background color

### Heading

**Type Identifiers:** `heading_1`, `heading_2`, `heading_3`


```json
{
  "type": "heading_1",
  "data": {
    "rich_text": "RichText[]",
    "text_color": "Color",
    "background_color": "Color"
  }
}
```

**Property Descriptions:**

- `rich_text`: Heading text content
- `text_color`: Text color
- `background_color`: Background color
**Type Differences:**

- `heading_1`: Level 1 heading
- `heading_2`: Level 2 heading
- `heading_3`: Level 3 heading

### List Item

**Type Identifiers:** `bulleted_list_item`, `numbered_list_item`


```json
{
  "type": "bulleted_list_item",
  "data": {
    "rich_text": "RichText[]",
    "text_color": "Color",
    "background_color": "Color"
  }
}
```

**Property Descriptions:**

- `rich_text`: List item text content
- `text_color`: Text color
- `background_color`: Background color
**Type Differences:**

- `bulleted_list_item`: Unordered list item (bullet points)
- `numbered_list_item`: Ordered list item (numbers)

### To Do

**Type Identifier:** `to_do`


```json
{
  "type": "to_do",
  "data": {
    "rich_text": "RichText[]",
    "checked": "boolean",
    "text_color": "Color",
    "background_color": "Color"
  }
}
```

**Property Descriptions:**

- `rich_text`: To-do item text content
- `checked`: Whether completed
- `text_color`: Text color
- `background_color`: Background color

### Quote

**Type Identifier:** `quote`


```json
{
  "type": "quote",
  "data": {
    "rich_text": "RichText[]",
    "text_color": "Color",
    "background_color": "Color"
  }
}
```

**Property Descriptions:**

- `rich_text`: Quote text content
- `text_color`: Text color
- `background_color`: Background color

### Toggle Block

**Type Identifier:** `toggle`


```json
{
  "type": "toggle",
  "data": {
    "rich_text": "RichText[]",
    "text_color": "Color",
    "background_color": "Color"
  }
}
```

**Property Descriptions:**

- `rich_text`: Toggle block title text
- `text_color`: Text color
- `background_color`: Background color

## Media Block Types


### Code Block

**Type Identifier:** `code`


```json
{
  "type": "code",
  "data": {
    "rich_text": "RichText[]",
    "language": "string"
  }
}
```

**Property Descriptions:**

- `rich_text`: Code content
- `language`: Programming language identifier
**Supported Languages:**

- `C`, `C#`, `C++`, `Clojure`, `CMake`, `Closure Stylesheets (GSS)`, `CoffeeScript`
- `Common Lisp`, `Crystal`, `CSS`, `D`, `Dart`, `Django`, `Dockerfile`, `diff`
- `EBNF`, `Elm`, `Erlang`, `elixir`, `Fortran`, `F#`, `Gherkin`, `Go`
- `Ini`, `Shell`, `Groovy`, `HAML`, `Haskell`, `Haxe`, `HTML`, `HTTP`
- `Java`, `JavaScript`, `JSON`, `Julia`, `Kotlin`, `LESS`, `LiveScript`, `Lua`
- `Markdown`, `Mathematica`, `Matlab`, `MakeFile`, `Mermaid`, `Nginx`, `NSIS`
- `Objective-C`, `Objective-C++`, `OCaml`, `Pascal`, `Perl`, `PHP`, `Plain Text`
- `PowerShell`, `Properties files`, `ProtoBuf`, `Puppet`, `Python`, `Q`, `R`
- `RPM Spec`, `Ruby`, `Rust`, `React`, `SAS`, `Scala`, `Scheme`, `SCSS`
- `Smalltalk`, `Stylus`, `SQL`, `Solidity`, `Swift`, `LaTeX`, `sTeX`, `Tcl`
- `Toml`, `Twig`, `TypeScript`, `VB.NET`, `VBScript`, `Verilog`, `VHDL`
- `Vue`, `XML`, `XQuery`, `YAML`

### Image

**Type Identifier:** `image`


```json
{
  "type": "image",
  "data": {
    "type": "file" | "external",
    "file"?: {
      "url": "string",
      "expiry_time": "string"
    },
    "external"?: {
      "url": "string"
    },
    "caption": "RichText[]"
  }
}
```

**Property Descriptions:**

- `type`: Image type (`file` for internal file, `external` for external link)
- `file`: Internal file information (includes expiry time)
- `external`: External link information
- `caption`: Image caption text

### File

**Type Identifier:** `file`


```json
{
  "type": "file",
  "data": {
    "type": "file" | "external",
    "file"?: {
      "url": "string",
      "expiry_time": "string"
    },
    "external"?: {
      "url": "string"
    },
    "caption": "RichText[]"
  }
}
```

**Property Descriptions:**

- `type`: File type (`file` for internal file, `external` for external link)
- `file`: Internal file information (includes expiry time)
- `external`: External link information
- `caption`: File caption text

### Bookmark

**Type Identifier:** `bookmark`


```json
{
  "type": "bookmark",
  "data": {
    "url": "string",
    "caption": "RichText[]"
  }
}
```

**Property Descriptions:**

- `url`: Bookmark URL address
- `caption`: Bookmark caption text

### Embed

**Type Identifier:** `embed`


```json
{
  "type": "embed",
  "data": {
    "url": "string",
    "caption": "RichText[]"
  }
}
```

**Property Descriptions:**

- `url`: Embedded content URL address
- `caption`: Embedded content caption text

## Special Block Types


### Callout Block

**Type Identifier:** `callout`


```json
{
  "type": "callout",
  "data": {
    "rich_text": "RichText[]",
    "icon": "Icon",
    "text_color": "Color",
    "background_color": "Color"
  }
}
```

**Property Descriptions:**

- `rich_text`: Callout text content
- `icon`: Icon object
- `text_color`: Text color
- `background_color`: Background color

### Equation

**Type Identifier:** `equation`


```json
{
  "type": "equation",
  "data": {
    "expression": "string"
  }
}
```

**Property Descriptions:**

- `expression`: LaTeX mathematical expression

### Link to Page

**Type Identifier:** `link_to_page`


```json
{
  "type": "link_to_page",
  "data": {
    "page_id": "string"
  }
}
```

**Property Descriptions:**

- `page_id`: ID of the referenced page

### Template Button

**Type Identifier:** `template`


```json
{
  "type": "template",
  "data": {
    "rich_text": "RichText[]"
  }
}
```

**Property Descriptions:**

- `rich_text`: Template button display text

### Synced Block

**Type Identifier:** `synced_block`


```json
{
  "type": "synced_block",
  "data": {
    "synced_from": {
      "block_id": "string"
    } | null,
    "children": "Block[]"
  }
}
```

**Property Descriptions:**

- `synced_from`: Sync source block information (`null` indicates original block)
- `children`: Child block list

## Layout Block Types


### Divider

**Type Identifier:** `divider`


```json
{
  "type": "divider",
  "data": {}
}
```

**Property Descriptions:**

- Divider has no special properties

### Column Layout

**Type Identifiers:** `column_list`, `column`


#### Column List


```json
{
  "type": "column_list",
  "data": {}
}
```


#### Column


```json
{
  "type": "column",
  "data": {}
}
```

**Property Descriptions:**

- Column layout components have no special properties, layout is formed through child block relationships

### Table

**Type Identifier:** `table`


```json
{
  "type": "table",
  "data": {
    "table_width": "number",
    "has_column_header": "boolean",
    "has_row_header": "boolean"
  }
}
```

**Property Descriptions:**

- `table_width`: Number of table columns
- `has_column_header`: Whether has column headers
- `has_row_header`: Whether has row headers

### Table Row

**Type Identifier:** `table_row`


```json
{
  "type": "table_row",
  "data": {
    "cells": "RichText[][]"
  }
}
```

**Property Descriptions:**

- `cells`: Cell content, two-dimensional array, each cell contains rich text array

## Child Object Block Types


### Child Page

**Type Identifier:** `child_page`


```json
{
  "type": "child_page",
  "data": {
    "title": "string"
  }
}
```

**Property Descriptions:**

- `title`: Child page title

### Child Database

**Type Identifier:** `child_database`


```json
{
  "type": "child_database",
  "data": {
    "title": "string"
  }
}
```

**Property Descriptions:**

- `title`: Child database title

## Data Type Definitions


### Rich Text

Rich text is an object array that supports multiple types of content segments:


```
type RichText = TextRichText | MentionRichText | EquationRichText;
```


#### Text Type


```json
{
  "type": "text",
  "text": {
    "content": "string",
    "link": {
      "url": "string"
    } | null
  },
  "annotations": "Annotations",
  "plain_text": "string",
  "href": "string | null"
}
```


#### Mention Type


```json
{
  "type": "mention",
  "mention": {
    "type": "user" | "page" | "date",
    "user"?: {
      "id": "string"
    },
    "page"?: {
      "id": "string"
    },
    "date"?: {
      "start": "string",
      "end": "string | null",
      "time_zone": "string | null"
    }
  },
  "annotations": "Annotations",
  "plain_text": "string",
  "href": "string | null"
}
```


#### Equation Type


```json
{
  "type": "equation",
  "data": {
    "expression": "string"
  },
  "annotations": "Annotations",
  "plain_text": "string",
  "href": "string | null"
}
```


### Annotations


```json
{
  "bold": "boolean",
  "italic": "boolean",
  "strikethrough": "boolean",
  "underline": "boolean",
  "code": "boolean",
  "color": "Color"
}
```

**Property Descriptions:**

- `bold`: Bold
- `italic`: Italic
- `strikethrough`: Strikethrough
- `underline`: Underline
- `code`: Code format
- `color`: Text color

### Color


```
type Color =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";
```

**Supported Color Values:**

- `default`: Default color
- `gray`: Gray
- `brown`: Brown
- `orange`: Orange
- `yellow`: Yellow
- `green`: Green
- `blue`: Blue
- `purple`: Purple
- `pink`: Pink
- `red`: Red

### Icon

Icons support multiple types:


#### Emoji Icon


```json
{
  "type": "emoji",
  "emoji": "string"
}
```


#### File Icon


```json
{
  "type": "file",
  "data": {
    "url": "string",
    "expiry_time": "string"
  }
}
```


#### External Link Icon


```json
{
  "type": "external",
  "external": {
    "url": "string"
  }
}
```

**Property Descriptions:**

- `emoji`: Unicode emoji character
- `type`: Icon type (`file` or `external`)
- `file.url`: Internal file URL
- `file.expiry_time`: File expiry time (ISO 8601 format)
- `external.url`: External image URL
**Examples:**


```json
// Emoji icon
{
  "emoji": "💡"
}

// File icon
{
  "type": "file",
  "data": {
    "url": "https://cdn2.buildin.ai/files/abc123",
    "expiry_time": "2023-12-01T15:00:00.000Z"
  }
}

// External icon
{
  "type": "external",
  "external": {
    "url": "https://example.com/icon.png"
  }
}
```


## Date Format Description

Date fields support multiple formats:


### Date Only


```json
{
  "start": "2023-12-01",
  "end": null,
  "time_zone": null
}
```


### Date Time


```json
{
  "start": "2023-12-01T14:30:00",
  "end": null,
  "time_zone": null
}
```


### Date Range


```json
{
  "start": "2023-12-01",
  "end": "2023-12-03",
  "time_zone": null
}
```


### Date Time Range


```json
{
  "start": "2023-12-01T09:00:00",
  "end": "2023-12-01T17:00:00",
  "time_zone": "Asia/Shanghai"
}
```


## Complete Examples


### Complex Paragraph Block Example


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
  "has_children": false,
  "type": "paragraph",
  "data": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is a paragraph containing",
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
        "plain_text": "This is a paragraph containing",
        "href": null
      },
      {
        "type": "text",
        "text": {
          "content": "bold text",
          "link": null
        },
        "annotations": {
          "bold": true,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "red"
        },
        "plain_text": "bold text",
        "href": null
      },
      {
        "type": "text",
        "text": {
          "content": " and ",
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
        "plain_text": " and ",
        "href": null
      },
      {
        "type": "mention",
        "mention": {
          "type": "user",
          "user": {
            "id": "user-550e8400-e29b-41d4-a716-446655440002"
          }
        },
        "annotations": {
          "bold": false,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "default"
        },
        "plain_text": "@John Doe",
        "href": null
      },
      {
        "type": "text",
        "text": {
          "content": " complex paragraph.",
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
        "plain_text": " complex paragraph.",
        "href": null
      }
    ],
    "text_color": "default",
    "background_color": "yellow"
  }
}
```


### Callout Block Example


```json
{
  "object": "block",
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "parent": {
    "type": "page_id",
    "page_id": "550e8400-e29b-41d4-a716-446655440004"
  },
  "created_time": "2023-12-01T11:00:00.000Z",
  "created_by": {
    "object": "user",
    "id": "user-550e8400-e29b-41d4-a716-446655440000"
  },
  "last_edited_time": "2023-12-01T11:00:00.000Z",
  "last_edited_by": {
    "object": "user",
    "id": "user-550e8400-e29b-41d4-a716-446655440000"
  },
  "archived": false,
  "has_children": false,
  "type": "callout",
  "data": {
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "This is an important notice!",
          "link": null
        },
        "annotations": {
          "bold": true,
          "italic": false,
          "strikethrough": false,
          "underline": false,
          "code": false,
          "color": "default"
        },
        "plain_text": "This is an important notice!",
        "href": null
      }
    ],
    "icon": {
      "emoji": "⚠️"
    },
    "text_color": "default",
    "background_color": "yellow"
  }
}
```


### Table Row Example


```json
{
  "object": "block",
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "parent": {
    "type": "block_id",
    "block_id": "550e8400-e29b-41d4-a716-446655440006"
  },
  "created_time": "2023-12-01T12:00:00.000Z",
  "created_by": {
    "object": "user",
    "id": "user-550e8400-e29b-41d4-a716-446655440000"
  },
  "last_edited_time": "2023-12-01T12:00:00.000Z",
  "last_edited_by": {
    "object": "user",
    "id": "user-550e8400-e29b-41d4-a716-446655440000"
  },
  "archived": false,
  "has_children": false,
  "type": "table_row",
  "data": {
    "cells": [
      [
        {
          "type": "text",
          "text": {
            "content": "Product Name",
            "link": null
          },
          "annotations": {
            "bold": true,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Product Name",
          "href": null
        }
      ],
      [
        {
          "type": "text",
          "text": {
            "content": "Price",
            "link": null
          },
          "annotations": {
            "bold": true,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Price",
          "href": null
        }
      ],
      [
        {
          "type": "text",
          "text": {
            "content": "Status",
            "link": null
          },
          "annotations": {
            "bold": true,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Status",
          "href": null
        }
      ]
    ]
  }
}
```


## Block Type Compatibility


### Types Supporting Child Blocks

The following block types can contain child blocks (`has_children: true`):

- `paragraph` (Paragraph)
- `heading_1`, `heading_2`, `heading_3` (Headings)
- `bulleted_list_item`, `numbered_list_item` (List items)
- `to_do` (To-do items)
- `quote` (Quote)
- `toggle` (Toggle block)
- `callout` (Callout block)
- `column_list` (Column list)
- `column` (Column)
- `synced_block` (Synced block)
- `child_page` (Child page)
- `child_database` (Child database)
- `table` (Table, contains only `table_row` child blocks)

### Types Not Supporting Child Blocks

The following block types cannot contain child blocks (`has_children: false`):

- `code` (Code block)
- `image` (Image)
- `file` (File)
- `bookmark` (Bookmark)
- `embed` (Embed)
- `equation` (Equation)
- `link_to_page` (Link to page)
- `template` (Template button)
- `divider` (Divider)
- `table_row` (Table row)

### Special Constraints

- `table` blocks can only contain `table_row` type child blocks
- `column_list` blocks can only contain `column` type child blocks
- `synced_block` content is determined by sync source, cannot directly edit child blocks

## Version Compatibility


### API Version: v1

**Supported Block Types:**

- ✅ All basic text blocks (paragraph, heading, list, to_do, quote, toggle)
- ✅ All media blocks (code, image, file, bookmark, embed)
- ✅ All special blocks (callout, equation, link_to_page, template, synced_block)
- ✅ All layout blocks (divider, column_list, column, table, table_row)
- ✅ All child object blocks (child_page, child_database)
**Color Support:**

- ✅ Block-level colors (`text_color`, `background_color`)
- ✅ Rich text-level colors (`annotations.color`)
- ✅ Complete color value support
**Rich Text Support:**

- ✅ Text formatting (bold, italic, strikethrough, underline, code)
- ✅ Link support
- ✅ User mentions (@user)
- ✅ Page mentions (page references)
- ✅ Date mentions (dates and times)
- ✅ Mathematical formulas
