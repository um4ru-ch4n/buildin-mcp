# Bot Users API Documentation


## Overview

The Bot Users API provides functionality to retrieve information about the bot creator. These APIs allow bots to obtain information about the user who created them.


## Authentication

All API requests must include the bot's Bearer Token in the HTTP header:


```
Authorization: Bearer your_bot_token_here
```


## API Endpoints


### Get Bot Creator Information

Retrieve the creator user information of the current bot.


#### Request


```http
GET /v1/users/me
```


#### Permission Requirements

- Bot needs `readContent` capability

#### Response

**Success Response (200 OK):**


```json
{
  "object": "user",
  "id": "875bb809-eab6-467f-80d9-a7de6899d885",
  "type": "person",
  "person": {
    "email": "user@example.com"
  },
  "name": "John Doe",
  "avatar_url": "https://cdn2.buildin.ai/avatar123.jpg"
}
```


#### Response Field Descriptions


| Field | Type | Description | Required |
| --- | --- | --- | --- |
| object | string | Object type, always "user" | Yes |
| id | string | Unique identifier for the user (UUID) | Yes |
| type | string | User type, always "person" | Yes |
| person | object | User details object | Yes |
| person.email | string | User email address | No |
| name | string | User display name/nickname | No |
| avatar_url | string | Complete URL of user avatar | No |


#### Error Responses

**401 Unauthorized - Authentication Failed:**


```json
{
  "error": {
    "code": "unauthorized",
    "message": "Missing Authorization header"
  }
}
```

**403 Forbidden - Insufficient Permissions:**


```json
{
  "error": {
    "code": "forbidden", 
    "message": "Bot does not have readContent permission"
  }
}
```

**404 Not Found - Creator Not Found:**


```json
{
  "error": {
    "code": "not_found",
    "message": "Bot creator not found"
  }
}
```


## Usage Examples


### JavaScript Example


```javascript
class FlowUsBot {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'https://api.buildin.ai';
  }

  async getMe() {
    const response = await fetch(`${this.baseUrl}/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  }
}

// Usage example
async function example() {
  const bot = new FlowUsBot('your_bot_token_here');
  
  try {
    const creator = await bot.getMe();
    console.log('Bot creator information:', {
      id: creator.id,
      name: creator.name,
      email: creator.person?.email,
      hasAvatar: !!creator.avatar_url
    });
  } catch (error) {
    console.error('Failed to get creator information:', error.message);
  }
}
```


### cURL Example


```
curl -X GET "https://api.buildin.ai/v1/users/me" \
  -H "Authorization: Bearer your_bot_token_here" \
  -H "Content-Type: application/json"
```


### Python Example


```python
import requests

class FlowUsBot:
    def __init__(self, token):
        self.token = token
        self.base_url = 'https://api.buildin.ai'
    
    def get_me(self):
        headers = {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f'{self.base_url}/v1/users/me', headers=headers)
        response.raise_for_status()
        return response.json()

# Usage example
if __name__ == '__main__':
    bot = FlowUsBot('your_bot_token_here')
    
    try:
        creator = bot.get_me()
        print(f"Creator: {creator['name']} ({creator['id']})")
        if creator.get('person', {}).get('email'):
            print(f"Email: {creator['person']['email']}")
    except requests.RequestException as e:
        print(f"Request failed: {e}")
```


## Use Cases


### 1. Personalized Welcome Messages

Generate personalized welcome messages based on the bot creator's information:


```javascript
async function generateWelcomeMessage(bot) {
  const creator = await bot.getMe();
  const name = creator.name || 'User';
  return `Hello ${name}! I am your FlowUs bot, happy to serve you!`;
}
```

