# AutoPulse™ UI Design System & Prototype Suite

Welcome to the dedicated **UI Design** folder for the **AutoPulse™ Garage & Multi-Branch Network Operating System**.

This folder contains the complete, pure UI design recreation for both the **Desktop Back-Office Web Portal** and the **Mobile Workshop Bay Application (Android APK / Tablet)**.

---

## 🚀 Key Highlights & Tech Stack Choice

- **Zero-Dependency / Zero-Build Tech Stack**:
  - Pure, modern **HTML5**, **CSS3 (with Tailwind CDN + custom glassmorphic variables)**, and **Vanilla JavaScript**.
  - **No `npm install`**, no multi-gigabyte `node_modules`, no build step, no framework version mismatches.
  - Instantly previewable by double-clicking [`index.html`](file:///C:/Users/User/Desktop/Projects/GarageApp/UI-Design/index.html) in any browser!
- **Faithful Recreation of Both Form Factors**:
  - 🖥️ **Desktop Version**: Comprehensive enterprise back-office management portal.
  - 📱 **Mobile Version**: Ergonomic workshop bay app for tablets and smartphones.
  - 💻📱 **Interactive Showcase & Dual View**: Live side-by-side comparison mode in [`index.html`](file:///C:/Users/User/Desktop/Projects/GarageApp/UI-Design/index.html).

---

## 📁 Directory Structure

```
GarageApp/
├── Prototype 1/                 # Original prototype codebase
└── UI-Design/                   # Recreated pure UI design folder (same directory level)
    ├── index.html               # Master Interactive Showcase (Desktop, Mobile, Dual, Styleguide)
    ├── desktop.html             # Standalone PC Back-Office Web Portal
    ├── mobile.html              # Standalone Mobile / Tablet Bay Application
    ├── css/
    │   └── styles.css           # Automotive theme tokens, animations & glassmorphism
    ├── js/
    │   └── app.js               # Reactive mock data, Kanban transitions, modals & events
    └── README.md                # Documentation & preview guide
```

---

## 🎨 Modules & Features Recreated

### 🖥️ PC / Desktop Version (`desktop.html`)
1. **Executive Header**:
   - Multi-branch network switcher (`Apex Downtown`, `Apex West`, `Apex North Bay`).
   - Real-time Wi-Fi Mesh Relay status (`192.168.1.140:8765 [Relay Active]`).
   - Live UTC clock and instant **+ New Vehicle Intake** trigger.
   - Outbox synchronization badge and user profile pill.
2. **Executive Analytics & Overview**:
   - Monthly gross revenue, active vehicles count, repair cycle time, and first-time fix rates.
   - Real-time workshop bay occupancy grid (Bays 1 through 8).
   - Recent service invoices and urgent low-stock warehouse warnings.
3. **Repair Pipeline (Kanban Board)**:
   - 5 interactive milestone columns: `1. Intake`, `2. Diagnosis`, `3. In Repair`, `4. Quality Check`, `5. Ready & Picked Up`.
   - Dynamic status progression with real-time card advance.
   - DVI 360° Inspection modal trigger.
4. **Bills & Invoicing**:
   - Commercial service invoice ledger, labor/parts cost breakdown, payment settlement statuses (`PAID`, `IN PROGRESS`, `READY TO BILL`), and printable invoice preview.
5. **Staff & Bay Operations**:
   - Mechanic roster cards with status badges, efficiency rating gauges, and one-tap **Clock In / Clock Out** shift toggles.
6. **Parts & Warehouse**:
   - Live SKU catalog with category filtering, real-time safety stock alerts, and quick restock / deduct actions.
7. **IT Security & Sync Relay**:
   - Local Room SQLite database health metrics and TLS encrypted cloud outbox queue.

---

### 📱 Mobile Bay App (`mobile.html`)
1. **Sector 1: Work Progress & Bay Management**:
   - Vehicle intake banner and filter chips (`All`, `Intake`, `Diagnosis`, `In Repair`, `QC`, `Ready`).
   - Vehicle status cards with technician assignments and one-tap stage advance.
2. **Sector 2: Parts & Warehouse**:
   - Part search, quick +/- 1 stock count buttons, restock shortcuts, and barcode scanner modal.
3. **Sector 3: Staff & Shift Clock**:
   - Technician bay assignments with fast one-tap **Clock Out / Clock In** shift toggle.
4. **Sector 4: Sales Insights**:
   - Today's revenue, parts margins, daily goal progress bar, and settled invoice feed.
5. **Sector 5: System Admin & Outbox Engine**:
   - Local SQLite WAL cache status, queued mutation counter, and instant sync trigger.
6. **Shared Interactive Modals**:
   - **Digital Vehicle Inspection (DVI) 360°**: Interactive car schematic with clickable damage pins.
   - **Barcode / QR Scanner**: Viewfinder with animated laser sweep effect.
   - **Vehicle Intake Sheet**: Quick vehicle check-in form.

---

## 🌐 How to Preview

You can open the UI designs immediately in two easy ways:

### Option 1: Direct File Opening (No tools needed)
Simply double-click [`index.html`](file:///C:/Users/User/Desktop/Projects/GarageApp/UI-Design/index.html) to open the interactive design showcase in Google Chrome, Microsoft Edge, Safari, or Firefox.

### Option 2: Local Static Server (Optional)
If you prefer running a local static server:
```powershell
cd C:\Users\User\Desktop\Projects\GarageApp\UI-Design
python -m http.server 3000
# Or: npx serve
```
Then visit `http://localhost:3000`.
