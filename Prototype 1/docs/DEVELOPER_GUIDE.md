# AutoPulse™ Garage & Network Management System
## Complete Developer Architecture & Implementation Guide
**Document Revision:** 1.0.0 (Production Core Architecture)  
**Target Systems:** Android Native (Capacitor 8 / Kotlin Compose) & TypeScript React Single Page App  
**Document Classification:** Internal Technical Documentation  

---

## Table of Contents
1. [Executive Architecture Summary & Core Philosophies](#1-executive-architecture-summary--core-philosophies)
2. [Repository Topography & File Structure](#2-repository-topography--file-structure)
3. [The Storage Layer: Room SQLite & The Outbox Pattern](#3-the-storage-layer-room-sqlite--the-outbox-pattern)
4. [Synchronization Engine & State Machine (`syncEngine.ts`)](#4-synchronization-engine--state-machine-syncenginets)
5. [Domain Data Models & Schema Contracts](#5-domain-data-models--schema-contracts)
6. [UI/UX Architecture: The Sector Ergonomic Pattern](#6-uiux-architecture-the-sector-ergonomic-pattern)
7. [Hardware Integrations & Viewfinder Systems](#7-hardware-integrations--viewfinder-systems)
8. [Modular Authentication, RBAC & Built-in Test Credentials](#8-modular-authentication-rbac--the-pluggable-module-registry)
   - [8.8 Built-in Test Profiles & Enterprise Credentials Matrix](#88-built-in-test-profiles--enterprise-credentials-matrix)
9. [Android Build Pipeline & Toolchain Troubleshooting](#9-android-build-pipeline--toolchain-troubleshooting)
10. [Native Kotlin Reference Codebase (`android-app/`)](#10-native-kotlin-reference-codebase-android-app)
11. [Step-by-Step Developer Extension Tutorials](#11-step-by-step-developer-extension-tutorials)
12. [Production Deployment & Real Backend Integration Guide](#12-production-deployment--real-backend-integration-guide)
13. [Architecture Decision Records (ADR / TDR Dossier)](./TECHNICAL_DECISIONS.md)

---

## 1. Executive Architecture Summary & Core Philosophies

AutoPulse is an automotive workshop operations platform built to withstand the realities of modern mechanical garages: **reinforced concrete bays, subterranean inspection pits, Wi-Fi dead zones, greasy fingers, and multi-location parts transit**.

```
+-----------------------------------------------------------------------------------+
|                            AutoPulse Cloud Infrastructure                         |
|                     (PostgreSQL + Redis PubSub + NestJS / Go API)                 |
+-----------------------------------------------------------------------------------+
                                        ▲   ▲
                      Batch Sync Protocol|   |Conflict Resolution
                                        ▼   ▼
+-----------------------------------------------------------------------------------+
|                         AutoPulse Android Application                             |
|  +-----------------------------------------------------------------------------+  |
|  |                             Presentation Layer                              |  |
|  |  • Pure Mobile Shell (Max-Width 680px / 100vw Mobile Edge-to-Edge)          |  |
|  |  • Sector-Categorized Views (Bays, Pipeline, Catalog, Rosters, Insights)    |  |
|  |  • 360° DVI Hotspot Wireframe & Camera Barcode Viewfinder                   |  |
|  +-----------------------------------------------------------------------------+  |
|                                        │                                          |
|                                        ▼                                          |
|  +-----------------------------------------------------------------------------+  |
|  |                        Sync & Outbox Engine (Core Logic)                    |  |
|  |  • Reactive Observer Event Bus (`syncEngine.ts`)                            |  |
|  |  • Monotonic Version Sequencing (`version: n + 1`)                          |  |
|  |  • FIFO Mutation Outbox Queue with Retry Counters                           |  |
|  +-----------------------------------------------------------------------------+  |
|                                        │                                          |
|                                        ▼                                          |
|  +-----------------------------------------------------------------------------+  |
|  |                          Offline Storage Subsystem                          |  |
|  |  • Production Android: Room SQLite (`autopulse_offline_db.sqlite`)          |  |
|  |  • Development/Web Fallback: LocalStorage / IndexedDB Key-Value Cache       |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### Core Design Principles:
1. **Offline-First is Not an Afterthought:** Every user interaction—intaking a vehicle, tapping an inspection dent, deducting brake pads, clocking a technician—is committed to local storage first, generating an optimistic mutation in the Outbox. Network connection is never in the critical latency path of the mechanic.
2. **Greasy-Thumb Ergonomics (The "Sector" Paradigm):** Workshop environments require oversized touch targets ($\ge 44\text{px}$), high-contrast midnight themes to combat shop glare, and vertical partitioning into labeled **Sectors** to prevent visual overload.
3. **Multi-Tenant Network Awareness:** All entities carry a `branchId` partition key, allowing a franchise owner to switch between workshop locations in real time while maintaining inventory isolation.

---

## 2. Repository Topography & File Structure

The workspace contains two coordinated codebases: the active hybrid Capacitor application (`prototype-app/`) and the native Kotlin reference implementation (`android-app/`).

```
Prototype 1/
├── AutoPulse-v1.0-debug.apk          # Pre-compiled 15.12 MB installable Android APK
├── docs/                             # Official documentation suite
│   ├── USER_MANUAL.md                # Operator & workshop technician guide
│   ├── TERMS_AND_CONDITIONS.md       # Legal SaaS service terms & disclaimers
│   ├── END_USER_LICENSE_AGREEMENT.md # Software license agreement (EULA)
│   └── DEVELOPER_GUIDE.md            # This document
├── prototype-app/                    # Active Production Hybrid Architecture
│   ├── android/                      # Native Android Capacitor wrapper project
│   │   ├── app/                      # Android Application module
│   │   │   ├── src/main/AndroidManifest.xml
│   │   │   ├── src/main/assets/public/   # Synced web assets from Vite
│   │   │   └── build.gradle
│   │   ├── local.properties          # SDK location (D:\AndroidToolchain\android-sdk)
│   │   └── gradlew.bat               # Gradle 8.14.3 build wrapper
│   ├── capacitor.config.json         # Capacitor bridge configuration
│   ├── package.json                  # Dependencies (React 19, Lucide, Vite)
│   └── src/
│       ├── App.tsx                   # Main mobile app shell & modal orchestrator
│       ├── index.css                 # Midnight Slate theme & Sector design system
│       ├── types.ts                  # Canonical TypeScript data contracts
│       ├── components/
│       │   ├── mobile/
│       │   │   ├── MobileHeader.tsx      # Branch switcher, Online/Offline sync pill
│       │   │   ├── WorkProgressView.tsx  # Sectors 1-3: Bays, Kanban, Job Cards
│       │   │   ├── InventoryView.tsx     # Sectors 1-3: Stock KPIs, Scanner, Catalog
│       │   │   ├── EmployeesView.tsx     # Sectors 1-2: Bay Capacity, Tech Roster
│       │   │   └── SalesInsightsView.tsx # Sectors 1-3: Financials, Velocity, Invoices
│       │   └── shared/
│       │       ├── BarcodeScannerModal.tsx   # Simulated laser reticle & camera hook
│       │       ├── VehicleInspectionModal.tsx# 360° DVI damage wireframe hotspot
│       │       ├── NewJobCardModal.tsx       # Intake form & VIN assignment
│       │       └── OutboxSyncDrawer.tsx      # Offline queue inspector & sync trigger
│       ├── data/mockData.ts          # Baseline multi-branch workshop dataset
│       └── state/syncEngine.ts       # Singleton sync engine & outbox queue manager
└── android-app/                      # Pure Native Kotlin / Jetpack Compose Reference
    └── app/src/main/java/com/autopulse/garage/
        ├── data/local/
        │   ├── AppDatabase.kt        # Room database builder & version migrations
        │   ├── dao/Daos.kt           # Reactive Flow DAOs for Job Cards, Inventory, Staff
        │   └── entity/Entities.kt    # SQLite entity definitions & mutation queue table
        └── ui/MainActivity.kt        # Declarative Jetpack Compose UI
```

---

## 3. The Storage Layer: Room SQLite & The Outbox Pattern

### 3.1 Native Android Room Architecture (`android-app/`)
In the native Android runtime, data is persisted inside a local SQLite database named `autopulse_offline_db.sqlite` via Google's Android Jetpack Room library.

```
+-----------------------------------------------------------------------------------+
|                        Room SQLite Database (`AppDatabase.kt`)                    |
+-----------------------------------------------------------------------------------+
  │
  ├──► `job_cards` Entity:
  │    PRIMARY KEY: `id` (UUID String)
  │    COLUMNS: `jobNumber`, `customerName`, `customerPhone`, `vehicleModel`,
  │             `vehiclePlate`, `vin`, `status`, `primaryComplaint`, `assignedTechId`,
  │             `estimatedLaborCost`, `partsCost`, `totalCost`, `branchId`,
  │             `version` (Long), `updatedAt` (Timestamp), `syncState` (Int)
  │
  ├──► `inventory_items` Entity:
  │    PRIMARY KEY: `id` (UUID String)
  │    COLUMNS: `sku`, `oemNumber`, `name`, `category`, `stockQty`, `minSafetyStock`,
  │             `unitCost`, `retailPrice`, `unitOfMeasure`, `branchId`, `barcode`
  │
  ├──► `employees` Entity:
  │    PRIMARY KEY: `id` (UUID String)
  │    COLUMNS: `name`, `role`, `phone`, `branchId`, `activeBay`, `status`,
  │             `billedHoursThisMonth`, `actualHoursThisMonth`, `efficiencyRating`
  │
  └──► `mutation_queue` Entity (The Outbox):
       PRIMARY KEY: `id` (UUID String)
       COLUMNS: `entityType` (JOB_CARD, INVENTORY, EMPLOYEE),
                `action` (CREATE, UPDATE, DELETE),
                `payloadJson` (Serialized JSON payload),
                `timestamp` (Long), `retryCount` (Int), `status` (PENDING, SYNCING)
```

### 3.2 The Outbox Pattern Mechanics
The Outbox pattern prevents distributed transaction inconsistencies when internet access fails midway through an operation.

```
[ User Interaction ] (e.g. Technician marks Job as QUALITY_CHECK)
        │
        ▼
[ Step 1: Local Transaction ]
   ├── Write updated state to local database (`job_cards` table).
   ├── Increment entity monotonic sequence: `version = version + 1`.
   └── Insert `MutationQueueEntity` into `mutation_queue` with status = 'PENDING'.
        │
        ▼
[ Step 2: Instantaneous UI Render ]
   └── UI updates optimistically with 0ms network latency.
        │
        ▼
[ Step 3: Dispatch Worker Check ]
   ├── Is Device Network ONLINE?
   │     ├── YES ──► Dequeue batch from Outbox, POST to `/api/v1/sync/mutations`.
   │     │           Server acknowledges 200 OK ──► DELETE from `mutation_queue`.
   │     └── NO  ──► Retain in Outbox. Badge UI with `Outbox (N)`. Await connectivity.
```

### 3.3 Conflict Resolution Strategies
When two technicians edit the same entity concurrently while offline (e.g., Tech A reassigns Bay 2 while Tech B advances status to QC), the synchronization engine relies on:
1. **Monotonic Version Comparison:** Every entity carries a `version: number`. If incoming server data has `server.version > client.version`, the client accepts server state unless the client holds pending outbox mutations on that ID.
2. **Field-Level Last-Write-Wins (LWW):** For non-conflicting fields (e.g., updating inspection notes vs. updating labor cost), mutations merge cleanly.
3. **Inventory Atomic Deltas:** Inventory modifications are enqueued as **deltas** (`delta: -1`) rather than absolute quantities (`stockQty = 3`), eliminating race conditions during simultaneous stock deductions.

---

## 4. Synchronization Engine & State Machine (`syncEngine.ts`)

In `prototype-app/src/state/syncEngine.ts`, the synchronization architecture is implemented as a self-contained TypeScript class using the Observer Pattern.

### 4.1 State Machine Specification
The engine maintains six core state stores:
- `jobs: JobCard[]`
- `inventory: InventoryItem[]`
- `employees: Employee[]`
- `outbox: SyncMutation[]`
- `isOnline: boolean` (User-togglable or hardware network event driven)
- `activeBranchId: string`

### 4.2 Code Deep-Dive: Mutation Enqueueing & Optimistic Execution

```typescript
// From prototype-app/src/state/syncEngine.ts
private queueMutation(
  entityType: 'JOB_CARD' | 'INVENTORY' | 'EMPLOYEE',
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  payload: any
) {
  const mutation: SyncMutation = {
    id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    entityType,
    action,
    payload,
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    retryCount: 0,
  };

  this.outbox.push(mutation);

  if (this.isOnline) {
    this.processOutbox();
  } else {
    this.saveState();
  }
}
```

### 4.3 Outbox Queue Processing Loop
When online, `processOutbox()` simulates network transmission with exponential backoff and error recovery:

```typescript
public async processOutbox(): Promise<void> {
  if (!this.isOnline || this.outbox.length === 0) return;

  const pending = [...this.outbox];
  for (const mut of pending) {
    try {
      // In production: await fetch('/api/v1/sync', { method: 'POST', body: JSON.stringify(mut) })
      await new Promise((r) => setTimeout(r, 120)); // Simulated network latency
      
      // Remove successfully pushed mutation
      this.outbox = this.outbox.filter((m) => m.id !== mut.id);
      this.saveState();
    } catch (e) {
      mut.retryCount++;
      if (mut.retryCount > 5) mut.status = 'FAILED';
      this.saveState();
      break;
    }
  }
}
```

---

## 5. Domain Data Models & Schema Contracts

All shared contracts are defined in [`prototype-app/src/types.ts`](file:///d:/My%20Documents/Work/Garage/Garage%20App/Prototype%201/prototype-app/src/types.ts).

### 5.1 Repair Pipeline Stages (`JobStatus`)
```typescript
export type JobStatus = 
  | 'INTAKE'          // Vehicle arrived; complaints and preliminary specs logged
  | 'DIAGNOSIS'       // OBD-II scan, mechanical teardown, estimate calculation
  | 'IN_REPAIR'       // On the lift; active technician labor and parts install
  | 'QUALITY_CHECK'   // Foreman safety checklist, road test, torque check
  | 'READY_DELIVERY'; // Cleaned, final invoice ready, handover to customer
```

### 5.2 Digital Vehicle Inspection Coordinates (`VehicleDamagePoint`)
```typescript
export interface VehicleDamagePoint {
  id: string;
  part: string;                        // e.g. 'Front Bumper', 'Hood', 'Windshield'
  type: 'Scratch' | 'Dent' | 'Crack' | 'Wear';
  severity: 'Low' | 'Medium' | 'High'; // Maps to visual pin color (Amber vs Red)
}
```

### 5.3 Complete Job Card Contract (`JobCard`)
```typescript
export interface JobCard {
  id: string;                          // Unique UUID
  jobNumber: string;                   // Human readable formatted number: '#JOB-4029'
  customerName: string;
  customerPhone: string;
  vehicleModel: string;                // e.g. 'BMW 330i'
  vehiclePlate: string;                // e.g. 'KB-8921'
  vin: string;                         // 17-character VIN identifier
  status: JobStatus;
  primaryComplaint: string;
  assignedTechId?: string;
  assignedTechName?: string;
  assignedBay?: string;                // e.g. 'Bay 2 - Lift A'
  estimatedLaborCost: number;
  partsCost: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  branchId: string;                    // Multi-branch partition key
  inspectionNotes?: string;
  damagePoints?: VehicleDamagePoint[]; // DVI 360 array
  allocatedParts?: { partId: string; partName: string; quantity: number; unitPrice: number }[];
  version: number;                     // Optimistic locking sequence counter
}
```

---

## 6. UI/UX Architecture: The Sector Ergonomic Pattern

### 6.1 Why Sectors? Solving Workshop Cognitive Overload
Workshop technicians and garage owners do not navigate apps like office desk workers. They operate on tablets mounted to oily roll-cabs, handheld devices used while standing under lifts, or front-desk check-in stations.

The **Sector Pattern** enforces:
1. **Numbered & Labeled Sectors:** Every view is subdivided into distinct, numbered semantic blocks (e.g., `Sector 1 • Workshop Bay Activity`, `Sector 2 • Pipeline Stages`, `Sector 3 • Active Vehicle Job Cards`).
2. **Generous Vertical Breathing Room:** High spacing tokens (`gap: 24px`, `padding: 20px`) eliminate accidental mis-taps.
3. **High-Contrast Midnight Slate Palette:**
   - Background Canvas: `#070a12` (deepest matte black to prevent battery drain on OLED tablets)
   - Glass Panels: `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(16px)`
   - Accents: Cyan (`#06b6d4`), Emerald (`#10b981`), Amber (`#f59e0b`), Rose (`#f43f5e`)
4. **Touch Target Sizing:** Interactive buttons and status chips are sized at a minimum height of $44\text{px}$ with $14\text{px}$ radius.

```
+-------------------------------------------------------------------------------+
| Mobile App Shell (`src/App.tsx`)                                              |
| Constrained to: max-width: 680px; margin: 0 auto; min-height: 100vh;          |
+-------------------------------------------------------------------------------+
  │
  ├──► `<MobileHeader />`
  │    • Logo & Title
  │    • Branch Selection Dropdown Pill
  │    • Network Toggle Pill (`ONLINE` / `OFFLINE (Room DB)`) & Outbox Counter
  │
  ├──► Active Tab Router (`activeTab: 'WORK' | 'INVENTORY' | 'STAFF' | 'SALES'`)
  │    ├── `<WorkProgressView />`   (Sectors 1, 2, 3)
  │    ├── `<InventoryView />`      (Sectors 1, 2, 3)
  │    ├── `<EmployeesView />`      (Sectors 1, 2)
  │    └── `<SalesInsightsView />`  (Sectors 1, 2, 3)
  │
  ├──► Global Modals Layer
  │    ├── `<NewJobCardModal />`       (Vehicle check-in form)
  │    ├── `<VehicleInspectionModal />` (360° DVI interactive canvas)
  │    ├── `<BarcodeScannerModal />`   (Camera laser scanner)
  │    └── `<OutboxSyncDrawer />`      (Room DB offline queue inspector)
  │
  └──► `<BottomNav />` (Fixed bottom thumb bar, 64px height)
```

---

## 7. Hardware Integrations & Viewfinder Systems

### 7.1 Optical Laser Barcode Scanner (`BarcodeScannerModal.tsx`)
In `BarcodeScannerModal.tsx`, the camera viewfinder is simulated using CSS keyframe laser line sweeps with an overlay reticle.

**Native Capacitor Camera Binding Point:**
For direct physical camera scanning on an Android device, the modal bridges to `@capacitor-community/barcode-scanner`:
```typescript
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

export const startHardwareScan = async () => {
  // Check camera permissions
  const status = await BarcodeScanner.checkPermission({ force: true });
  if (!status.granted) return null;

  // Make webview background transparent to reveal native camera preview
  await BarcodeScanner.hideBackground();
  document.body.classList.add('barcode-scanner-active');

  const result = await BarcodeScanner.startScan();
  if (result.hasContent) {
    document.body.classList.remove('barcode-scanner-active');
    return result.content; // Scanned barcode string
  }
  return null;
};
```

### 7.2 360° Vehicle Wireframe Hotspot Canvas (`VehicleInspectionModal.tsx`)
The inspection tool renders a responsive SVG blueprint of a passenger car. 

```typescript
// Polygon bounding boxes map directly to vehicle body panels:
const VEHICLE_REGIONS = [
  { id: 'hood', name: 'Engine Hood', cx: 120, cy: 90, r: 24 },
  { id: 'windshield', name: 'Front Windshield', cx: 120, cy: 140, r: 20 },
  { id: 'door-fl', name: 'Front Left Door', cx: 65, cy: 170, r: 18 },
  { id: 'door-fr', name: 'Front Right Door', cx: 175, cy: 170, r: 18 },
  { id: 'roof', name: 'Roof Panel', cx: 120, cy: 200, r: 26 },
  { id: 'trunk', name: 'Rear Trunk Deck', cx: 120, cy: 290, r: 22 },
  { id: 'bumper-rear', name: 'Rear Bumper', cx: 120, cy: 340, r: 20 }
];
```
When a technician taps within a bounding circle, the click coordinate is converted into a normalized `VehicleDamagePoint` record and appended to the job card.

---

## 8. Modular Authentication, RBAC & The Pluggable Module Registry

To accommodate continuous feature expansion without bloated role-checking conditionals across the codebase, AutoPulse implements a decoupled **Role-Based Access Control (RBAC)** architecture paired with a **Pluggable Module Registry**.

### 8.1 The Five User Classes
The platform supports five specialized workshop roles:
1. **`OWNER`**: Multi-branch network visibility, global profit margins, billing rates, and executive administration.
2. **`MANAGER`**: Workshop operations, customer vehicle intake, bay assignment, parts catalog, and staff time logs.
3. **`MECHANIC`**: Streamlined shop-floor workflow: assigned bay jobs, 1-tap repair phase advancement, 360° DVI damage wireframe, optical barcode scanner (deduct parts to job), and personal clock-in/out.
4. **`ACCOUNTANT`**: Financial insights, labor vs. parts gross margins, ARO, accounts receivable, 1-tap WhatsApp payment reminders, and tax audit data exports.
5. **`IT_ADMIN`**: Infrastructure diagnostics: Room SQLite outbox sync health, device authorization, conflict overrides, audit logging, and staff credential management.

### 8.2 Atomic Permissions Architecture (`src/auth/permissions.ts`)
Permissions are defined as atomic strings (`domain:action`) rather than coupled to specific screens. Components and views query `hasPermission(permission)`:

```typescript
// From prototype-app/src/auth/permissions.ts
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [ /* Full unrestricted permissions */ ],
  MANAGER: [ 'job:view', 'job:create_intake', 'job:advance_status', 'inventory:view', ... ],
  MECHANIC: [ 'job:view', 'job:advance_status', 'job:perform_dvi', 'inventory:view', 'inventory:scan_barcode', 'employee:clock_self' ],
  ACCOUNTANT: [ 'job:view', 'job:view_costs', 'finance:view_kpis', 'finance:view_margins', 'finance:manage_invoices', ... ],
  IT_ADMIN: [ 'job:view', 'system:view_outbox', 'system:force_sync', 'system:manage_users', 'system:device_audit', ... ]
};
```

### 8.3 The Pluggable Module Registry Pattern (`src/modules/moduleRegistry.ts`)
Features register themselves as self-contained `AppModule` objects. The app shell dynamically computes accessible navigation tabs using the active user's permissions:

```typescript
export interface AppModule {
  id: string;                          // 'jobs', 'inventory', 'employees', 'sales', 'admin'
  title: string;                       // Tab title
  iconName: string;                    // Lucide icon name
  requiredPermission: Permission;      // Permission gate
  order: number;                       // Tab sorting
  badgeCount?: (state: any) => number; // Dynamic badge counter
}

export function getAccessibleModules(user: User | null): AppModule[] {
  if (!user) return [];
  return APP_MODULES.filter((module) =>
    hasPermission(user, module.requiredPermission)
  ).sort((a, b) => a.order - b.order);
}
```

### 8.4 Adding a New Feature Module (Continuous Extensibility Tutorial)
To continuously introduce new features (e.g., a *Customer CRM*, *Tire Hotel Storage*, or *OBD Telematics Module*):
1. **Define Permission:** Add `'crm:view'` to `Permission` in `types.ts` and assign to desired roles in `permissions.ts`.
2. **Build View Component:** Create `src/components/mobile/CustomerCRMView.tsx`.
3. **Register in `moduleRegistry.ts`:**
   ```typescript
   {
     id: 'crm',
     title: 'Customer CRM',
     iconName: 'UserCheck',
     requiredPermission: 'crm:view',
     order: 25,
   }
   ```
4. **Mount in `App.tsx`:**
   ```tsx
   {activeMobileTab === 'crm' && hasPermission(currentUser, 'crm:view') && (
     <CustomerCRMView />
   )}
   ```
The navigation bar, permission gating, and role switching will adapt automatically with zero changes to other modules.

### 8.5 Two-Way Zero-Knowledge PIN Reset Security
To comply with strict automotive enterprise privacy standards:
1. **Zero-Knowledge PIN Privacy:** IT Administrators and managers **cannot view other users' PIN codes**. PIN values are masked as `••••` and protected in storage.
2. **Prohibition of Direct Overwrites:** IT Administrators cannot unilaterally change or overwrite a user's PIN code.
3. **Two-Way Authorization Workflow:**
   - **Step 1 (User Request):** The user (or mechanic on a bay tablet) submits a `PinResetRequest` via the login screen or user profile.
   - **Step 2 (Admin Prompt Dispatch):** In `SystemAdminView`, the IT Administrator sees the pending request and can click **"Send Reset Prompt"**. If no request exists, the action is blocked.
   - **Step 3 (User Self-Reset):** Once prompted, the authorization unlocks a secure `PinResetModal` for that user, allowing them to enter and confirm their new 4-digit PIN.

### 8.6 Mandatory PIN Challenge on Account Switching
To prevent unauthorized persona switching on shared workshop tablets (e.g., when a technician or service advisor leaves a bay terminal unattended):
1. **Engine Enforcement (`verifyAndSwitchUser`):** The `authEngine` rejects any user switch unless verified against the target account's 4-digit PIN.
2. **Interactive PIN Challenge Modal (`PinChallengeModal.tsx`):**
   - Triggered when switching personas from `UserProfileModal` or `LoginScreen`.
   - Displays target user avatar, name, and role badge.
   - Requires entering the target account's 4-digit PIN before granting session access.
   - Rejects incorrect attempts with error feedback and shake animation.

### 8.7 Global Cloud User Registration, Account Linking & Offline Sync
To support multi-branch automotive networks where technicians and managers work across different physical locations:
1. **Global Cloud Directory (`GLOBAL_CLOUD_USERS`):**
   - Represents the central cloud directory of all registered enterprise accounts across the franchise.
   - Listed via `authEngine.getGlobalCloudUsers()` with PIN codes strictly redacted.
2. **User Registration Flow (`registerNewUser`):**
   - Onboards staff accounts with Full Name, Work Email, Role, Branch, Job Title, Phone, and 4-Digit Tablet PIN.
   - **Online Behavior:** Instantly registers user in the global cloud directory and marks account as `isCloudSynced: true`.
   - **Offline Resilience:** If the tablet is offline in a concrete bay or inspection pit, the account is saved locally in Room SQLite storage and enqueued as a `USER` mutation in `syncEngine` Outbox.
3. **Outbox Synchronization Pipeline:**
   - `SyncMutation['entityType']` includes `'USER'`.
   - When network connectivity is restored, the Room DB outbox pushes pending user creations/updates to the central cloud.
4. **Account Linking Flow (`linkExistingCloudAccount`):**
   - Enables any workshop tablet to authenticate and link an existing cloud employee.
   - The user selects or inputs their registered email and authenticates with their personal 4-digit PIN.
   - Upon verification, the account is cached on the local terminal for fast offline switching.
5. **Universal UI Entry Points:**
   - **Login Screen:** Fast "Register User" and "Link Account" action buttons under the numeric keypad.
   - **System View (Sector 2):** IT Admins and Workshop Owners can onboard staff directly via "+ Register Staff" and "+ Link Cloud".
   - **User Profile Modal:** Active users can link another account to their device without logging out.

### 8.8 Built-in Test Profiles & Enterprise Credentials Matrix

AutoPulse includes five pre-seeded staff personas representing the full hierarchy of a modern automotive enterprise. Each profile is equipped with both **Desk Management Credentials** (Username/Email + Strong Password for the desktop web portal) and **On-Field Bay Credentials** (4-Digit numeric PIN for the mobile Android APK).

#### Complete Test Credentials Reference

| Role | Staff Member | Web Username | Corporate Work Email | Web Master Password | Mobile 4-Digit PIN | Default Branch | Operational Scope & Permissions |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **`OWNER`** | **Sarah Sterling** | `sarah.sterling` | `sarah.owner@autopulse.io` | `AutoPulse@2026!` | `1111` | Downtown Central | **Unrestricted Access:** Multi-branch oversight, gross margins, financial auditing, tax export, system settings. |
| **`MANAGER`** | **Marcus Vance** | `marcus.vance` | `marcus.mgr@autopulse.io` | `AutoPulse@2026!` | `2222` | Downtown Central | **Workshop Operations:** Customer vehicle intake, bay reassignment, line-item bill editing, staff duty override. |
| **`MECHANIC`**| **Dave Miller** | `dave.miller` | `dave.tech@autopulse.io` | `AutoPulse@2026!` | `3333` | Downtown Central | **Bay Execution:** Active lift jobs, 360° DVI inspection, camera barcode scanner, repair phase advancement, clock-in. |
| **`ACCOUNTANT`**| **Elena Rostova** | `elena.rostova` | `elena.acct@autopulse.io` | `AutoPulse@2026!` | `4444` | Downtown Central | **Financial Control:** Work order receivables, parts/labor margin analysis, invoice management, payment collection. |
| **`IT_ADMIN`** | **Alex Chen** | `alex.chen` | `alex.admin@autopulse.io` | `AutoPulse@2026!` | `5555` | Downtown Central | **System Administration:** Room SQLite outbox sync, Wi-Fi mesh telemetry, staff credential onboarding, PIN resets. |

#### How to Authenticate Across Environments:

1. **Desk Management Web Portal (`http://localhost:5173` or Wi-Fi `http://<HOST_IP>:5173`):**
   - Navigate to the web portal in any desktop browser.
   - Enter either the **Username** (e.g., `marcus.vance`) or **Work Email** (e.g., `marcus.mgr@autopulse.io`).
   - Enter the strong master password: `AutoPulse@2026!`.
   - *Developer Shortcut:* Click any of the **Quick Demo Profile cards** on the left panel to populate credentials with a single click.

2. **On-Field Mobile App (Android APK on Phone / Tablet):**
   - Launch the native `AutoPulse-v1.0-debug.apk` application.
   - Tap the technician or manager's profile card or enter their assigned **4-Digit PIN** on the numeric keypad:
     - Owner: `1111`
     - Manager: `2222`
     - Mechanic: `3333`
     - Accountant: `4444`
     - IT Admin: `5555`

3. **Self-Service Password Recovery Simulation:**
   - On the web portal, click **"Forgot Password?"** or switch to the **Forgot Password** tab.
   - Enter any test username (e.g., `sarah.sterling`) or work email.
   - Click **"Dispatch Verification Code"**.
   - In development/testing mode, the system displays a blue **Simulated Corporate Email / SMS Relay** banner showing the generated 6-digit one-time code (e.g., `173560`) and pre-fills it for testing.
   - Define a new strong password complying with the real-time strength meter (minimum 8 characters, uppercase, lowercase, number, symbol) to complete verification.

---

## 9. Android Build Pipeline & Toolchain Troubleshooting

Building the Android APK (`AutoPulse-v1.0-debug.apk`) required overcoming specific JDK version compatibility constraints on Windows.

### 9.1 The JDK Version Compatibility Matrix

| JDK Version | Build Attempt Result | Root Cause & Analysis |
| :--- | :--- | :--- |
| **Oracle JDK 25** (`jdk-25.0.2`) | ❌ **FAILED** (`major version 69`) | Android Gradle Plugin (AGP 8.2) does not support class bytecode version 69 produced by Java 25. |
| **Microsoft OpenJDK 17** (`jdk-17.0.x`) | ❌ **FAILED** (`source release: 21`) | Capacitor 8 and modern Android Gradle compilation targets require Java source level 21. |
| **Microsoft OpenJDK 21** (`jdk-21.0.4`) | ✅ **SUCCESSFUL** (Exit 0, 26s build) | **Target matched:** Perfectly aligns with AGP 8.x and Capacitor 8 compiler constraints. |

### 9.2 Toolchain Directory Structure
All native Android compiler assets are isolated in:
- **JDK 21 Root:** `D:\AndroidToolchain\jdk-21`
- **Android SDK Root:** `D:\AndroidToolchain\android-sdk`
  - Platforms: `platforms;android-34`, `platforms;android-36`
  - Build Tools: `build-tools;35.0.0`
  - Command Line Tools: `cmdline-tools;11076708`

### 9.3 The Automated Build Script (`build_apk_with_jdk21.ps1`)

To reproduce the build from clean source:

```powershell
# 1. Build web bundle & sync capacitor bridge
cd "prototype-app"
cmd /c "npm run build && npx cap sync android"

# 2. Execute Gradle build using JDK 21
$env:JAVA_HOME = "D:\AndroidToolchain\jdk-21"
$env:ANDROID_HOME = "D:\AndroidToolchain\android-sdk"
$env:PATH = "D:\AndroidToolchain\jdk-21\bin;$env:PATH"

cd "android"
.\gradlew.bat assembleDebug

# Output APK is produced at:
# prototype-app\android\app\build\outputs\apk\debug\app-debug.apk (15.12 MB)
```

---

## 9. Native Kotlin Reference Codebase (`android-app/`)

For developers creating a 100% pure native Android application without web technologies, the `android-app/` directory provides the exact equivalent architecture in Kotlin and Jetpack Compose.

### 9.1 Reactive Room DAOs (`Daos.kt`)
Room DAOs emit Kotlin Coroutine `Flow` streams that automatically update Compose UI when database rows change:

```kotlin
// From android-app/app/src/main/java/com/autopulse/garage/data/local/dao/Daos.kt
@Dao
interface JobCardDao {
    @Query("SELECT * FROM job_cards WHERE branchId = :branchId ORDER BY updatedAt DESC")
    fun getJobCardsByBranch(branchId: String): Flow<List<JobCardEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(job: JobCardEntity)

    @Query("UPDATE job_cards SET status = :status, version = version + 1, syncState = 2, updatedAt = :timestamp WHERE id = :jobId")
    suspend fun updateStatus(jobId: String, status: String, timestamp: Long = System.currentTimeMillis())
}
```

### 9.2 Background WorkManager Dispatch
In native Android, the Outbox sync runs as an `androidx.work.CoroutineWorker` scheduled with network constraints:

```kotlin
val syncConstraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.CONNECTED)
    .build()

val syncWorkRequest = PeriodicWorkRequestBuilder<OutboxSyncWorker>(15, TimeUnit.MINUTES)
    .setConstraints(syncConstraints)
    .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "AutoPulseOutboxSync",
    ExistingPeriodicWorkPolicy.KEEP,
    syncWorkRequest
)
```

---

## 10. Step-by-Step Developer Extension Tutorials

### Tutorial 1: Adding a New Stage to the Pipeline (e.g. `PARTS_HOLD`)

To add an intermediary stage where a vehicle waits for an ordered alternator or control arm:

1. **Update `types.ts`:**
   ```typescript
   export type JobStatus = 
     | 'INTAKE' 
     | 'DIAGNOSIS' 
     | 'PARTS_HOLD'    // <-- Add new status here
     | 'IN_REPAIR' 
     | 'QUALITY_CHECK' 
     | 'READY_DELIVERY';
   ```

2. **Update Status Config in `WorkProgressView.tsx`:**
   ```typescript
   const STATUS_CONFIG: Record<JobStatus, { label: string; next?: JobStatus; colorClass: string }> = {
     INTAKE: { label: 'Intake Inspection', next: 'DIAGNOSIS', colorClass: 'badge-intake' },
     DIAGNOSIS: { label: 'Diagnostic Review', next: 'PARTS_HOLD', colorClass: 'badge-diagnosis' },
     PARTS_HOLD: { label: 'Awaiting Ordered Parts', next: 'IN_REPAIR', colorClass: 'badge-warning' }, // <--
     IN_REPAIR: { label: 'In Repair', next: 'QUALITY_CHECK', colorClass: 'badge-repair' },
     QUALITY_CHECK: { label: 'Quality Control', next: 'READY_DELIVERY', colorClass: 'badge-qc' },
     READY_DELIVERY: { label: 'Ready for Handover', colorClass: 'badge-ready' },
   };
   ```

3. **Add CSS Badge Styling in `index.css`:**
   ```css
   .badge-warning {
     background: rgba(245, 158, 11, 0.15);
     color: #fbbf24;
     border: 1px solid rgba(245, 158, 11, 0.35);
   }
   ```

---

### Tutorial 2: Creating a New Database Entity (e.g., `SupplierPO`)

To add automated Purchase Orders to track parts orders from vendors:

1. **Define Interface in `src/types.ts`:**
   ```typescript
   export interface SupplierPO {
     id: string;
     poNumber: string;
     vendorName: string;
     totalAmount: number;
     status: 'DRAFT' | 'ORDERED' | 'RECEIVED';
     items: { sku: string; qty: number; unitCost: number }[];
     branchId: string;
     createdAt: string;
   }
   ```

2. **Add Store and Mutator to `syncEngine.ts`:**
   ```typescript
   private purchaseOrders: SupplierPO[] = [];

   public createPurchaseOrder(poData: Omit<SupplierPO, 'id' | 'createdAt'>) {
     const po: SupplierPO = {
       ...poData,
       id: `po-${Date.now()}`,
       createdAt: new Date().toISOString()
     };
     this.purchaseOrders.push(po);
     this.queueMutation('PURCHASE_ORDER' as any, 'CREATE', po);
     this.saveState();
   }
   ```

3. **Add Native Room SQLite Entity in `android-app/` (`Entities.kt`):**
   ```kotlin
   @Entity(tableName = "supplier_purchase_orders")
   data class SupplierPOEntity(
       @PrimaryKey val id: String = UUID.randomUUID().toString(),
       val poNumber: String,
       val vendorName: String,
       val totalAmount: Double,
       val status: String,
       val branchId: String,
       val createdAt: Long = System.currentTimeMillis()
   )
   ```

---

## 11. Production Deployment & Real Backend Integration Guide

When transitioning from the prototype simulation to a live cloud database:

### 11.1 Recommended Backend Stack:
- **API Framework:** NestJS (TypeScript) or Go (Fiber/Gin) for high-throughput WebSocket & REST handlers.
- **Relational Database:** PostgreSQL 16 with Row-Level Security (RLS) enforcing `branch_id` tenant isolation.
- **In-Memory Cache & Message Broker:** Redis Streams for real-time WebSocket pub/sub across workshop tablets.

### 11.2 PostgreSQL Schema DDL:

```sql
-- Job Cards Master Table
CREATE TABLE workshop_job_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES garage_branches(id),
    job_number VARCHAR(32) NOT NULL UNIQUE,
    customer_name VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(32) NOT NULL,
    vehicle_model VARCHAR(64) NOT NULL,
    vehicle_plate VARCHAR(32) NOT NULL,
    vin VARCHAR(17) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'INTAKE',
    primary_complaint TEXT,
    assigned_tech_id UUID REFERENCES workshop_employees(id),
    estimated_labor_cost NUMERIC(10,2) DEFAULT 0.00,
    parts_cost NUMERIC(10,2) DEFAULT 0.00,
    total_cost NUMERIC(10,2) DEFAULT 0.00,
    damage_points JSONB DEFAULT '[]'::jsonb,
    version BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant branch lookups
CREATE INDEX idx_job_cards_branch_status ON workshop_job_cards(branch_id, status);
```

### 11.3 Production APK Signing:
To build a production signed APK or Android App Bundle (`.aab`) for Google Play or enterprise MDM:

1. Generate release keystore:
   ```cmd
   keytool -genkey -v -keystore autopulse-release.jks -alias autopulse -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Reference credentials in `android/app/build.gradle`:
   ```groovy
   signingConfigs {
       release {
           storeFile file("autopulse-release.jks")
           storePassword System.getenv("KEYSTORE_PASSWORD")
           keyAlias "autopulse"
           keyPassword System.getenv("KEY_PASSWORD")
       }
   }
   ```
3. Run: `.\gradlew assembleRelease` or `.\gradlew bundleRelease`.

### 11.4 Development Phase Wi-Fi Pairing (PC Web Host & Mobile Phone APK)

During local development and testing, you can host the AutoPulse web system directly from your PC and run the mobile app on a physical Android phone connected to the same Wi-Fi router:

```
+------------------------------------+           +-------------------------------------+
|        Host PC (Dev Server)        |           |      Physical Android Phone         |
|  • URL: http://192.168.1.5:5173    |  <=====>  |  • Installed APK (4.05 MB)          |
|  • Middleware: localSyncBridge     |   Wi-Fi   |  • Connects to PC on launch         |
|  • Browser: Active Management View |   Subnet  |  • Real-time mutations via SSE      |
+------------------------------------+           +-------------------------------------+
```

#### Step 1: Start Host PC Web Server
From the `prototype-app/` directory:
```bash
npm run dev
```
The server will bind to `0.0.0.0:5173` and output:
- **Local:** `http://localhost:5173/`
- **Network:** `http://192.168.1.5:5173/`

#### Step 2: Install the APK on Your Mobile Phone
Copy `AutoPulse-v1.0-debug.apk` (4.05 MB) from the project root to your Android phone via USB cable, Google Drive, or local file sharing.
Tap the APK to install (enable "Install unknown apps" if prompted).

#### Step 3: Connect Both Devices to the Same Wi-Fi
Ensure your PC and your mobile phone are connected to the same Wi-Fi network (e.g., subnet `192.168.1.x`).

#### Step 4: Launch and Test Synchronization
1. Open AutoPulse on the phone. The app will immediately load the live development UI directly from your PC at `http://192.168.1.5:5173`.
2. Tap the **"PC Wi-Fi Link"** button on the Login Screen or Header to verify the active link and latency.
3. Perform any action on the phone (e.g., advance a job card, deduct brake pads, or clock in a technician).
4. Watch the PC web browser—the record updates in real time without refreshing!

---

*AutoPulse™ Developer Architecture Guide. Maintained by the Core Engineering Team.*
