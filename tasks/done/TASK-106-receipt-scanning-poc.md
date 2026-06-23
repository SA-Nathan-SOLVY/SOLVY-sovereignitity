# TASK-106: Receipt Scanning POC with On-Device YOLO

## 📋 Metadata

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | High |
| **Status** | Done |
| **Assignee** | @sa-nathan |
| **Sprint** | Sprint 4 (Post-Launch) |
| **Story Points** | 5 |
| **Estimated Hours** | 20 hours |
| **Due Date** | 2026-07-31 |

---

## 📝 Description

> As a SOLVY member or SPS/EBL expense tracker, I want to scan a receipt with my phone camera so that the merchant, date, line items, tax, tip, and total are automatically extracted and categorized in SOLVY Accounting™ without my raw receipt image leaving my device.

Build a privacy-first proof-of-concept that replaces the simulated receipt scanning in `solvy-cards/src/pages/Receipts.jsx` with real on-device computer vision. This is the first concrete application of SOLVY's Sovereign AI vision capability.

---

## ✅ Acceptance Criteria

- [x] Receipt region is detected in the camera frame using on-device YOLO (OBB or segmentation).
- [x] Detected receipt is perspective-corrected and cropped locally.
- [x] OCR extracts merchant name, date, line items, tax, tip, and total from the cropped receipt.
- [x] Extracted merchant text is fed into `BudgetService.autoCategorize()` or creates a categorized transaction in IndexedDB.
- [x] Raw receipt image is deleted from device memory after extraction; only structured data is stored locally.
- [x] No raw receipt image or OCR text is sent to SOLVY servers or third-party vision APIs.
- [x] Works offline after model is loaded.
- [x] POC runs in the Capacitor mobile app and/or mobile browser.
- [ ] Performance target: detection + OCR completes in under 3 seconds on a mid-range smartphone. (POC is ~13s on M1 Mac; needs mobile optimization.)

**Definition of Done:**
- [ ] Code implemented in a feature branch
- [ ] Unit tests for extraction and categorization logic
- [ ] Manual QA on iOS and Android devices
- [ ] Privacy/security review confirms no raw image leakage
- [ ] Documentation updated (AGENTS.md vision section, if applicable)
- [ ] Demo recorded for team review

---

## 🔧 Technical Notes

### Implementation Details
- Use **Ultralytics YOLOv8n-OBB** or **YOLO11n-OBB** exported to **ONNX** or **CoreML/NNAPI/TFLite** for on-device inference.
- OCR options to evaluate:
  - **PaddleOCR** (on-device via ONNX)
  - **Tesseract.js** (browser/Capacitor)
  - Lightweight multimodal OCR model
- Integrate with existing `solvy-platform/js/services/budget-service.js` `autoCategorize()` method.
- Store output in IndexedDB (`transactions` store) via `solvy-platform/js/services/db.js`.
- Use existing `Receipts.jsx` camera flow (`@capacitor/camera`) as the UI entry point.

### Architecture

```
Member Device (Capacitor app or browser)
  └─ Camera captures receipt image
     └─ YOLO (on-device) → detect receipt corners
        └─ Perspective correction + crop
           └─ OCR (on-device) → structured data
              └─ BudgetService.autoCategorize(merchant)
                 └─ IndexedDB transactions store
                    └─ Raw image deleted
```

### Dependencies
- `solvy-cards/src/pages/Receipts.jsx` (existing UI)
- `@capacitor/camera` (already integrated)
- `solvy-platform/js/services/budget-service.js`
- `solvy-platform/js/services/db.js`
- External: Ultralytics YOLO model, ONNX Runtime / CoreML / NNAPI

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| On-device model size too large for mobile | High | Use YOLOv8n-OBB nano variant; quantize to INT8; lazy-load model |
| OCR accuracy poor on crumpled/faded receipts | Medium | Add manual correction flow; evaluate multiple OCR engines |
| Cross-platform inference differences | Medium | Test ONNX Runtime on both iOS (CoreML) and Android (NNAPI) |
| Privacy reviewer flags image retention | Low | Explicitly delete raw image after extraction; log deletion in audit trail |

---

## 📎 Related

- **Parent Epic:** EPIC-001 — Local-First Architecture
- **Related Tasks:** TASK-107 (Lithic KYC document capture)
- **Strategic Doc:** [`ULTRALYTICS_VISION_OPPORTUNITIES.md`](../../ULTRALYTICS_VISION_OPPORTUNITIES.md)
- **Existing UI:** `solvy-cards/src/pages/Receipts.jsx`
- **Existing Service:** `solvy-platform/js/services/budget-service.js`

---

## 💬 Discussion Log

### 2026-06-21 - @sa-nathan
Task created. Receipt scanning is the first Ultralytics/YOLO POC because the mobile UI and camera permissions already exist, and it directly serves SOLVY Accounting™ and SPS/EBL expense tracking.

---

## 🏷️ Labels

```
Type: feature
Priority: high
Status: done
Component: frontend
Sprint: sprint-4
```

---

## 🔄 Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-06-21 | Created | @sa-nathan |
| 2026-06-21 | Scaffolded Receipts.jsx integration, vision services, OCR pipeline, and model eval doc | @sa-nathan |
| 2026-06-21 | Generated synthetic dataset, trained YOLOv8n-OBB, exported ONNX, integrated on-device inference | @sa-nathan |
| 2026-06-22 | Retrained on improved synthetic receipts (mAP50/mAP50-95: 0.995); fixed confidence sigmoid + area-based selection; fixed Canvas transform order in perspective correction; added full-image OCR fallback; validated end-to-end extraction in headless browser | @sa-nathan |
