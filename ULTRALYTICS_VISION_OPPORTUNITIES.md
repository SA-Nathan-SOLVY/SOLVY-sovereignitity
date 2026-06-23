# Ultralytics Computer Vision Opportunities for SOLVY Ecosystem™

> **Status:** Strategic research for later features — post Foundation First / post-launch.  
> **Constraint:** Must align with SOLVY's local-first, consent-based data sovereignty architecture.  
> **Vendor context:** SOLVY is using **Lithic** as the debit card vendor and is building a vendor-agnostic banking layer.

---

## Why Ultralytics for SOLVY?

[Ultralytics](https://www.ultralytics.com/solutions) provides production-ready YOLO models for:

- **Object detection** — YOLOv8 / YOLOv11
- **Instance segmentation** — pixel-precise object boundaries
- **Oriented Bounding Boxes (OBB)** — rotated rectangles for documents, text, cards
- **Image classification** — document type / scene classification
- **YOLO-World** — open-vocabulary detection without retraining
- **SAM (Segment Anything Model)** — via Ultralytics hub

For SOLVY, the deeper fit is **Sovereign AI**: deploying and controlling the entire vision pipeline on our own infrastructure, legal border, and member devices. YOLO supports this because it can run entirely on-device or in a self-hosted edge environment — no need to send sensitive images to third-party APIs. This directly counters vendor lock-in and external data handling, and it reinforces the local-first, consent-based architecture already built into SOLVY.

---

## Sovereign AI Principles Applied

| Principle | How YOLO Enables It |
|-----------|---------------------|
| **Sovereign Infrastructure** | Self-host YOLO models on Hetzner VPS, edge nodes, or member devices. Full control over compute, inference, and data flow. |
| **Edge AI / Local Processing** | Run YOLO on smartphones, browsers, Raspberry Pi, or Coral TPU. Raw images never leave the device. |
| **Automated Anonymization** | Detect and blur faces, license plates, full card PANs, and sensitive document regions in real time before any storage or sharing. |
| **Consent & Audit** | Every vision-derived output flows through existing `voting-widget.js` and `data-pool-optin.js` governance. Immutable audit log for all access. |
| **Machine Unlearning** | For model retraining use cases, track which member data influenced model updates; on member withdrawal, remove or retrain to eliminate that influence. |

## Priority 1: Near-Term / Post-Launch Fits

### 1. Receipt Scanning & Expense Auto-Categorization

**SOLVY domain:** `solvy-cards/src/pages/Receipts.jsx`, SOLVY Accounting™, SPS/EBL expense tracking.

**Current state:**
- Mobile apps already request camera permissions for receipts.
- `Receipts.jsx` only simulates scanning (`Scanning...` → random result).
- `BudgetService.autoCategorize()` is keyword-based.

**Ultralytics application:**
- Use **YOLO OBB or document-segmentation** to detect the receipt region in the camera frame.
- Correct perspective skew using the detected corners.
- Pass cropped receipt to OCR (e.g., PaddleOCR, Tesseract, or a multimodal LLM).
- Extract merchant, date, line items, tax, tip, total.
- Feed merchant text into `BudgetService.autoCategorize()` or auto-create categorized transactions in IndexedDB.

**Data sovereignty alignment:**
- Raw receipt images processed on-device; original image deleted after extraction.
- Only structured data (merchant, amount, category) stored locally in IndexedDB.
- No raw receipt images sent to SOLVY servers or third parties.

**Recommended model:** YOLOv8n-OBB or YOLO11n-OBB for fast on-device document corner detection.

---

### 2. Mobile Check Deposit (Remote Deposit Capture)

**SOLVY domain:** Banking portal Transfers tab, Treasury Prime integration.

**Current state:**
- Treasury Prime supports `POST /check_deposit`; Unit.co does not.
- Mobile check deposit is already advertised in `PERSONAL-CARD-GUIDE.md`.
- Transfers tab has placeholders only.

**Ultralytics application:**
- **Check region detection** with OBB: ensure all four corners of the check are in frame.
- **Quality validation:** glare, shadow, blur, skew detection using segmentation.
- **Fraud/tampering signals:** duplicate-deposit image hashing, altered-date detection.
- MICR line OCR (routing/account/check number) via OCR post-processing.

**Data sovereignty alignment:**
- Check images are highly sensitive; process on-device when possible.
- Transmit to Treasury Prime only the images required for deposit, with audit logging.
- Store only transaction metadata locally (amount, date, status), not the image.

**Recommended model:** YOLOv8n-OBB + ONNX runtime in browser/Capacitor app.

---

### 3. KYC / ID Document Capture Pre-Check *(higher priority with Lithic)*

**SOLVY domain:** `onboarding.html`, SOLVY-built onboarding flow, Lithic integration.

**Current state:**
- SOLVY has a **vendor-agnostic banking router** (`solvy-platform/api/banking-router.js`) and **Lithic is the current successful sandbox integration**.
- Lithic handles KYC/CIP via the `/v1/account_holders` endpoint (`createAccountHolder()` in `api/adapters/lithic.js`).
- Unlike Unit.co's white-label app, SOLVY owns the onboarding UX. Adding on-device document capture + selfie liveness improves approval rates and reduces fraud fallback.
- `privacy.html` already discloses ID + selfie collection.

**Ultralytics application:**
- **Document edge detection & perspective correction** for driver's license / passport.
- **Document classification:** detect ID type (front vs back, license vs passport).
- **Quality checks:** glare, blur, cutoff, rotation.
- Optional MRZ/barcode region detection for passports and PDF417 on IDs.
- **Selfie liveness / face-match** to the ID photo.

**Data sovereignty alignment:**
- Capture and pre-validate on-device.
- Send only the final corrected image to Lithic's KYC endpoint over TLS.
- Do not retain raw ID images or selfies on SOLVY servers.

**Recommended model:** YOLOv8n-OBB for document corners; YOLOv8-cls for document type classification.

---

## Priority 2: Medium-Term / Scale Opportunities

### 4. Card Security & Visual Fraud Detection

**SOLVY domain:** `card/solvy-card.html`, `banking/index.html` freeze/unfreeze, card customizer, Lithic card lifecycle.

**Current state:**
- **Lithic is the active card issuing integration** (sandbox proven).
- Card display, freeze/unfreeze, and custom card art are already part of the portal.

**Ultralytics application:**
- **Card-in-hand verification:** detect card presence in a member's selfie for high-risk actions (large transfer, replacement request).
- **PAN exposure scanning:** detect if a screenshot or uploaded image contains a visible full card number and auto-blur/warn.
- **Card art compliance:** validate custom card designs against network logo safe zones and OCR-B readability before submission to Lithic.

**Data sovereignty alignment:**
- Verification images processed on-device or in SOLVY-controlled edge function.
- No biometric or card images retained beyond the session.

**Recommended model:** YOLOv8 for object detection; YOLO-World for open-vocabulary "card" / "text" detection.

---

### 5. SPS / EBL Inventory & Asset Tracking

**SOLVY domain:** SPS Joint Venture, EBL supply-expense tracker, Data Flywheel.

**Current state:**
- SPS pilot promises "Reverse inventory tracking powered by real spend data" and SKU-level tracking.
- EBL supply tracker supports receipt uploads.

**Ultralytics application:**
- **Object counting:** count products on shelves or in shipment boxes using YOLO detection.
- **Receipt-to-inventory matching:** link scanned supplier receipts to detected on-hand stock.
- **Visual product catalog builder:** photograph product packaging; detect category/brand/price.
- **Shrinkage detection:** compare expected vs detected inventory.

**Data sovereignty alignment:**
- Processing at the partner edge or on-device.
- Aggregate counts (not raw images) feed the data pool after member vote + opt-in.
- No facial recognition; focus on products and spaces.

**Recommended model:** YOLOv8n for counting; YOLO-World for open-vocabulary product categories without retraining.

---

### 6. Privacy-Preserving Physical Analytics at Partner Locations

**SOLVY domain:** Data Marketplace, Data Flywheel, privacy dashboard.

**Ultralytics application:**
- **Anonymous foot-traffic / queue counting** at EBL/SPS using member-owned or partner-owned cameras.
- **Vehicle / parking analytics** for cooperative-owned spaces.
- **Busy-hour detection** from low-cost edge cameras to inform demand signals.

**Data sovereignty alignment:**
- On-device / edge inference; raw video never stored centrally.
- Only anonymized counts and time-bucketed aggregates are shared.
- Requires member vote and per-location opt-in, mirroring `data-pool-optin.js` flow.

**Recommended model:** YOLOv8n-pose or YOLOv8n for person detection; on-device Edge TPU / Raspberry Pi deployment.

---

### 9. MAN Portal Anonymous Physical Analytics

**SOLVY domain:** MAN Portal (`internal/man-portal.html`), Data Marketplace, voting widget.

**Ultralytics application:**
- Anonymous occupancy / trend analysis at partner locations (EBL, SPS) using edge cameras.
- Count people, vehicles, or queue lengths without facial recognition.
- Surface aggregate demand insights to the cooperative for collective bargaining.

**Data sovereignty alignment:**
- Edge inference; only counts and time-bucketed aggregates are transmitted.
- Requires member vote and per-location opt-in, mirroring existing data pool governance.
- All raw video discarded immediately.

**Recommended model:** YOLOv8n on Raspberry Pi / Coral TPU / edge node.

### 10. DECIDEY Education & Media Anonymization

**SOLVY domain:** DECIDEY NGO (`decidey-ngo-react/`, `solvy-platform/decidey/`).

**Ultralytics application:**
- Anonymize faces and identifying markers in video/image contributions from community members.
- Build interactive educational tools that use local vision AI without sending media to cloud APIs.
- Enable safe documentation of community programs, events, and advocacy.

**Data sovereignty alignment:**
- Process media on-device or in SOLVY-controlled edge.
- PII stripped before any publication or sharing.
- Contributors retain ownership; usage governed by explicit consent.

**Recommended model:** YOLOv8 for face/license-plate detection; segmentation for precise blurring.

### 11. MOLI / Health & Wellness Privacy-Preserving Vision

**SOLVY domain:** Phase 2 MOLI (`phase2-moli/`, `MOLI_ARCHITECTURE.md`).

**Ultralytics application:**
- Anonymize health-related imagery or documents before any provider or research partner review.
- Local document analysis for wellness program eligibility without exposing PII.
- Visual redaction assistant for medical/financial records shared under member control.

**Data sovereignty alignment:**
- All preprocessing local; only redacted or aggregate outputs leave the device.
- Consent and withdrawal handled through existing governance flows.

**Recommended model:** YOLOv8-seg for PII region detection and redaction.

## Priority 3: Long-Term / Phase 2 Exploration

### 7. Member-Owned Data Capture Devices

**SOLVY domain:** Local-first architecture, data sovereignty, DECIDEY/NGO programs.

**Ultralytics application:**
- **Home/business sensor hub:** low-cost cameras, smart scales, energy monitors connected by member opt-in.
- **On-device CV extracts anonymized patterns:** e.g., "small business restocked inventory," "home energy usage spike."
- **Proof-of-presence / proof-of-operation** for benefits eligibility using redacted visual proofs.

**Data sovereignty alignment:**
- Raw sensor/video data stays on member-owned edge device.
- Only verified, redacted proofs or aggregates are shared after explicit consent.
- Aligns with manifesto `proofOfLineage()` vision: vision-based verification without revealing PII.

**Recommended model:** YOLOv8n on edge devices (Raspberry Pi, Coral TPU, Apple Neural Engine).

---

### 8. Sovereign Accountant — Document Intelligence

**SOLVY domain:** DeepSeek integration, `Underwriting.tsx`, `budget-service.js`, MAN audit network.

**Current state:**
- `Underwriting.tsx` describes a "Sovereign Accountant" for reconciliation and audit-ready books.
- `internal/trust-expenses.html` uploads PDFs, images, Excel files.

**Ultralytics application:**
- **Document layout analysis:** detect regions (header, table, total, signature, date) before OCR.
- **Document classification:** route uploaded files to correct vault category.
- **Signature/date/checkbox detection:** verify required fields are complete.
- **Redaction assistant:** auto-detect PII regions in documents shared externally.

**Data sovereignty alignment:**
- Process uploaded documents in SOLVY-controlled environment.
- Maintain immutable audit log of all access.
- Only anonymized, consented outputs enter the data pool.

**Recommended model:** YOLOv8 for document region detection; YOLO-World for open-vocabulary form element detection.

---

## Deployment Architecture Options

### Option A: Fully On-Device (Most Sovereign)

```
Member Device / Browser / Capacitor App
  └─ ONNX Runtime / TensorFlow.js / CoreML / NNAPI
     └─ Ultralytics YOLO (exported to ONNX/CoreML/TFLite)
         └─ Raw image processed locally
         └─ Structured output → IndexedDB
         └─ Aggregates shared only after opt-in
```

**Best for:** Receipt scanning, ID pre-check, check deposit, personal analytics.

### Option B: SOLVY-Controlled Edge Function

```
Member Device → SOLVY API / Edge Node (Hetzner or Pi cluster)
  └─ Ultralytics YOLO running in Docker/container
  └─ Raw image processed, not stored
  └─ Structured output returned; image deleted
```

**Best for:** Document intelligence, card verification, heavier models.

### Option C: Federated / Differential Privacy

```
Member Devices train local CV models
  └─ Only model updates (gradients) aggregated centrally
  └─ No raw images leave device
  └─ Improved receipt categorization model for everyone
```

**Best for:** Improving shared categorization/classification models without centralizing data.

---

## Suggested Implementation Sequence

1. **Post-launch Q3 2026:** Build receipt scanning with YOLOv8n-OBB + OCR in the mobile app. → **TASK-106**
2. **Post-launch Q3–Q4 2026:** Add ID document capture pre-check and selfie liveness for the Lithic-based onboarding flow. → **TASK-107**
3. **2027 H1:** Evaluate mobile check deposit via Lithic's partner bank or ACH processor.
4. **2027 H2:** Pilot SPS inventory object counting with YOLO-World.
5. **2028+:** Expand to member-owned edge devices and federated learning for vision models.

---

## Key Constraints to Respect

From `SOVEREIGNITITY_DATA_ARCHITECTURE.md` and `AGENTS.md`:

- Raw transaction data never leaves the member's device.
- Explicit per-pool opt-in required before any data sharing.
- Member vote required for new data uses or monetization.
- Client-side encryption (AES-256-GCM) for pooled data.
- 30-day deletion default for contributed data.
- SHA-256 anonymization for identity in aggregates.
- Immutable audit trail for all access.

---

## Quick Reference: Ultralytics Model → SOLVY Use Case

| Ultralytics Capability | SOLVY Use Case |
|------------------------|----------------|
| YOLOv8/YOLO11 Detection | Inventory counting, people counting, PAN detection |
| YOLOv8/YOLO11 OBB | Receipt corner detection, check alignment, ID perspective correction |
| YOLOv8/YOLO11 Segmentation | Document quality validation, glare/shadow detection |
| YOLOv8/YOLO11 Classification | Document type classification, scene classification |
| YOLO-World | Open-vocabulary product/category detection without retraining |
| SAM | Precise receipt/document segmentation for extraction |
| Export to ONNX/CoreML/TFLite | On-device mobile/browser inference for privacy |

---

## Ecosystem Component Mapping

| SOLVY Component | YOLO Application | Sovereignty Benefit |
|-----------------|------------------|---------------------|
| **DECIDEY Education** | Anonymize media contributions; interactive local vision tools | Protects member identity in community documentation |
| **MAN Portal** | Anonymous occupancy/trend analysis at partner locations | Aggregate insights without individual surveillance |
| **MOLI / Wellness** | Redact/anonymize health and financial documents | Enables privacy-preserving program participation |
| **SOLVY Accounting™** | Receipt scanning, document understanding | Cuts manual data entry; keeps raw receipts local |
| **Card / Banking** | Card-in-hand verification, PAN exposure scanning, ID capture | Reduces fraud without centralizing biometric/card images |
| **SPS / EBL Pilot** | Inventory counting, receipt-to-stock matching | Member-owned business intelligence at the edge |
| **Data Marketplace** | Edge-derived aggregate datasets | Sell insights, not raw data; 70/20/10 member revenue share |
| **Core Sovereignty Mission** | Self-hosted vision infrastructure | Builds parallel, community-owned AI capacity |

## Conclusion

The strongest near-term opportunity is **receipt scanning for SOLVY Accounting™**, because the mobile UI and camera permissions already exist and only the vision/OCR backend is missing. It directly serves members, reduces manual data entry, and can be implemented entirely on-device to preserve SOLVY's data sovereignty promise.

The most strategically resonant framing, however, is **Sovereign AI Infrastructure**: deploying YOLO on our own devices and servers so that sensitive visual data never needs to leave the cooperative's control. This turns computer vision from a feature into a sovereignty capability — one that supports the card program, accounting, partner analytics, DECIDEY media, and the Data Flywheel under the same governance model: member vote, explicit opt-in, local-first processing, and 70/20/10 revenue sharing when aggregated insights become cooperative assets.

---

*Document created: June 21, 2026*  
*For later features — Foundation First launch remains the priority.*
