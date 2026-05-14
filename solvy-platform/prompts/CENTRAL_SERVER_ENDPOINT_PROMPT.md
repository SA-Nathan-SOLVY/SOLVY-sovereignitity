## ✅ Kimi Prompt – Central Server Endpoint (Node.js + Express)

Copy and paste this directly into Kimi Code (VS Codium) or the Kimi chat interface.

---

```text
Kimi, I need a complete, production-ready central server endpoint for my SOLVY app. This is the server-side piece that receives anonymized, aggregated metrics from members' devices. It must NEVER store individual transaction data — only aggregated totals.

Create a single Node.js file (or a small module) called `metrics-api.js` that sets up an Express server with the following:

## 1. Database Setup (SQLite)

Use `better-sqlite3` (synchronous, fast, zero-config). Create a table called `member_aggregates` with these columns:

- `id` — INTEGER PRIMARY KEY AUTOINCREMENT
- `member_hash` — TEXT (SHA-256 hash, anonymized member identifier)
- `total_volume` — REAL (sum of transaction amounts)
- `transaction_count` — INTEGER
- `category_sums` — TEXT (JSON string: { "Groceries": 1250.50, "Transport": 340.00 })
- `total_interchange` — REAL
- `member_pool_share` — REAL (70% of interchange)
- `computed_at` — TEXT (ISO timestamp from client)
- `received_at` — TEXT (ISO timestamp, server-side)
- `client_version` — TEXT (e.g., "SOLVY-PWA-v1.0")

Also create an index on `member_hash` for fast lookups.

Initialize the database on startup. If the table already exists, do not recreate it (use `CREATE TABLE IF NOT EXISTS`).

## 2. POST /api/metrics — Receive Aggregated Metrics

This endpoint receives ONLY aggregated data from the member's device.

Request body (JSON):
{
  "totalVolume": 4520.75,
  "transactionCount": 23,
  "categorySums": { "Groceries": 1250.50, "Transport": 340.00, "Dining": 520.25 },
  "totalInterchange": 67.81,
  "memberPoolShare": 47.47,
  "interchangeRate": 0.015,
  "computedAt": "2026-05-13T20:00:00Z",
  "memberHash": "a1b2c3d4...f0" (SHA-256 hex string),
  "clientVersion": "SOLVY-PWA-v1.0",
  "timestamp": "2026-05-13T20:00:00Z"
}

Validation rules (reject with 400 if any fail):
- `totalVolume` must be a non-negative number
- `transactionCount` must be a non-negative integer
- `categorySums` must be an object (can be empty)
- `memberHash` must be a hex string of length 64 (SHA-256)
- `timestamp` must be a valid ISO 8601 string

On success:
- Insert into `member_aggregates` table
- Return 200 with JSON: { "success": true, "recordId": <id>, "receivedAt": "..." }

On error:
- Return appropriate 4xx/5xx with JSON: { "success": false, "error": "..." }

IMPORTANT: If the payload accidentally contains any field named `transactions`, `merchantNames`, `transactionIds`, or `rawData`, reject it with 400 and log a security warning. The server must NEVER accept individual transaction data.

## 3. GET /api/metrics — Retrieve Aggregated Metrics (Admin/Dashboard)

Query parameters (all optional):
- `memberHash` — filter by specific member hash
- `startDate` — ISO date string, filter records computed on or after this date
- `endDate` — ISO date string, filter records computed on or before this date
- `limit` — max records to return (default 100, max 1000)
- `offset` — pagination offset (default 0)

Returns JSON:
{
  "success": true,
  "count": 45,
  "aggregates": [
    {
      "id": 1,
      "memberHash": "a1b2c3...",
      "totalVolume": 4520.75,
      "transactionCount": 23,
      "categorySums": { "Groceries": 1250.50, ... },
      "totalInterchange": 67.81,
      "memberPoolShare": 47.47,
      "computedAt": "2026-05-13T20:00:00Z",
      "receivedAt": "2026-05-13T20:00:05Z"
    }
  ]
}

Also include a `summary` object with:
- `totalMembers` — unique member_hash count
- `totalVolumeAllTime` — sum of all total_volume
- `totalInterchangeAllTime` — sum of all total_interchange
- `totalMemberPoolAllTime` — sum of all member_pool_share

## 4. GET /api/metrics/health — Health Check

Returns 200 with JSON: { "status": "ok", "timestamp": "...", "dbConnected": true }

## 5. Security & Middleware

- Use `express.json()` with a 10kb limit (aggregates are small).
- Add a simple API key middleware: check `X-API-Key` header against an environment variable `SOLVY_API_KEY`. If missing or invalid, return 401.
- Add rate limiting with `express-rate-limit`: 100 requests per 15 minutes per IP.
- Add CORS configured from an environment variable `ALLOWED_ORIGINS` (comma-separated). Default to `https://ebl.beauty`.
- Add a security middleware that logs and rejects any request body containing keys like `transactions`, `merchantNames`, `rawData`, `individualData`.

## 6. Environment Variables

The server should read from `.env` (use `dotenv`):

- `PORT` — server port (default 3000)
- `SOLVY_API_KEY` — required API key for POST /api/metrics
- `DATABASE_PATH` — SQLite file path (default `./data/solvy_metrics.db`)
- `ALLOWED_ORIGINS` — comma-separated CORS origins
- `NODE_ENV` — 'development' or 'production'

## 7. Startup Script

Include a `start()` function that:
1. Ensures the database directory exists
2. Initializes the SQLite table
3. Starts the Express server
4. Logs: `SOLVY Metrics API running on port 3000`

Also export the Express app for testing.

## Constraints

- NEVER store individual transaction data. Only store the aggregate fields listed above.
- If a payload contains unexpected fields, silently drop them (do not store).
- All database operations should use prepared statements (parameterized queries) to prevent SQL injection.
- Use JSDoc comments for all functions.
- Keep it simple — this is a sovereign data endpoint, not a full analytics platform.
- Include a comment block at the top explaining the data sovereignty principle: "This server only stores anonymized aggregates. Individual member transactions never reach this server."

After generating the code, give me:
1. The file contents for `metrics-api.js`
2. A sample `.env` file
3. A `package.json` snippet showing the required dependencies
4. A short example of how to test the endpoint with curl
```

---

## ✅ What Kimi Will Generate

Kimi will produce:

| File | Purpose |
| :--- | :--- |
| `metrics-api.js` | Express server with POST/GET /api/metrics, SQLite storage, security middleware |
| `.env.example` | Required environment variables |
| `package.json` deps | `express`, `better-sqlite3`, `dotenv`, `cors`, `express-rate-limit` |

---

## ✅ Example curl Test (What Kimi Should Also Output)

```bash
# Health check
curl http://localhost:3000/api/metrics/health

# Send aggregated metrics (POST)
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "totalVolume": 4520.75,
    "transactionCount": 23,
    "categorySums": { "Groceries": 1250.50, "Transport": 340.00 },
    "totalInterchange": 67.81,
    "memberPoolShare": 47.47,
    "memberHash": "a1b2c3d4e5f6...64chars",
    "timestamp": "2026-05-13T20:00:00Z"
  }'

# Retrieve aggregates (GET)
curl "http://localhost:3000/api/metrics?limit=10" \
  -H "X-API-Key: your_api_key_here"
```

---

## ✅ Complete End-to-End Architecture

| Layer | File | Stores What |
| :--- | :--- | :--- |
| **Member Device** | `manDB.js` | Individual transactions (local IndexedDB) |
| **Member Device** | `aggregationService.js` | Computes aggregates, sends only totals |
| **Network** | HTTPS POST | Only `totalVolume`, `categorySums`, `memberHash` |
| **Central Server** | `metrics-api.js` | **Only** anonymized aggregates in SQLite |

**No individual transaction data ever exists on the central server.** If the server is compromised, the attacker only sees: "Member `a1b2c3...` spent $4,520 total across 23 transactions, with $1,250 in Groceries." They cannot see when, where, or on what specific items.

---

*Paste the prompt above into Kimi Code to generate the complete server endpoint.*
