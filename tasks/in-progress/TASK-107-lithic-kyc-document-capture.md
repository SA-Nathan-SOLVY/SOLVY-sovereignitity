# TASK-107: Lithic Onboarding KYC Document Capture with On-Device Vision

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | High |
| **Status** | Backlog |
| **Assignee** | @sa-nathan |
| **Sprint** | Sprint 4 (Post-Launch) |
| **Story Points** | 8 |
| **Estimated Hours** | 32 hours |
| **Due Date** | 2026-08-15 |

---

## 📝 Description

> As a prospective SOLVY member, I want to capture my government-issued ID and take a selfie during onboarding so that Lithic's KYC/CIP review can be completed quickly, accurately, and without SOLVY or a third party retaining my raw biometric or document images.

Build an on-device document-capture and selfie-liveness flow for the SOLVY-built onboarding experience. SOLVY uses Lithic as the debit card vendor (`api/adapters/lithic.js` → `createAccountHolder()`), which means SOLVY owns the onboarding UX rather than embedding a Unit.co-style white-label app. Adding local vision pre-checks improves KYC pass rates, reduces fraud fallback, and reinforces SOLVY's data sovereignty promise.

This task should begin after the receipt-scanning POC (TASK-106) validates the on-device YOLO pipeline.

---

## ✅ Acceptance Criteria

- [x] Onboarding flow prompts member to capture front and back of government-issued ID.
- [x] On-device YOLO detects document edges, corrects perspective, and validates image quality (glare, blur, cutoff, rotation).
- [x] Document type is classified (driver's license front/back, passport, state ID) — heuristic inference from OCR text.
- [ ] Member is prompted for a selfie; on-device liveness detection confirms a real person (not a photo/video) — selfie capture scaffolded, liveness deferred.
- [ ] Optional face-match score is computed between selfie and ID photo on-device — deferred.
- [x] Only the final corrected ID images and liveness proof are transmitted to Lithic's `/v1/account_holders` endpoint over TLS.
- [x] Raw ID images, selfies, and face-match embeddings are deleted from device memory immediately after submission.
- [x] SOLVY servers do not store raw ID images or selfies at any point.
- [x] Submission is logged in an immutable audit trail (timestamp, member hash, document type, success/failure).
- [x] Onboarding flow degrades gracefully if device lacks camera or vision model fails to load (manual upload fallback via gallery + mock mode).

**Definition of Done:**
- [ ] Code implemented in a feature branch
- [ ] Unit tests for document detection, quality checks, and liveness helpers
- [ ] Integration test with Lithic sandbox `createAccountHolder()`
- [ ] Security/privacy review confirms no raw biometric/document retention on SOLVY servers
- [ ] QA on iOS and Android devices
- [ ] Onboarding flow documentation updated
- [ ] Demo recorded for team review

---

## 🔧 Technical Notes

### Implementation Details
- Use **Ultralytics YOLOv8n-OBB** for document corner detection and perspective correction.
- Use **YOLOv8-cls** for document type classification (license front, license back, passport, state ID).
- Quality validation heuristics:
  - Glare detection via segmentation or pixel histogram analysis
  - Blur detection via Laplacian variance
  - Rotation/cutoff detection via OBB angle and coverage ratio
- Liveness detection options to evaluate:
  - On-device blink/head-movement challenge using MediaPipe Face Mesh
  - Lightweight anti-spoofing model
  - Depth/texture analysis (if device supports)
- Face-match options:
  - On-device face embedding model (e.g., MobileFaceNet) + cosine similarity
  - Or skip face-match and rely on Lithic's backend verification
- Submit final images to Lithic `createAccountHolder()` in `solvy-platform/api/adapters/lithic.js`.
- Update `onboarding.html` or build the flow in the React/Capacitor onboarding layer.

### Architecture

```
Member Device (Capacitor app or browser)
  ├─ Capture ID front
  │  └─ YOLO OBB → corners + perspective correction
  │     └─ Quality validation
  │        └─ Final corrected image kept in memory only
  ├─ Capture ID back (same pipeline)
  ├─ Capture selfie
  │  └─ Liveness detection (on-device)
  │     └─ Optional face-match to ID photo (on-device)
  └─ Submit package to Lithic /v1/account_holders
     └─ Delete raw images from device
        └─ Log audit event (no image data)
```

### Dependencies
- `solvy-platform/api/adapters/lithic.js` — `createAccountHolder()`
- `solvy-platform/api/banking-router.js` — vendor-agnostic routing
- `solvy-platform/onboarding.html` or React/Capacitor onboarding flow
- `solvy-platform/js/services/encryption-service.js` (if encrypting audit metadata)
- External: Ultralytics YOLO, MediaPipe or equivalent liveness library, face embedding model
- **Blocks/Blocked by:** This task starts after TASK-106 (receipt scanning POC) validates the on-device YOLO pipeline.

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Liveness detection too strict/too lenient | High | A/B test thresholds in sandbox; provide clear user feedback |
| Face-match accuracy varies across skin tones | High | Evaluate bias in chosen model; allow Lithic backend to be authoritative |
| iOS/Android inference performance differs | Medium | Test ONNX Runtime with CoreML/NNAPI delegates; fallback to server-side pre-check if needed |
| Lithic account holder API changes | Low | Pin API version; monitor Lithic changelog |
| Member distrust of biometric capture | Medium | Clear privacy disclosure; show on-device processing indicator; no retention policy |

---

## 📎 Related

- **Parent Epic:** EPIC-002 — Card Issuing (Lithic)
- **Related Tasks:** TASK-106 (receipt scanning POC), TASK-090 (Lithic sandbox integration), TASK-091 (vendor switch default to Lithic)
- **Strategic Doc:** [`ULTRALYTICS_VISION_OPPORTUNITIES.md`](../../ULTRALYTICS_VISION_OPPORTUNITIES.md)
- **Adapter Code:** `solvy-platform/api/adapters/lithic.js`
- **Onboarding UI:** `solvy-platform/onboarding.html`

---

## 💬 Discussion Log

### 2026-06-21 - @sa-nathan
Task created. With Lithic as the active debit card vendor, SOLVY owns the onboarding UX and needs a strong KYC document + selfie capture flow. This should reuse the on-device YOLO pipeline proven in TASK-106.

---

## 🏷️ Labels

```
Type: feature
Priority: high
Status: in-progress
Component: frontend
Sprint: sprint-4
```

---

## 🔄 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-06-21 | Created | @sa-nathan |
| 2026-06-23 | Built synthetic ID dataset, trained YOLOv8n-OBB document detector (mAP50-95: 0.995), refactored vision services, built ID processor/quality checks/OCR parser, KycCapture UI, Lithic KYC endpoint, and runtime test | @sa-nathan |
