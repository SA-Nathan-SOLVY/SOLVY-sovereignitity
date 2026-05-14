# SOLVY Metrics Server

> **Data Sovereignty Guarantee:** This server only stores anonymized, aggregated metrics. Individual transaction data (merchant names, exact timestamps, transaction IDs) is **never** received, stored, or processed.

## Architecture

```
Member's Device (Browser)
  ├─ manDB.js              → Local IndexedDB stores full transaction history
  ├─ aggregationService.js → Computes totals, sends only aggregates
  └─ HTTPS POST            → Only: totalVolume, categorySums, memberHash

Central Server (Node.js + SQLite)
  └─ POST /api/metrics     → Stores ONLY aggregate totals
```

If this server is compromised, the attacker sees:
> *"Member `a1b2c3...` spent $4,520 across 23 transactions. $1,250 was Groceries."*

They **cannot** see where, when, or what specific items were purchased.

---

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
PORT=3000
DATABASE_URL=sqlite:./data/solvy.sqlite
ADMIN_API_KEY=your-strong-random-key-here
MEMBER_HASH_SALT=solvy_aggregation_salt_2025
ALLOWED_ORIGINS=https://ebl.beauty,http://localhost:8000
NODE_ENV=development
```

Generate a strong API key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start the Server

```bash
npm start        # production
npm run dev      # development with auto-reload (Node 18+)
```

The database and tables are created automatically on first run.

---

## API Endpoints

### `GET /health` — Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T20:00:00.000Z",
  "service": "solvy-metrics-api",
  "version": "1.0.0"
}
```

### `POST /api/metrics` — Submit Aggregated Metrics

Receives **only** anonymized aggregates from member devices.

```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "memberIdHash": "a1b2c3d4e5f6789012345678901234567890abcd1234567890abcdef12345678",
    "totalVolume": 4520.75,
    "transactionCount": 23,
    "categorySums": { "Groceries": 1250.50, "Transport": 340.00, "Dining": 520.25 },
    "totalInterchange": 67.81,
    "memberPoolShare": 47.47,
    "periodStart": "2026-05-01T00:00:00.000Z",
    "periodEnd": "2026-05-31T23:59:59.999Z",
    "timestamp": "2026-05-13T20:00:00Z"
  }'
```

Response (201):
```json
{
  "status": "accepted",
  "recordId": 1,
  "receivedAt": "2026-05-13T20:00:05.123Z"
}
```

**Rejected:** If the payload contains individual transaction fields (e.g., `merchant`, `transactionId`), the server returns 400:
```json
{
  "status": "error",
  "message": "Individual transaction data not accepted — only aggregated metrics allowed."
}
```

### `GET /api/metrics` — List Aggregates (Admin)

Protected by `ADMIN_API_KEY`.

```bash
curl -H "Authorization: Bearer your-admin-api-key" \
  "http://localhost:3000/api/metrics?limit=10&offset=0"
```

Response:
```json
{
  "status": "ok",
  "count": 42,
  "aggregates": [
    {
      "id": 1,
      "memberIdHash": "a1b2c3d4...",
      "totalVolume": 4520.75,
      "transactionCount": 23,
      "categorySums": { "Groceries": 1250.50, ... },
      "totalInterchange": 67.81,
      "memberPoolShare": 47.47,
      "periodStart": "2026-05-01T00:00:00.000Z",
      "periodEnd": "2026-05-31T23:59:59.999Z",
      "receivedAt": "2026-05-13T20:00:05.123Z"
    }
  ]
}
```

Query parameters:
- `memberHash` — filter by specific member
- `startDate` / `endDate` — ISO date filters
- `limit` — max records (default 100, max 1000)
- `offset` — pagination offset

### `GET /api/metrics/summary` — Global Summary (Admin)

Protected by `ADMIN_API_KEY`. Returns cooperative-wide totals.

```bash
curl -H "Authorization: Bearer your-admin-api-key" \
  http://localhost:3000/api/metrics/summary
```

Response:
```json
{
  "status": "ok",
  "totalMembers": 42,
  "totalVolumeAllMembers": 125000.00,
  "totalInterchangeAllMembers": 1875.00,
  "totalMemberPoolAllMembers": 1312.50,
  "totalTransactionCount": 1523,
  "period": {
    "start": "2026-05-01T00:00:00.000Z",
    "end": "2026-05-31T23:59:59.999Z"
  }
}
```

---

## Data Model

### `member_aggregates` Table

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Auto-increment |
| `member_id_hash` | TEXT | SHA-256 hash (irreversible) |
| `timestamp` | TEXT | ISO timestamp when data was computed |
| `total_volume` | REAL | Total spending volume |
| `transaction_count` | INTEGER | Number of transactions |
| `category_sums` | TEXT | JSON: `{ "Groceries": 1250.50 }` |
| `total_interchange` | REAL | Estimated interchange |
| `member_pool_share` | REAL | 70% of interchange |
| `period_start` | TEXT | Reporting period start |
| `period_end` | TEXT | Reporting period end |
| `client_version` | TEXT | Client app version |
| `received_at` | TEXT | Server timestamp |

**Indexes:** `member_id_hash`, `timestamp`, `period_start`, `period_end`

---

## Security Features

| Feature | Implementation |
| :--- | :--- |
| API Key Auth | `Authorization: Bearer <key>` or `X-API-Key` header |
| Rate Limiting | 100 requests per 15 minutes per IP |
| CORS | Configurable origins via `ALLOWED_ORIGINS` |
| Body Size Limit | 10kb (aggregates are small) |
| Payload Rejection | Rejects any request containing `merchant`, `transactionId`, etc. |
| SQL Injection | All queries use prepared statements |
| Helmet | Secure HTTP headers |

---

## Switching to PostgreSQL

For production with many members, replace `db/index.js` with a `pg` pool:

```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

Update `models/AggregatedMetric.js` to use `async/await` with `pool.query()`. The rest of the application (routes, config, middleware) remains unchanged.

---

## Deployment Notes

- **Development:** SQLite is fine. Just run `npm start`.
- **Production:** Use PostgreSQL + deploy behind Nginx with HTTPS.
- **Backup:** SQLite is a single file — copy `data/solvy.sqlite` to backup.
- **Monitoring:** Use `/health` for uptime checks (e.g., UptimeRobot, Pingdom).

---

## License

Proprietary — SA Nathan LLC. Cooperative ownership.
