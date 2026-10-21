# AutoPulse™ Garage & Network Management System
## Official User Manual & Operational Guide
**Version:** 1.0.0 (Production Release)  
**Target Platform:** Android (Native / Capacitor Wrapper) & Web Portal  
**Document Revision:** October 2026  

---

## Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Hardware & Software Prerequisites](#2-hardware--software-prerequisites)
3. [Installation & First-Time Setup](#3-installation--first-time-setup)
4. [User Interface Anatomy & Sector Organization](#4-user-interface-anatomy--sector-organization)
5. [Module 1: Work Progress & Workshop Bay Management](#5-module-1-work-progress--workshop-bay-management)
6. [Module 2: Digital Vehicle Inspection (DVI) 360°](#6-module-2-digital-vehicle-inspection-dvi-360)
7. [Module 3: Inventory, Barcode Scanning & Stock Transfers](#7-module-3-inventory-barcode-scanning--stock-transfers)
8. [Module 4: Technician Management & Bay Time Tracking](#8-module-4-technician-management--bay-time-tracking)
9. [Module 5: Sales Insights, Profit Margins & Invoicing](#9-module-5-sales-insights-profit-margins--invoicing)
10. [Offline-First Resilience & Outbox Sync Engine](#10-offline-first-resilience--outbox-sync-engine)
11. [Multi-Branch Network Administration](#11-multi-branch-network-administration)
12. [Troubleshooting & Frequently Asked Questions](#12-troubleshooting--frequently-asked-questions)

---

## 1. System Overview & Architecture

**AutoPulse™** is an enterprise-grade automotive workshop and multi-garage network operating system designed specifically for garage owners, service advisors, workshop foremen, and bay technicians.

```
+-------------------------------------------------------------------------------+
|                             AutoPulse Cloud Backend                           |
|                      (PostgreSQL + Redis + NestJS / Go)                       |
+-------------------------------------------------------------------------------+
                                      ▲  ▲
                 Cloud Synchronization |  | Conflict Resolution
                                      ▼  ▼
+-----------------------------------------------+   +---------------------------+
|          AutoPulse Android Mobile App         |   |    Back-Office Web Hub    |
| (Capacitor 8 / Kotlin Compose + Room SQLite)  |   | (Executive Sales & Net)   |
|                                               |   +---------------------------+
|  • Sector 1: Bay Activity & Intake            |
|  • Sector 2: Pipeline Kanban Stages           |
|  • Sector 3: Active Job Cards & DVI 360°      |
|  • Outbox Queue & Offline Local Cache         |
+-----------------------------------------------+
```

### Key Architectural Pillars:
- **Offline-First Room SQLite Engine:** Technicians working inside reinforced concrete bays or underground inspection pits retain full capabilities even when Wi-Fi or cellular signal drops. Mutations queue in a local outbox and sync automatically once reconnected.
- **Sector-Categorized Ergonomics:** Clean separation of data, analytics, and interactive tools into numbered sectors with generous whitespace for effortless, one-handed navigation on greasy workshop tablets and smartphones.
- **Multi-Branch Network Synchronization:** Real-time visibility across independent garages or franchise branches, including inventory sharing and centralized billing insights.

---

## 2. Hardware & Software Prerequisites

### Client Device Minimum Requirements:
- **Operating System:** Android 9.0 (Pie / API 28) or higher (Android 14/15 recommended).
- **Processor:** Octa-core 2.0 GHz ARM64 or better.
- **RAM:** Minimum 3 GB RAM (4 GB+ recommended for large inventory catalogs).
- **Storage:** 150 MB available internal storage.
- **Display:** 5.5-inch to 12.9-inch touchscreens (optimized for 360–800 dp viewports).
- **Peripherals / Hardware:**
  - Rear Camera with autofocus & LED flash (for optical VIN and parts barcode scanning).
  - Wi-Fi 802.11 b/g/n/ac or 4G/5G LTE cellular connection.
  - Optional: Bluetooth 4.2+ for wireless thermal receipt and invoice printers.

---

## 3. Installation & First-Time Setup

### 3.1 Sideloading the Android APK (`AutoPulse-v1.0-debug.apk`)
1. Download the APK file onto your device using one of the following methods:
   - **Local Wi-Fi Portal:** Open your mobile browser and navigate to `http://<SERVER-IP>:5173/AutoPulse-v1.0-debug.apk`.
   - **Direct USB Transfer:** Copy `AutoPulse-v1.0-debug.apk` directly from your PC into your phone's `Download/` folder.
2. Open your device's **Files / Downloads** app and tap `AutoPulse-v1.0-debug.apk`.
3. If prompted with *"Install unknown apps"*, tap **Settings** and toggle **Allow from this source**.
4. Tap **Install** and wait for the package installer to finalize.
5. Tap **Open** to launch AutoPulse.

### 3.2 Required Android Permissions:
Upon launch, grant the following permissions when prompted:
- **Camera (`CAMERA`):** Required for the optical laser barcode scanner and DVI vehicle damage photography.
- **Storage / Media Access (`READ_MEDIA_IMAGES`):** Required for caching local inspection reports and offline Room SQLite database files.
- **Network State (`ACCESS_NETWORK_STATE`):** Required for auto-detecting internet drops and switching to offline Room DB mode.

---

## 4. User Interface Anatomy & Sector Organization

AutoPulse uses a streamlined, relaxed layout consisting of four distinct primary regions:

```
+-------------------------------------------------------------------------------+
| [AP] AutoPulse              [ Downtown Hub - Bay 1-6 v ]   [ ONLINE (Room DB) ]
+-------------------------------------------------------------------------------+
| SECTOR 1 • Workshop Bay Activity                                             |
| +-----------------------------------+ +-------------------------------------+ |
| | Active in Bays: 3                 | | Ready for Pickup: 1                 | |
| +-----------------------------------+ +-------------------------------------+ |
| [ + Intake New Vehicle ]                                                      |
+-------------------------------------------------------------------------------+
| SECTOR 2 • Pipeline Stages                                                    |
| [ ALL ]  [ INTAKE (1) ]  [ DIAGNOSIS (1) ]  [ REPAIR (1) ]  [ QC ]  [ READY ] |
+-------------------------------------------------------------------------------+
| SECTOR 3 • Active Vehicle Job Cards                                           |
| +---------------------------------------------------------------------------+ |
| | #JOB-4029 • BMW 330i (KB-8921)                            [ IN REPAIR ]   | |
| | Tech: Sarah Jenkins (Senior Tech) | Bay 2                                 | |
| | [ Move to Quality Check -> ]  [ Perform DVI (3 points) ]                  | |
| +---------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------+
| [ Work Progress ]    [ Inventory ]    [ Employees ]    [ Sales Insights ]     |
+-------------------------------------------------------------------------------+
```

1. **Header Navigation Bar:**
   - **Brand Indicator:** Displays system logo and version status.
   - **Branch Selector Pill:** Tap to switch between managed garage branches.
   - **Network & Room DB Sync Pill:** Displays live connection state (`ONLINE` / `OFFLINE`) and opens the **Outbox Drawer** if unsynced mutations are pending.
2. **Sector Content Canvas:** Each tab divides data, tools, and actions into numbered, labeled sectors with 24px vertical separation.
3. **Fixed Bottom Navigation:** High-contrast touch targets for switching between the 4 mandatory modules.

---

## 5. Module 1: Work Progress & Workshop Bay Management

The Work Progress module coordinates the repair lifecycle of every customer vehicle from initial arrival to final customer handover.

### 5.1 The 5 Pipeline Stages:
1. **Intake Inspection (`INTAKE`):** Vehicle checked in; customer issues and preliminary notes recorded.
2. **Diagnostic Review (`DIAGNOSIS`):** OBD-II scan, mechanical evaluation, and parts quotation.
3. **In Repair (`IN_REPAIR`):** Active mechanical or electrical servicing on the designated bay lift.
4. **Quality Control (`QUALITY_CHECK`):** Foreman road test, safety inspection, and torque verification.
5. **Ready for Handover (`READY_DELIVERY`):** Vehicle cleaned, invoice settled, and ready for customer pickup.

### 5.2 Intaking a New Vehicle:
1. Navigate to the **Work Progress** tab.
2. In **Sector 1 (Workshop Bay Activity)**, tap the cyan button **`+ Intake New Vehicle`**.
3. Fill in the intake fields:
   - **Customer Name & Phone:** (e.g., `Michael Scott`, `+1 (555) 234-5678`).
   - **Vehicle Model & Year:** (e.g., `2022 Toyota RAV4`).
   - **License Plate & VIN:** (e.g., `CA-7XY981`).
   - **Reported Customer Complaints:** (e.g., `Squealing noise when braking at low speeds`).
   - **Assign Technician & Bay:** Select technician from the dropdown list.
4. Tap **Confirm Vehicle Intake**. A new job card is immediately minted and saved to the local Room database.

### 5.3 Advancing Job Cards:
- Locate the target vehicle under **Sector 3 (Active Vehicle Job Cards)**.
- Tap the bright progression button (e.g., **`Move to Diagnostic Review`**, **`Send to In Repair`**, or **`Pass QC & Handover`**).
- The vehicle card transitions forward through the pipeline with instantaneous outbox sync.

---

## 6. Module 2: Digital Vehicle Inspection (DVI) 360°

To protect the garage from pre-existing damage disputes and build customer trust, AutoPulse provides an interactive 360° damage wireframe inspection tool.

### 6.1 Recording Panel Damage & Hotspots:
1. On any vehicle card in **Sector 3**, tap the **`Perform DVI`** button.
2. The interactive vehicle inspection canvas opens, displaying a top-down wireframe silhouette representing:
   - Front Bumper & Grille
   - Engine Hood
   - Windshield
   - Left Front & Rear Doors
   - Right Front & Rear Doors
   - Rear Bumper & Trunk Deck
3. **Tap directly on the damaged panel:**
   - Tap once: Adds an amber pin indicating a **Dent / Scratch**.
   - Tap again: Converts pin to red indicating **Severe Damage / Crack**.
   - Tap a third time: Removes the pin if added in error.
4. Select damage severity and add optional mechanic notes (e.g., *"3cm scratch on rear quarter panel prior to lift entry"*).
5. Tap **Save Inspection Report**. The damage map is locked to the job card and included on the customer's digital invoice.

---

## 7. Module 3: Inventory, Barcode Scanning & Stock Transfers

The Inventory module controls automotive parts, fluids, and hardware consumables across your workshop bays.

### 7.1 Sector Breakdown:
- **Sector 1 • Stock Level Summary:** Real-time counter of total cataloged items and **Low-Stock Alerts** (items below safety stock thresholds).
- **Sector 2 • Optical Scanner & Tools:** Quick trigger for camera barcode scanning and inter-branch inventory transfers.
- **Sector 3 • Parts Master Catalog:** Search by OEM part number, SKU, or name with category filtering (*Brakes*, *Fluids & Oils*, *Filters*, *Engine*, *Suspension*).

### 7.2 Using the Optical Barcode Scanner:
1. In **Sector 2**, tap **`Scan Parts Barcode`**.
2. Point your device's camera at the 1D/2D barcode on the part box or fluid canister.
3. The laser reticle will acquire the code and display the matching inventory record.
4. Select an action:
   - **Deduct Stock (Allocate to Job):** Automatically decrements quantity and bills to active job card.
   - **Receive Shipment:** Increments quantity on hand and logs vendor invoice.

### 7.3 Inter-Branch Stock Transfers:
When a specific brake pad set or alternator is out of stock in your branch:
1. Locate the part in **Sector 3** and tap the **Transfer** icon (`⇄`).
2. Select the **Target Branch** (e.g., *Westside Service Bay*).
3. Enter the quantity to transfer.
4. Tap **Confirm Transfer**. The inventory balance updates locally and logs an inter-garage transit manifest in the Cloud Outbox.

---

## 8. Module 4: Technician Management & Bay Time Tracking

The Employee module manages mechanic bay stationing, work efficiency, and labor hour recording.

### 8.1 Workshop Bay Capacity (Sector 1):
- Displays **Total Staff**, **Active Bays Occupied**, and shop **Labor Efficiency Rating** ($% \text{ billed flat-rate hours vs clock hours}$).

### 8.2 Live Clock-In / Clock-Out (Sector 2):
1. Technicians or foremen can view their individual staff card.
2. Tap the **`Clock In`** / **`Start Job Clock`** button when work commences on a lift.
3. The status indicator shifts from gray (*Idle / On Break*) to cyan (*Working on Job*), initiating real-time labor tracking.
4. When work finishes, tap **`Clock Out`** to freeze the session and update billable hours.

---

## 9. Module 5: Sales Insights, Profit Margins & Invoicing

Designed for garage owners to maintain financial health and track revenue trends on the fly.

### 9.1 Financial Key Performance Indicators (Sector 1):
- **Monthly Revenue:** Total billing volume with month-over-month growth percentage.
- **Average Repair Order (ARO):** Crucial metric calculating average dollar value per customer ticket.
- **Gross Profit Margin & Revenue Split:** Visual progress bar dissecting revenue between **Labor** (high margin, ~75%) and **Parts** (hardware margin, ~32%).

### 9.2 7-Day Revenue Velocity (Sector 2):
- Dynamic vertical bar chart showing day-by-day cashflow across the current work week.

### 9.3 Accounts Receivable & Uncollected Invoices (Sector 3):
- Lists outstanding balances from corporate fleet accounts and retail customers.
- **1-Tap WhatsApp Payment Reminder:** Tap the WhatsApp button to generate a pre-formatted invoice summary and payment link dispatched directly to the customer's phone.

---

## 10. Offline-First Resilience & Outbox Sync Engine

Workshop basements and remote bays frequently experience wireless dead zones. AutoPulse is architected to operate with zero friction during total network disconnection.

```
+-------------------------------------------------------------------------------+
| OFFLINE EVENT TRIGGERED (e.g. Wi-Fi signal loss in basement pit)              |
+-------------------------------------------------------------------------------+
       │
       ├─► 1. Read / Write queries redirect seamlessly to local Room SQLite DB.
       ├─► 2. Mutation (Job advanced, part deducted) executes instantly with NO lag.
       ├─► 3. Transaction record placed in Outbox Queue with monotonic timestamp.
       ├─► 4. Header status pill switches to amber: [ OFFLINE (Room DB) | Outbox: 2 ]
       │
+-------------------------------------------------------------------------------+
| NETWORK RESTORATION (Wi-Fi reconnection detected)                             |
+-------------------------------------------------------------------------------+
       │
       ├─► 1. Background worker activates and reads Outbox Queue.
       ├─► 2. Batch mutations transmitted to AutoPulse Cloud with idempotency key.
       ├─► 3. Server validates conflict resolution (Last-Write-Wins or Vector Clock).
       └─► 4. Header status pill updates to emerald: [ ONLINE (Synced) ].
```

### Manual Sync Inspection:
- Tap the **Network Pill** in the top-right header at any time to open the **Outbox Drawer**.
- Review pending offline transactions.
- Tap **Sync Now** to force an immediate push to the cloud.

---

## 11. Multi-Branch Network Administration

For multi-site garage owners:
1. Tap the **Branch Selector Pill** in the top header.
2. Select any registered garage location (e.g., *Downtown Central Garage*, *Westside Express Bay*, or *North Industrial Center*).
3. The entire application view instantly switches context:
   - Job cards reflect only vehicles located at the selected facility.
   - Inventory displays shelf quantities specific to that warehouse.
   - Staff rosters and bay utilization filter to the local crew.

---

## 12. Troubleshooting & Frequently Asked Questions

| Symptom | Cause | Resolution |
| :--- | :--- | :--- |
| **"Install Blocked by Play Protect"** | Self-signed debug APK certificate. | Tap **More details** $\rightarrow$ **Install anyway**. In production, install from internal MDM or Google Play Console. |
| **Barcode Scanner opens black screen** | Missing Android Camera permission. | Go to Android **Settings $\rightarrow$ Apps $\rightarrow$ AutoPulse $\rightarrow$ Permissions $\rightarrow$ Camera** and select **Allow only while using the app**. |
| **Outbox counter not decrementing** | Firewall or unreachable server address. | Ensure device is connected to the garage Wi-Fi and the backend server IP is reachable. Tap **Sync Now** in Outbox Drawer. |
| **Vehicle job card moved by another phone not showing** | Device in offline mode or sync interval paused. | Check network pill in header; switch to `ONLINE` to pull the latest remote changes. |
| **Bluetooth receipt printer not connecting** | Bluetooth location permission denied. | Enable **Nearby Devices** permission in Android system settings. |

---

*AutoPulse™ is a registered trademark. For technical assistance or enterprise deployment support, contact support@autopulse-garage.io.*
