# 🛒 Cart Page — React Native App

A premium dark-mode food delivery cart & checkout experience built with **Expo + React Native + TypeScript**.

---

## 📁 Project Structure

```
Cart-Page/
├── App.tsx                          ← Root navigator (slides between screens)
├── index.js                         ← Expo entry point
├── app.json                         ← Expo config
├── babel.config.js                  ← Babel config
├── tsconfig.json                    ← TypeScript config
├── package.json                     ← Dependencies
├── assets/                          ← App icons & splash
│   ├── icon.png
│   ├── splash.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── src/
    ├── types/
    │   └── index.ts                 ← Shared TypeScript interfaces
    └── screens/
        ├── CartScreen.tsx           ← Cart Page (Screen 1)
        └── PaymentCheckoutScreen.tsx← Checkout + Payment (Screen 2)
```

---

## 🚀 How to Run

### 1. Install dependencies (already done if you see node_modules)
```bash
npm install
```

### 2. Start Expo Dev Server
```bash
npm start
```

### 3. Run on a device or emulator

| Platform | Command |
|----------|---------|
| Android emulator | Press `a` in terminal |
| iOS simulator | Press `i` in terminal |
| Physical device | Install **Expo Go** app → scan the QR code |

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Background | `#12131C` |
| Surface | `#1D1E28` |
| Accent Gold | `#E6B43A` |
| Soft Highlight | `#272936` |
| Text Primary | `#FFFFFF` |
| Text Muted | `#8A8D9B` |
| Border | `#2A2C3A` |

---

## ✨ Features

### CartScreen
- Animated gold segmented delivery toggle (Express / Scheduled)
- Cart items with `[−] qty [+]` gold stepper controls (live total update)
- Cross-sell carousel with bounce animation and `+ Add` → `✓ Added` state
- Coupon codes: try **`SAVE10`** (10% off) or **`FLAT5`** ($5 flat)
- Tip chips with animated gold background interpolation
- Live bill breakdown: subtotal + delivery + taxes + tip − discount
- Sticky bottom bar with grand total + "Proceed to Checkout" CTA

### PaymentCheckoutScreen
- Expandable address selector with spring animation & rotating chevron
- Animated gold radio buttons for Card / UPI / Cash on Delivery
- Gold toggle switch for wallet balance (reduces total live)
- 1.8s processing overlay with 3 bouncing gold dots
- Multi-phase Payment Success Modal:
  - Card springs up + overlay fades in
  - Gold checkmark rotates in + ripple ring expands
  - Pulsing glow + order ID, ETA, delivery status track
  - "Track My Order" CTA resets to cart
