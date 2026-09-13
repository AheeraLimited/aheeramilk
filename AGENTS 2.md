# Shubh Safar — Complete System Architecture & Operational Memory

This document is the single source of truth and persistent memory for the **Shubh Safar** platform.

---

## 1. Brand & Business Overview
- **Brand Name**: Shubh Safar (Self-Drive Rentals Ranchi)
- **Tagline**: *"Har Safar Ho Shubh Safar"*
- **Location**: Ranchi, Jharkhand (Doorstep delivery & garage self-pickup across Ranchi, Birsa Munda Airport, Hatia Railway Station, Lalpur, Kanke, Hinoo, Doranda, etc.)
- **Helpline & WhatsApp**: `+91 7050541867` (`https://wa.me/917050541867`)
- **Live Deployed Customer Website**: `https://shubhsafar.netlify.app/`
- **Push Notification Endpoint**: `https://shubhsafar.netlify.app/.netlify/functions/send-push`
- **Firebase Project ID**: `shubh-safar-fe03a`
- **FCM Web Push VAPID Key**: `BMZDYaA9gp4wTxPiqq_muguWM1L3AMTB2kIvtJkO3oVukG8dkb0wkiZlJ0j4WWx0x7QsVZ_8MQB6hhzbnvTiFDA`
- **Repository Core Files**:
  - `index.html`: Main Customer-Facing Website (Always 100% synchronized with `shubh-safar-rentals_5.html`).
  - `shubh-safar-rentals_5.html`: Master working HTML file for customer application.
  - `admin.html`: Unified Multi-Role Operations Console (Admin, Partner/Car Owner, Driver/Staff) (Always 100% synchronized with `portal.html`).
  - `portal.html`: Operations portal hub (Mirror of `admin.html`).
  - `sw.js`: Progressive Web App Service Worker with offline caching + Firebase Cloud Messaging background push receiver (`messaging.onBackgroundMessage`).
  - `manifest.json`: Web App Manifest for Android & iOS PWA mobile installation.
  - `netlify/functions/send-push.js`: Netlify Serverless Function using `firebase-admin` to push FCM v1 notifications to closed mobile devices.
  - `netlify.toml`: Netlify build configuration for static files, functions bundler (`esbuild`), and Node 18 runtime.
  - `package.json`: Node package configuration declaring `firebase-admin` dependency.
  - `logo.png` / `shubh-safar-logo.png`: Official high-res brand emblem.

---

## 2. Customer Application (`index.html` / `shubh-safar-rentals_5.html`)

### A. Navigation & Routing (`applyRoute`, `navTo`)
- **Default Entry Screen (`#screen-login`)**:
  1. 🚗 **"Browse & Book a Car"** (Gold Highlight) → Navigates to `#screen-browse` (`window.showBrowse()`).
  2. 🤝 **"Become a Partner (Attach Your Car)"** (Teal Gradient) → Opens Partner Application form (`#loginForm-partner` or modal `#modalPartnerForm`).
  3. 🧭 **"Track My Bookings & Live Order"** (Blue Gradient) → Navigates to `#screen-my-bookings` (`window.openCustomerLookup()`).
- **Storefront Screen (`#screen-browse`)**:
  - **Header Home Button (`<i class="fa-solid fa-house"></i>`) & Logo**: Calls `window.exitBooking()`, returning to the Welcome Hub (`#screen-login`).
  - **Hero CTA `[ 🚗 Explore Available Cars ↓ ]`**: Smoothly scrolls down directly to `#fleetSection` on `#screen-browse` without route change.
  - **Festive Offers 3D Coverflow**: Interactive carousel with promo codes (`SHUBH500`, `DARSHAN10`, `WEEKEND15`, etc.), copy promo buttons, and `[ Book Car → ]` CTA buttons that smooth-scroll to `#fleetSection`.
  - **"Attach Car →" on Festive Bonus Card**: Calls `window.openPartnerModal()`, opening `#modalPartnerForm` popup directly.
  - **Available Cars Fleet Grid (`#carGrid`)**: Category filter tabs (All Cars, SUVs & 4x4, Sedans, Hatchbacks, Automatic).
  - **Car Cards**: Clicking the card or `[ 📅 Book This Car ]` directly invokes `window.openBookingForCar(c.id)` → opens `#screen-booking` for that vehicle.

### B. Global Sticky Notification Ribbon & Rich Broadcast Popups
- **Global Top Ribbon (`#flashBroadcastBar`)**: Positioned at root level outside screen wrappers so it renders immediately on all screens (Welcome Hub, Browse, Track, Checkout) when active. Supports rich graphic thumbnail preview (`#flashBarImgWrap`).
- **Rich In-App Flash Sale Modal (`#modalBroadcastPopup`)**: Automatically pops up when admin sends a live broadcast with full 1000×560 banner graphic, pulsing badge, title, message, copyable coupon pill, and `[ 🚗 Explore Fleet & Book Now ]` CTA button.
- **Multi-Sensory Alerts**: Plays audio chime (`playNewOrderAlert()`), haptic phone vibration (`navigator.vibrate([200, 100, 200])`), toast, and native Web Push.
- **Smart Permission Opt-In Banner (`#notifOptinBanner`)**: Prompts users to enable live trip & discount alerts with 1 tap (`window.triggerNotificationOptin()`).
- **FCM Device Token Registration (`window.registerFcmDevice()`)**: Automatically retrieves the device push token using VAPID key and stores it in Firestore `fcm_tokens/{token}` collection with metadata (`platform`, `userAgent`, `active`, `updatedAtMs`).

### C. 3-Step Booking Checkout (`#screen-booking`)
1. **Step 1: Booking Details & KYC Upload**:
   - Customer Full Name, Mobile Number, Address, Booking Start/End Dates & Times.
   - Handover Choice: **Self Pickup** (from owner garage) or **Pick & Drop** (doorstep delivery).
   - Driving Licence upload (Front/Back) + Aadhaar Card upload (Front & Back).
   - Live Rental Summary Calculation: `(Days * Rate) + (PickDrop Fee * 2)`.
2. **Step 2: Token Advance Payment**:
   - Dynamic UPI payment button grid (GPay, PhonePe, Paytm, BHIM, Cred, Amazon Pay, Any UPI App).
   - Copyable UPI ID display.
   - *"I've Paid"* button unlocks after clicking any UPI payment method.
3. **Step 3: Confirmation & OTP Generation**:
   - Generates 6-character gold Booking Reference (e.g. `#EEIFUH`).
   - Generates and displays **Delivery Code** (4-digit) and **Return Code** (4-digit).
   - Direct button `[ Track This Booking Live ]` to immediately view the order.

### D. Live Tracking & Order History (`#screen-my-bookings`)
- Lookup by Customer Phone Number (auto-persisted in `localStorage.ssr_cust_phone`).
- **Order Header Card**:
  - Gold Booking Reference pill (`#EEIFUH`).
  - Modern Glowing Status Badges:
    - 🟡 `Pending Admin Approval & KYC Verification`
    - 🔵 `Approved — Assigned to Car Owner` (for Self Pickup)
    - 🔵 `Approved — Driver Dispatched to Doorstep` (for Pick & Drop)
    - 🟢 `Trip Active & Running`
    - ⚪ `Completed / Returned`
- **Progressive OTP Release & Overlapping Deck Workflow**:
  - **Initial Booking & Pickup Phase (`new`, `assigned`, `out_for_delivery`)**: Customer is shown **ONLY the Key Handover OTP** (Delivery Code). The Return OTP remains hidden until handover occurs.
  - **Active Trip & Return Phase (`active`, `out_for_return`, `completed`)**: Once the driver/partner enters the delivery OTP to hand over keys, the **Return OTP** unlocks.
  - **Overlapping Card Deck Interaction**: The Return OTP card is positioned in front/top overlapping the completed Key Handover OTP card. Customers can tap the background card or quick switcher pills to smoothly swap the cards, bringing the verified Handover OTP forward and Return OTP behind with smooth 3D layer animations.

---

## 3. Unified Operations Console (`admin.html` / `portal.html`)

### A. Partner / Car Owner Console
- **Active Bookings & Completed Tours Tabs**:
  - **Active Bookings Tab**: View active orders for their vehicles.
  - **Completed Tours / Trip History Tab**: Comprehensive historical ledger of all completed tours for the owner's fleet with customer contact details, driver logs, and all 4 verified timestamps (strictly for owner reference; bill generation is restricted to Admin/Customer).
- **Direct "Call Customer" & "Call Driver" buttons**.
- **Handover & Return Lifecycle**:
  - **Self Pickup**:
    - Step 1: Car Owner enters customer's 4-digit Delivery OTP (`deliveryOtp`) upon key handover at garage → switches status to `active`.
    - Step 2: Car Owner enters customer's 4-digit Return OTP (`returnOtp`) upon return at garage → switches status to `completed`.
  - **Doorstep Delivery**:
    - Step 1 (Garage Pickup): Car Owner sees `garageHandoverOtp` on their card and verbally shares it with the Driver upon handing over keys.
    - Step 4 (Garage Return): Car Owner sees `garageReturnOtp` on their card, inspects the car, and verbally shares it with the Driver to finalize the tour (`completed`). (No redundant submit button on owner console).

### B. Driver / Staff Console (Revamped 4-Step Doorstep Delivery Workflow)
- **Top Visual Stepper**: Progress tracker with 4 milestones (`1: Garage Pickup` ➔ `2: Doorstep Handover` ➔ `3: Customer Return` ➔ `4: Garage Return`), active pulsing dot, and green completion checkmarks.
- **Top Active Step Action Card**: Prominently placed directly below the stepper with current step instructions and primary verification CTA button (`[ Confirm Garage Pickup ]`, `[ Hand Over Keys ]`, `[ Confirm Customer Return ]`, `[ Complete Return with Owner ]`).
- **Overlapping Destination Card Deck (Beneath Active Step Card)**:
  - Vertical overlapping carousel deck showcasing **Partner Garage Location** vs. **Customer Delivery Address**.
  - Automatically brings the active milestone's relevant destination card to front (Garage for Steps 1 & 4; Customer for Steps 2 & 3).
  - Tap-to-swap mechanism or pill switcher buttons (`[ 🏢 Partner Garage ]` / `[ 👤 Customer Address ]`) smoothly transition the background card to top.
  - Each destination card features Google Maps direction link, direct One-Click Call, and WhatsApp quick dialers.
- **Tour Verification Audit Trail**: Formatted timestamps for all 4 verification milestones at the bottom of the card.
- **Step Verification Workflow**:
  - **Step 1 (Garage Pickup)**: Driver visits partner garage, inspects car, and enters Owner's `garageHandoverOtp` → status transitions to `out_for_delivery`.
  - **Step 2 (Doorstep Handover)**: Driver arrives at customer address, hands over keys, and enters Customer's `deliveryOtp` → status transitions to `active` (trip starts).
  - **Step 3 (Customer Return)**: Driver arrives at customer address, inspects car, and enters Customer's `returnOtp` → status transitions to `out_for_return` (trip ends for customer, unlocking invoice).
  - **Step 4 (Garage Return Handover)**: Driver parks vehicle in owner garage, hands over keys, and enters Owner's `garageReturnOtp` → status transitions to `completed`.
- Live background GPS tracking broadcast to Firebase `staff_locations`.

### C. Admin Console
- **Orders & Dispatching**:
  - Filter by status (All, Pending Approval, Active, Completed, Cancelled).
  - Verify Customer KYC documents (DL & Aadhaar with modal image preview & download).
  - One-click assign to Car Owner (for Self Pickup) or Driver + Owner (for Pick & Drop).
- **Fleet Showcase Management**: Add/Edit/Remove cars, rates, token amounts, pick & drop fees, photos.
- **Live Staff Map**: Real-time Leaflet map of all active drivers in Ranchi.
- **Partners & Drivers Directory**: Register owners & staff with PIN codes.
- **Festive Deals & Offers CMS**: Manage promo cards, validity, custom background images, and promo codes.
- **📢 Live Customer Broadcast & Flash Sale Studio**:
  - Compose and push instant real-time notifications with preset templates (Flash Sales, Happy Hours, Weekend Getaways, Monsoons, etc.).
  - **Dual Push Architecture**:
    1. Writes to Firestore `broadcasts/current` & `broadcast_history` for instant in-app ribbon and rich modal popup on active customer screens.
    2. Sends HTTP POST request to `https://shubhsafar.netlify.app/.netlify/functions/send-push` which triggers `firebase-admin` to dispatch background push notifications to all registered device tokens in `fcm_tokens`, lighting up phones even when the browser is completely closed.
  - **AI Banner Studio (`#modalAiBannerStudio`)**: Integrated with **Gemini 3.6 Flash** and **Nano Banana Pro (Imagen 3)** engine options with style chips and prompt presets.
  - **Fullscreen HD Image Lightbox (`#modalImageLightbox`)**: Full 1000×560 image inspection modal with one-click download.
  - **Web Photo Search Gallery (`#modalWebImageGallery`)**: Curated luxury car and tourism backgrounds with search and category filters.
- **Global Settings**: Configure UPI ID, Helpline WhatsApp, Business Address.
- **Topbar & Footer UX**: Minimalist topbar with only `[ 🚪 Logout ]` button and gold role badge. Flexbox sticky bottom footer (`.screen.active { display:flex; flex-direction:column; min-height:100vh; }`) locking TensorLoom copyright to viewport bottom.

---

## 4. Firestore Database Collections & Schemas

| Collection / Path | Purpose | Key Fields |
| :--- | :--- | :--- |
| `bookings/{id}` | All customer bookings | `refCode`, `carId`, `carModel`, `customerName`, `phone`, `address`, `pickupType`, `startDate`, `endDate`, `days`, `total`, `token`, `dlDoc`, `aadhaarFrontDoc`, `aadhaarBackDoc`, `deliveryOtp`, `returnOtp`, `status`, `assignedOwnerId`, `assignedOwnerName`, `assignedStaffId`, `assignedStaffName`, `createdAtMs` |
| `cars/{id}` | Fleet catalog | `model`, `type`, `seats`, `fuel`, `trans`, `pricePerDay`, `token`, `pdFee`, `photo`, `reg`, `available` |
| `settings/global` | Global app config | `upiId`, `phone`, `businessName`, `address` |
| `owners_doc/main` | Car owner list | `list: [ { id, name, phone, address, pin, cars: [] } ]` |
| `staff_doc/main` | Driver list | `list: [ { id, name, phone, pin, active } ]` |
| `staff_locations/{id}` | Driver GPS coordinates | `lat`, `lng`, `name`, `updatedAtMs` |
| `offers/{id}` | Festive banners | `title`, `desc`, `badge`, `validity`, `code`, `bgClass`, `customBg`, `btnText`, `btnLink`, `order`, `createdAtMs` |
| `partner_inquiries/{id}` | Car attach requests | `name`, `phone`, `car`, `location`, `status`, `createdAtMs` |
| `fcm_tokens/{token}` | Registered push devices | `token`, `platform`, `userAgent`, `updatedAtMs`, `updatedAt`, `active` |
| `broadcasts/current` | Active live broadcast | `title`, `message`, `code`, `badge`, `image`, `active`, `sentAtMs`, `sentAt`, `sentBy` |
| `broadcast_history/{id}` | Sent broadcasts archive | `title`, `message`, `code`, `badge`, `image`, `sentAtMs`, `sentAt`, `sentBy` |

---

## 5. Development & Synchronization Rules
1. **Always Synchronize `index.html`**: Whenever changes are made to `shubh-safar-rentals_5.html`, immediately run `fs.copyFileSync('shubh-safar-rentals_5.html', 'index.html')`.
2. **Always Synchronize `portal.html`**: Whenever changes are made to `admin.html`, immediately run `fs.copyFileSync('admin.html', 'portal.html')`.
3. **Always Validate Syntax**: Run `node --experimental-vm-modules` to ensure JavaScript modules have 0 syntax errors before finalizing turns.
4. **Preserve Navigation Integrity**:
   - Default initial screen is `#screen-login` (Welcome hub).
   - Header Home button returns to `#screen-login`.
   - "Explore Cars" and festive buttons scroll smoothly to `#fleetSection` on `#screen-browse`.
   - "Book This Car" opens `#screen-booking` for the selected car.
   - "Attach Car" opens `#modalPartnerForm` directly.
5. **Background Push Rules**:
   - Admin console must call the absolute customer function URL (`https://shubhsafar.netlify.app/.netlify/functions/send-push`) so it works across separate Netlify deployments.
   - Netlify must have `FIREBASE_SERVICE_ACCOUNT` environment variable configured with valid service account JSON.

