# STORY-015: Privacy Dashboard for Members

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | High |
| **Status** | In Progress |
| **Assignee** | @frontend-dev |
| **Sprint** | Sprint 3 |
| **Story Points** | 5 |
| **Estimated Hours** | 16 hours |
| **Due Date** | 2025-03-28 |

---

## 📝 User Story

> As a SOLVY cooperative member, I want to see a privacy dashboard that clearly shows what data is stored on my device versus what is shared with the cooperative, so that I can understand and trust the privacy architecture.

---

## ✅ Acceptance Criteria

### Visual Design
- [ ] Dashboard shows "Stored Locally (Private)" section
- [ ] Dashboard shows "Shared with Cooperative" section
- [ ] Clear visual distinction between private and shared data
- [ ] Privacy badges (🔐 Encrypted, 🎭 Anonymous, ⏱️ 30-Day Auto-Delete)

### Data Display
- [ ] Shows local transaction count
- [ ] Shows storage used locally
- [ ] Shows aggregated metrics shared (total volume, count, categories)
- [ ] Displays last sync timestamp

### Interactive Features
- [ ] Toggle to preview aggregated data JSON
- [ ] Download My Data button (exports all local data)
- [ ] Sync Now button (sends latest aggregates)
- [ ] Link to detailed privacy explanation

### Educational Content
- [ ] Explanation of local-first architecture
- [ ] What data is shared and why
- [ ] How encryption works
- [ ] Data retention policy (30 days)

---

## 🔧 Technical Implementation

### Components Needed
```
privacy-dashboard/
├── privacy-dashboard.js (main component)
├── data-preview.js (educational preview)
└── styles/
    └── privacy-dashboard.css
```

### Dependencies
- `js/services/db.js` - Local database
- `js/services/aggregation-service.js` - Metrics calculation

### Key Methods
```javascript
// Load local data summary
const summary = await AggregatedMetricsService.getLocalDataSummary();

// Calculate metrics
const metrics = await AggregatedMetricsService.calculateMetrics();

// Sync to central API
await AggregatedMetricsService.syncToCentralAPI();

// Export personal data
await AggregatedMetricsService.downloadPersonalData();
```

---

## 📐 Design Mockup

```
┌──────────────────────────────────────────────────────────┐
│ 🔒 Privacy Dashboard                                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ 📱 Your transaction history stays on your device.        │
│ Only anonymized aggregates are shared.                   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ ● Stored Locally (Private)                         │   │
│ ├────────────────────────────────────────────────────┤   │
│ │ 📊 Transactions: 127                               │   │
│ │ 💾 Storage Used: 245 KB                            │   │
│ │ 🏪 Merchant Names: Private ✓                       │   │
│ │ 💳 Transaction Details: Private ✓                  │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │
│ │ ● Shared with Cooperative (Aggregates Only)        │   │
│ ├────────────────────────────────────────────────────┤   │
│ │ 📈 Total Volume: $15,230.50                        │   │
│ │ 🔢 Transaction Count: 127                          │   │
│ │ 🏷️ Category Totals: 5 categories                   │   │
│ │ 🔐 Your ID: Anonymized Hash                        │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ [🔽 View Aggregated Data Preview]                       │
│                                                          │
│ [📥 Download My Data]        [🔄 Sync Now]              │
│                                                          │
│ Last synced: March 25, 2025 at 2:30 PM                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📎 Related

- **Parent Epic:** EPIC-001
- **Blocks:** STORY-016 (Data Preview Component)
- **Depends On:** TASK-007 (Aggregation Service)
- **Design:** [Figma link TBD]

---

## 💬 Discussion

### 2025-03-20 - @sa-nathan
Created initial component structure. Need to integrate with actual IndexedDB.

### 2025-03-22 - @sean
Prioritized for Sprint 3. This is critical for member trust.

### 2025-03-24 - @frontend-dev
Starting implementation. Will use the existing AggregatedMetricsService.

---

## 🏷️ Labels

`story` `frontend` `privacy` `dashboard` `sprint-3` `high-priority`
