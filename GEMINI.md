# Aheera Store — Complete System Architecture & Operational Memory

This document is the persistent memory and operational specification for the **Aheera Store** platform (Pure Organic Dairy & Farm Foods, Giridih).

---

## 1. Brand & Business Overview
- **Brand Name**: Aheera Store (Pure Organics & Farm Dairy)
- **Tagline**: *"Purity in Every Drop, Fresh From Farm to Doorstep"*
- **WhatsApp & Phone Helpline**: `+91 7992360814` (`https://wa.me/917992360814`)
- **Instagram**: `https://www.instagram.com/aheera_milk/`
- **Facebook**: `https://www.facebook.com/p/Aheera-61583257063126/`
- **Direct UPI Handle**: `7992360814@ibl`
- **Firebase Project ID**: `aheera-milk`
- **Firestore Collections**:
  - `artifacts/aheera-milk/public/data/orders`: Customer orders (`customerName`, `phone`, `address`, `city`, `deliverySlot`, `items`, `subtotal`, `deliveryFee`, `discount`, `total`, `paymentMethod`, `deliveryOtp`, `status`, `createdAt`, `createdAtMs`)
  - `artifacts/aheera-milk/public/data/broadcast/current`: Live announcement banner and flash sale modal state (`title`, `message`, `code`, `active`, `updatedAt`)

---

## 2. Core Repository Files & Architecture
- `index.html`: Main Customer Storefront PWA.
  - Architectural synthesis of **Zynara** (luxury boutique aesthetics, haute editorial welcome gate, story reels, Cormorant Garamond typography), **Cheat Meals** (sizzling dairy catalog, variant selector, dynamic pricing, floating cart dock), **Shubh Safar** (sticky notification ribbon, rich broadcast modal, festive 3D coverflow, progressive delivery security OTP deck, Web Audio synthesizer chime), and **TensorLoom** (clean responsive layout, zero layout shift, mobile-first PWA).
- `admin.html`: Unified Operations & Farm Dispatch Console.
  - PIN protected access (`1234` or `7050`).
  - Real-time Firestore order updates with one-click status transition: `new` (Order Received) ➔ `confirmed` (Farm Packed) ➔ `dispatched` (Out for Sunrise Delivery) ➔ `delivered` (Doorstep Handover Done).
  - Customer Handover PIN verification check.
  - Live Flash Broadcast Studio to push instant promo alerts to customer devices.
- `invoice.html`: Printable & Downloadable Digital Tax Invoice Receipt.
  - Auto-hydrates from URL search parameter (`?data=...`) or `localStorage.aheera_last_order`.
- `manifest.json`: Web App Manifest for Android & iOS standalone mobile installation.
- `sw.js`: Progressive Web App Service Worker with cache management, offline fallback, and push notifications.

---

## 3. Invariant Operational Rules
1. **Never push directly to GitHub** without explicit user instruction.
2. **Doorstep Handover PIN Security**:
   - Every order generates a unique 4-digit security PIN (`deliveryOtp`).
   - The delivery executive must confirm the PIN with the customer upon handover to transition status to `delivered`.
3. **Cart & Delivery Calculations**:
   - Minimum threshold for free doorstep delivery: ₹250 (standard fee ₹25 below ₹250).
   - Dynamic coupon support: `AHEERA100` (₹100 off on ₹500+), `PURE10` (10% off), `PUREDESI` (15% off bilona ghee), `FREEDEL` (zero delivery fee).
4. **Real-time Synchronization**:
   - The customer app listens to Firestore `onSnapshot` queries for both order tracking and broadcasts so state changes reflect instantaneously without page reload.
