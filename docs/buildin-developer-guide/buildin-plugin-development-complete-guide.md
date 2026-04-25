# Buildin Plugin Development Complete Guide


## Overview

The Buildin plugin development system provides complete API interfaces, allowing developers to create feature-rich plugins to extend Buildin's functionality. This guide will walk you through the complete process of developing plugins from scratch.


## Plugin Types

Buildin supports two different types of integration applications, suitable for different development scenarios and user experience requirements:


### 1. Internal Plugin

- **Embedded UI**: Plugin interface is directly embedded within the Buildin application
- **Seamless Integration**: Users complete all operations within Buildin without needing to redirect
- **Simplified Authorization**: Users directly select pages to authorize within the application
- **Use Cases**: Buildin official plugins, enterprise internal tools
- **Technical Features**:
  - No need to configure `redirectUris`
  - Direct API calls to operate content
  - Simplified authorization process, one-step bot creation and authorization

### 2. External Application

- **Independent Application**: Third-party developed standalone applications
- **Standard OAuth2**: Follows OAuth2.0 authorization code flow
- **Cross-platform Integration**: Can be developed and deployed on any platform
- **Use Cases**: Third-party developer tools, SaaS service integrations
- **Technical Features**:
  - Must configure `redirectUris`
  - Standard REST API operations on Buildin content
  - Complete OAuth2 flow, including authorization code generation, token exchange, etc.

## Type Comparison Table


| Feature | Internal Plugin (internal) | External Application (external) |
| --- | --- | --- |
| spaceId | Required | Not needed |
| redirectUris | Optional (usually empty) | Required |
| Bot Creation | Automatically created when creating integration | Requires OAuth2 authorization flow |
| Page Permissions | Dynamically managed through PATCH interface | Specified during OAuth2 authorization |
| UI Integration | Embedded in Buildin | Independent application |
| Token Acquisition | Returned directly when created | OAuth2 exchange |
| Development Complexity | Simple | Medium |
| Security Verification | Internal verification | client_secret verification |


### How to Choose Type?


#### Choose Internal Plugin when:

- Developing Buildin official feature extensions
- Enterprise internal tools that don't need public release
- Want to provide seamless user experience
- Don't need complex OAuth flow

#### Choose External Application when:

- Third-party developer tools
- SaaS services that need integration across multiple platforms
- Independent applications
- Scenarios requiring standard OAuth2 flow compliance

## Core Concepts


### Integration

- Basic configuration and identity of the plugin
- Defines plugin's basic information (name, description, icon, etc.)
- Configures OAuth callback addresses (required for public plugins)
- Sets bot capability permissions

## Internal Plugin Development Flow

Internal plugin UI is embedded within the Buildin application, bots are created directly when created, without additional authorization steps. Page permissions can be managed through dedicated interfaces after creation:


![image.png]()


## External Application Development Flow

External applications are independent third-party applications where users operate within the external application, obtaining permissions through the standard OAuth2.0 authorization code flow:


![image.png]()


### OAuth2.0 Standard Authorization Flow


#### User Authorization Redirect

Access the authorization page through the authorization URL, and after selecting the authorization page, it will automatically redirect to call the redirect URI configured in the external plugin.


#### Exchange the access token in the redirect URI interface.


```javascript
// Handle authorization code in callback page
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

// Third-party application exchanges access token
const tokenResponse = await fetch('https://api.buildin.ai/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    client_id: integration.id,
    client_secret: integration.secret,
    redirect_uri: 'https://my-plugin.com/callback'
  })
});

const { access_token } = await tokenResponse.json();
```


### api demo


```javascript
// Use access token to call API
const page = await fetch('https://api.buildin.ai/v1/pages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    parent: { database_id: 'database-uuid' },
    properties: {
      'Title': {
        type: 'title',
        title: [{ text: { content: 'Task created by external app' } }]
      }
    }
  })
});
```


## API Interface Overview


### OAuth2 Authorization API (External Applications)

- `POST /oauth/token` - Exchange access token

### Bot Content API (v1)

- `POST /v1/pages` - Create page/record
- `GET /v1/blocks/{blockId}` - Get single block
- `GET /v1/blocks/{blockId}/children` - Get block children (paginated based on subNodes)
- `PATCH /v1/blocks/{blockId}/children` - Append child blocks to specified block
- `PATCH /v1/blocks/{blockId}` - Update block
- `DELETE /v1/blocks/{blockId}` - Delete block

> **Pagination Feature:** Child block retrieval API uses pagination mechanism based on parent block's `subNodes` field, maintaining user-set block order, with cursor format as simple block ID.


## Bot API Detailed Description


### Authentication

All API requests need to include Bearer Token in HTTP header:


```
Authorization: Bearer your_bot_token_here
```


### Base URL


#### Production Environment


```
https://api.buildin.ai/v1
```


### Create Page

Create a new page or multi-dimensional table record.


```http
POST /v1/pages
```

**Request Body:**


```json
{
  "parent": {
    "database_id": "d9824bdc-8445-4327-be8b-5b47500af6ce"
  },
  "icon": {
    "emoji": "📝"
  },
  "cover": {
    "external": {
      "url": "https://example.com/cover.jpg"
    }
  },
  "properties": {
    "Title": {
      "type": "title",
      "title": [
        {
          "text": {
            "content": "New Page Title"
          }
        }
      ]
    },
    "Description": {
      "type": "text",
      "text": [
        {
          "text": {
            "content": "Page description"
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
    "Price": {
      "type": "number",
      "number": 99.99
    }
  }
}
```

**Supported Property Types:**

- **Title Property:**

```json
{
  "Title": {
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
}
```

- **Text Property:**

```json
{
  "Description": {
    "type": "text",
    "text": [
      {
        "type": "text",
        "text": {
          "content": "This is a description text"
        }
      }
    ]
  }
}
```

- **Select Property:**

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

- **Number Property:**

```json
{
  "Price": {
    "type": "number",
    "number": 99.99
  }
}
```


## Permission System


### Bot Capabilities

- `readContent` - Read content permission
- `insertContent` - Create content permission
- `updateContent` - Update content permission
- `readUserWithEmail` - Read user information (with email)
- `readUserWithoutEmail` - Read user information (without email)

### Page Permission Management

- Bots can only access explicitly authorized pages
- Support dynamic addition/removal of page permissions
- Permission checks are performed on every API call

## Best Practices


### 1. Security

- **Integration Application Secret**: Keep secure, update regularly
- **Bot Token**: Use HTTPS transmission, avoid leakage
- **OAuth2 state parameter**: Prevent CSRF attacks

### 2. Permission Management

- **Principle of least privilege**: Only request necessary bot capabilities
- **Page permissions**: Remove unnecessary page permissions promptly
- **Permission audit**: Regularly check permission usage

### 3. Error Handling


```javascript
try {
  const response = await fetch('/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pageData)
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    // Handle specific errors
  }

  const result = await response.json();
  return result;
} catch (error) {
  console.error('Network Error:', error);
  // Implement reasonable retry mechanism
}
```


### 4. Development Optimization

- **Batch operations**: Avoid frequent individual API calls
- **Data management**: Properly manage application data
- **Request frequency**: Follow API call rate limits

## Error Handling


### Common Error Codes


| Status Code | Error Code | Description |
| --- | --- | --- |
| 400 | validation_error | Request parameter validation failed |
| 401 | unauthorized | No valid authentication information provided |
| 403 | forbidden | Bot doesn't have permission to perform this operation |
| 404 | not_found | Requested resource doesn't exist |
| 429 | rate limit | Rate limit exceeded |
| 500 | internal_error | Server error |


### Error Response Format


```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "Request parameter validation failed"
}
```

**Description:**

- `object`: Fixed as "error"
- `status`: HTTP status code
- `code`: Error type code
- `message`: Detailed error information

## Development Tools and Resources


### HTTP Test Files

- `http/integration.http` - Integration application management tests
- `http/oauth.http` - OAuth2 flow tests
- `http/bot-api.http` - Bot API tests

### Example Code


```javascript
// Complete plugin development example
class BuildinPlugin {
  constructor(integrationId, secret) {
    this.integrationId = integrationId;
    this.secret = secret;
    this.accessToken = null;
  }

  // OAuth2 authorization (external applications)
  async authorize(authCode, redirectUri) {
    const response = await fetch('/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: authCode,
        client_id: this.integrationId,
        client_secret: this.secret,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    return data;
  }

  // Create page
  async createPage(parentId, properties) {
    const response = await fetch('/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: parentId },
        properties
      })
    });

    return response.json();
  }
}
```


## Summary

The Buildin plugin development system provides flexible solutions for different scenarios:

- **Internal Plugins**: Embedded within the Buildin application, users complete authorization and operations within the software
- **External Applications**: Independent third-party applications that integrate with Buildin through REST API, following standard OAuth2.0 flow
Choose the appropriate application type for your needs, follow the corresponding development flow, and you can quickly build powerful Buildin integration applications!


## Quick Reference


### Key Differences Comparison


| Feature | Internal Plugin (internal) | External Application (external) |
| --- | --- | --- |
| Required when creating | name, type, spaceId, capabilities | name, type, redirectUris, capabilities |
| Bot creation | Auto-created when creating integration | Complete OAuth2 flow |
| Page permission management | PATCH /bots/{botId}/pages | Specified during OAuth2 authorization |
| Return result | Returns integration app and bot info directly | Returns only integration app info |
| Use cases | Buildin internal, enterprise tools | Third-party developers, SaaS integration |


### API Endpoint Overview


#### OAuth Authorization (External Applications)

- `POST /oauth/token` - Exchange access token

#### Bot API (v1)

- `POST /v1/pages` - Create page/record

### Environment Configuration


| Environment | Base URL | Description |
| --- | --- | --- |
| Production | https://api.buildin.ai | Production environment |

