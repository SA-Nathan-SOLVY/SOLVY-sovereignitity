# SOLVY Card API Documentation

## Overview

The SOLVY Card API enables developers to integrate cooperative debit card functionality into their applications.

## Base URL

```
https://api.solvy.coop/v1
```

## Authentication

All API requests require authentication using your API key:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Cards

#### List Cards
```http
GET /cards
```

Returns a list of all cards associated with the authenticated account.

#### Get Card Details
```http
GET /cards/{card_id}
```

Returns detailed information about a specific card.

#### Create Card
```http
POST /cards
```

Creates a new SOLVY Card.

**Request Body:**
```json
{
  "cardholder_name": "string",
  "design_id": "string",
  "material": "plastic|metal|wood"
}
```

#### Update Card
```http
PUT /cards/{card_id}
```

Updates card information.

#### Freeze/Unfreeze Card
```http
POST /cards/{card_id}/freeze
POST /cards/{card_id}/unfreeze
```

### Transactions

#### List Transactions
```http
GET /transactions
```

Query Parameters:
- `card_id` - Filter by specific card
- `start_date` - Start date (ISO 8601)
- `end_date` - End date (ISO 8601)
- `limit` - Number of results (max 100)

#### Get Transaction
```http
GET /transactions/{transaction_id}
```

### Webhooks

#### Register Webhook
```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["transaction.created", "card.frozen"]
}
```

## Error Handling

The API uses standard HTTP response codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

## Rate Limiting

- 1000 requests per hour per API key
- Rate limit headers included in all responses

## Support

For API support, contact: api-support@solvy.coop
