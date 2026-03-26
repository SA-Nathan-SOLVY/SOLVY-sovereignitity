# EPIC-001: Local-First Privacy-Centric Data Architecture

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Epic |
| **Priority** | Critical |
| **Status** | In Progress |
| **Owner** | @sa-nathan |
| **Sprint** | Sprint 2-3 |
| **Story Points** | 34 |
| **Target Completion** | 2025-04-08 |

---

## 📝 Description

Refactor SOLVY's data architecture to be local-first and privacy-centric. Transaction data should live on member devices (IndexedDB) with only anonymized aggregates contributing to collective bargaining power. Members vote before any data pooling occurs.

**Business Value:**
- Reduce central storage costs by 90%
- Increase member trust through data sovereignty
- Enable offline functionality
- Comply with privacy regulations

---

## ✅ Success Criteria

- [ ] All transaction data stored locally in IndexedDB
- [ ] Client-side aggregation before sending to server
- [ ] Privacy dashboard showing local vs shared data
- [ ] Threshold-based voting system
- [ ] Encrypted temporary data pool
- [ ] 30-day auto-deletion implemented
- [ ] Migration script for existing data
- [ ] Documentation complete

---

## 📊 Child Tasks

### Phase 1: Data Audit & Migration
- [x] TASK-001: Map existing data schema
- [x] TASK-002: Create migration plan
- [x] TASK-003: Build export script

### Phase 2: Local Storage
- [x] TASK-004: Implement IndexedDB schema
- [x] TASK-005: Build database service layer
- [x] TASK-006: Add offline sync support

### Phase 3: Aggregation
- [x] TASK-007: Client-side aggregation service
- [x] TASK-008: Privacy dashboard component
- [x] TASK-009: Data preview component

### Phase 4: Thresholds
- [x] TASK-010: Threshold monitoring service
- [x] TASK-011: Threshold widget component
- [x] TASK-012: Notification system

### Phase 5: Voting
- [x] TASK-013: Voting service (MAN integration)
- [x] TASK-014: Voting widget component
- [x] TASK-015: Proposal management

### Phase 6: Data Pool
- [x] TASK-016: Encryption service
- [x] TASK-017: Data pool opt-in modal
- [x] TASK-018: Cleanup script

### Phase 7: Retirement
- [ ] TASK-019: Verify all migrations complete
- [ ] TASK-020: Retire central transaction storage

---

## 🔧 Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MEMBER DEVICE                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Transactions│  │  Aggregated  │  │   Voting Data    │   │
│  │  (IndexedDB)│  │   Metrics    │  │                  │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                │                    │             │
│         └────────────────┴────────────────────┘             │
│                          │                                  │
│                   ┌──────┴──────┐                          │
│                   │ Sync Manager│                          │
│                   └──────┬──────┘                          │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CENTRAL SERVER                           │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │   Aggregated   │  │   Proposals  │  │  Encrypted     │   │
│  │    Totals      │  │    & Votes   │  │  Data Pool     │   │
│  │ (No individual │  │ (Hashed IDs) │  │ (Temporary)    │   │
│  │  transactions) │  └──────────────┘  └────────────────┘   │
│  └────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📎 Related

- **Design Doc:** [./solvy-platform/SOVEREIGNITITY_DATA_ARCHITECTURE.md]
- **API Spec:** [./solvy-platform/api/]
- **Parent Goal:** SOLVY 2.0 Release

---

## 🏷️ Labels

`epic` `architecture` `privacy` `local-first` `sprint-2` `sprint-3` `critical`
