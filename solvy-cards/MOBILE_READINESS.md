# SOLVY Card Mobile — Unit.co Readiness Checklist

> For: Replit development team  
> Platform: iOS (Xcode) + Android (Android Studio Panda 4)  
> Capacitor Version: 8.x

---

## Project Structure

```
solvy-cards/
├── android/           # Android Studio project (AGP 8.13.0)
├── ios/App/           # Xcode project (Swift Package Manager)
├── src/pages/         # React app pages
│   ├── Dashboard.jsx  # Card balance + quick actions
│   ├── Card.jsx       # Card details
│   ├── Services.jsx   # EBL/Reign links
│   ├── Receipts.jsx   # Camera upload (SPS)
│   └── More.jsx       # Settings + share
├── capacitor.config.json
└── MOBILE_READINESS.md (this file)
```

---

## ✅ Completed

### Android
- [x] Capacitor platform added (`npx cap add android`)
- [x] Plugins synced (`@capacitor/camera`, `@capacitor/browser`, `@capacitor/share`)
- [x] AGP downgraded to 8.13.0 (compatible with plugins)
- [x] Deprecation warnings fixed (proguard, gradle properties)
- [x] `flatDir` replaced with maven repos
- [x] SDK installed at `~/Library/Android/sdk`
- [x] Info: `com.solvy.card` package, API 36 target

### iOS
- [x] Capacitor platform added (`npx cap add ios`)
- [x] Swift Package Manager configured (no CocoaPods needed)
- [x] Camera permissions added to Info.plist
- [x] Plugins synced (7 plugins)
- [x] Info: `com.solvy.card` bundle ID

### Web App
- [x] Dashboard with balance + quick actions
- [x] Card page with controls
- [x] Services page (EBL/Reign browser links)
- [x] Receipts page (Capacitor Camera integration)
- [x] More page (share + settings)
- [x] 5-tab bottom navigation

---

## 🔄 Pending — Unit.co Integration

### 1. Connect to Unit Elements

In `src/pages/Dashboard.jsx`, the "Deposit" button needs to open Unit Elements:

```javascript
// TODO: Add Unit Elements integration
import { Browser } from '@capacitor/browser';

async function openUnitBanking() {
  // 1. Get JWT token from backend
  const tokenResponse = await fetch('https://api.ebl.beauty/api/unit-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Member-ID': memberId
    },
    body: JSON.stringify({ memberData })
  });
  
  const { token, customerId } = await tokenResponse.json();
  
  // 2. Open Unit Elements
  const unitUrl = `https://ui.s.unit.sh/?token=${token}`;
  await Browser.open({ url: unitUrl });
}
```

**Where to add:** Dashboard.jsx line ~42 (Deposit button onClick)

---

### 2. Deep Links (Post-Underwriting)

For Unit.co onboarding flow, add deep links so the web app can redirect back to the native app:

**iOS:** Add to `Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.solvy.card</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>solvy</string>
    </array>
  </dict>
</array>
```

**Android:** Add to `AndroidManifest.xml`:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="solvy" android:host="card" />
</intent-filter>
```

---

### 3. Environment Variables

Create `solvy-cards/.env` for frontend:
```bash
VITE_API_BASE_URL=https://api.ebl.beauty
VITE_UNIT_ENV=sandbox
```

Create `solvy-platform/api/.env` for backend:
```bash
UNIT_PARTNER_ID=[from Unit.co dashboard]
UNIT_PARTNER_SECRET=[from Unit.co dashboard]
UNIT_ORG_ID=[from Unit.co dashboard]
```

**Replit will provide these after underwriting approval.**

---

### 4. Build Commands

```bash
# 1. Update web assets
npm run build

# 2. Sync to native projects
npx cap sync

# 3. iOS build (Xcode)
# Open solvy-cards/ios/App/App.xcodeproj
# Click ▶️ Run

# 4. Android build (Android Studio)
# Open solvy-cards/android/ in Android Studio
# Click ▶️ Run
```

---

## 📋 Unit.co Underwriting Dependencies

The following are **blocked** until Unit.co approves production access:

| Item | Status | Blocker |
|------|--------|---------|
| Production API token | 🔴 | Unit.co underwriting |
| Live customer onboarding | 🔴 | Unit.co underwriting |
| Real card issuance | 🔴 | Unit.co underwriting |
| Production webhooks | 🔴 | Unit.co underwriting |
| App Store / Play Store release | 🟡 | Pending app review |

**Current:** All code uses sandbox mode (`NODE_ENV=sandbox`)

---

## 🚀 Post-Underwriting Steps (Replit)

1. **Get Unit.co credentials** from partner dashboard
2. **Add to `.env`** files (backend + frontend)
3. **Switch to production** (`NODE_ENV=production`)
4. **Test with real SSN** (not test SSNs)
5. **Submit apps** to App Store / Play Store
6. **Launch** June 19, 2026

---

*SOLVY Ecosystem™ — Product of SA Nathan LLC*
