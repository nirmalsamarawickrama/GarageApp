# AutoPulse Garage Management System (Prototype 2) — Developer Guide

**Version**: 2.0.0 (`autopulse-prototype-2`)  
**Target Surfaces**: Web Operations Console (`>= 1024px`) & Bay Terminal (`< 1024px` Web / Capacitor 8 Android)  
**Theme Architecture**: Tactile Hardware / Industrial Garage (`src/theme.css`)  

---

## 1. Executive Architecture Summary

AutoPulse Prototype 2 is an offline-first, multi-branch automotive workshop operating system built as a unified **React 19 + TypeScript 6 + Vite 8 + Capacitor 8** codebase. It enables desktop managers, service advisors, accountants, IT administrators, and shop-floor bay technicians to collaborate across shared terminals or peer LAN browsers/tablets.

### Key Architectural Highlights in Prototype 2
- **Flat Workspace Layout**: All configuration (`package.json`, `vite.config.ts`, `capacitor.config.json`, `index.html`) and source code (`src/`) live directly at the root of `Prototype 2/`, with documentation in `docs/`.
- **Tactile Hardware / Industrial Design System**: Complete styling in `src/theme.css` and `src/index.css` using OKLCH color tokens (warm charcoal `#191816`, gunmetal `#252320` / `#312E2A`, Hydraulic Safety Orange `#FF6B2B`, Pit-Lane Green `#26C96E`, Caution Yellow `#E6D617`), stamped `.sg-plate` badges, `.sg-hazard-strip` workshop accents, hardware `.sg-led` indicators, responsive `.sg-dvi-layout` inspection grids, and 5-stage `.sg-stage-track` bay progress steppers.
- **Responsive Dual-Surface & Multi-Branch Enforcement**: `src/App.tsx` tracks `viewportWidth >= 1024`, checks `Capacitor.isNativePlatform()`, exposes a `surfaceOverride` (`'auto' | 'desktop' | 'mobile'`) switcher, enforces branch scoping (`effectiveBranchId`) across `branch-1`, `branch-2`, and `branch-3`, and gates every view and action with `hasPermission()`.
- **Hardened LAN Sync Bridge & Auth Engine**: `vite.config.ts` filters virtual network interfaces in `resolveLocalIpv4()`, mounts `localSyncBridge()` on both `dev` (`:5173`) and `preview` (`:4173`) servers, prunes dead SSE clients, validates OTP recovery & 6-digit IT PIN dispatch codes in `authEngine.ts`, and redacts `pinCode` and `password` (`undefined`) for inactive operators in `getAvailableUsers()` and all records in `getGlobalCloudUsers()`.

---

## 2. Repository & File System Topography

```text
Prototype 2/
├── index.html                        # Font preconnects (Barlow Condensed, DM Sans, JetBrains Mono) + PWA manifest
├── package.json                      # Dependencies & scripts (dev, build, lint, preview)
├── capacitor.config.json             # appId: com.autopulse.garage.v2, webDir: dist, cleartext LAN sync enabled
├── vite.config.ts                    # localSyncBridge() SSE/REST middleware (dev & preview) + LAN IPv4 resolution
├── public/
│   ├── favicon.svg                   # Garage badge SVG icon
│   └── manifest.json                 # Standalone PWA metadata (#191816 / #FF6B2B)
├── docs/
│   ├── DEVELOPER_GUIDE.md            # Engineering & integration handbook (this document)
│   ├── TECHNICAL_DECISIONS.md        # Architecture Decision Records (ADR-001 through ADR-018)
│   ├── USER_MANUAL.md                # Operator & technician manual
│   ├── END_USER_LICENSE_AGREEMENT.md # Software license agreement
│   └── TERMS_AND_CONDITIONS.md       # SaaS service terms
└── src/
    ├── main.tsx                      # React 19 entry point
    ├── App.tsx                       # Dual-surface coordinator, branch scoping, RBAC guards & global modals
    ├── theme.css                     # Tactile Hardware OKLCH design tokens & keyframes
    ├── index.css                     # Core geometry, bay grids, plates, LEDs, stage steppers, DVI & print CSS
    ├── types.ts                      # Canonical TypeScript interfaces (JobCard, InventoryItem, SyncMutation, User, AuditLogEntry)
    ├── data/
    │   └── mockData.ts               # WORKSHOP_BAYS + seed data (3 branches, 7 staff w/ userId links, 8 SKUs, 6 job cards)
    ├── state/
    │   └── syncEngine.ts             # Offline-first optimistic state manager, atomic transfers, audit logs & SSE client
    ├── auth/
    │   ├── authEngine.ts             # Multi-user auth, 30d workstation persistence, OTP recovery, 6-digit PIN reset
    │   └── permissions.ts            # 5 roles x 25 atomic permissions + ROLE_METADATA badge themes
    ├── modules/
    │   └── moduleRegistry.ts         # Dynamic mobile navigation module loader & branch-scoped badge counters
    └── components/
        ├── auth/
        │   ├── LoginScreen.tsx       # Bay Terminal sign-in (PIN keypad w/ keyboard input, credentials, reset banners)
        │   ├── PinChallengeModal.tsx # Fast 4-digit bay PIN verification + keyboard entry + Request IT PIN Reset
        │   ├── PinResetModal.tsx     # Two-way PIN reset w/ 6-digit IT dispatch code or account password check
        │   ├── RegisterUserModal.tsx # Unmount-clean technician registration & existing cloud profile linking
        │   └── UserProfileModal.tsx  # Active operator details, PIN reveal, self-locked reset & quick account switch
        ├── desktop/
        │   ├── DesktopAuthScreen.tsx        # Desktop login (w/ 30d Remember Workstation), registration & OTP reset
        │   ├── DesktopDashboardLayout.tsx   # RBAC-gated sidebar shell, branch lock/switcher & shared modals
        │   ├── DesktopAnalyticsView.tsx     # Live branch KPIs, dynamic bay utilization, 7D/30D/YTD chart & network table
        │   ├── DesktopKanbanView.tsx        # 5-column RBAC-gated Kanban pipeline w/ plate & VIN search
        │   ├── DesktopInventoryView.tsx     # Parts ledger, dynamic markup calc, scanner & validated branch transfers
        │   ├── DesktopStaffView.tsx         # 6-bay lift floorplan (OCCUPIED/STANDBY/VACANT) & RBAC-gated roster
        │   ├── DesktopEmployeeEditModal.tsx # Inline modal for role, phone, canonical bay assignment & efficiency stats
        │   ├── DesktopBillingView.tsx       # Tax-inclusive billing ledger, status filters & RBAC-gated settlement
        │   └── DesktopBillEditModal.tsx     # Bidirectional labor rate/hrs, fractional parts & A4 #invoice-print-sheet
        ├── mobile/
        │   ├── MobileHeader.tsx      # Bay Terminal top bar (RBAC branch lock, sync LED, outbox, Desktop switch)
        │   ├── MobileBottomNav.tsx   # Dynamic permission-gated bottom tab dock
        │   ├── WorkProgressView.tsx  # Sector cards with 5-stage stepper, VIN search & RBAC-gated DVI/advance
        │   ├── InventoryView.tsx     # Branch parts catalog (all 6 categories + barcode search), scanner & transfers
        │   ├── EmployeesView.tsx     # Crew clock in/out (self-only vs roster-wide RBAC) & efficiency cards
        │   ├── SalesInsightsView.tsx # Live branch revenue, ARO, labor/parts split & uncollected job invoices
        │   └── SystemAdminView.tsx   # Offline-safe outbox flush, live audit trail, IT PIN dispatch codes & demo reset
        └── shared/
            ├── AvatarBadge.tsx            # Resilient operator initials badge with src-reactive error state
            ├── NewJobCardModal.tsx        # Branch-scoped intake form with WORKSHOP_BAYS & tax-inclusive total calc
            ├── VehicleInspectionModal.tsx # Responsive OBD-II 360° chassis blueprint & 10-zone defect tagging
            ├── BarcodeScannerModal.tsx    # Laser viewfinder simulation, RBAC action modes & timer-safe scan lock
            ├── OutboxSyncDrawer.tsx       # Slide-out offline queue inspector w/ credential redaction & flush lock
            └── WifiDevSyncModal.tsx       # LAN dev host connectivity tester & validated server URL saver
```

---

## 3. Persistence, Storage Partitioning & `SyncEngine` State Machine

### 3.1 `autopulse_v2_*` Storage Namespace
Every persistent key in Prototype 2 uses the `autopulse_v2_` prefix to isolate it from Prototype 1:

| Domain | Storage Location & Key(s) | Engine Owner |
| :--- | :--- | :--- |
| **Job Cards** | `localStorage`: `autopulse_v2_jobs` | `src/state/syncEngine.ts` |
| **Parts Inventory** | `localStorage`: `autopulse_v2_inventory` | `src/state/syncEngine.ts` |
| **Technicians & Bays** | `localStorage`: `autopulse_v2_employees` | `src/state/syncEngine.ts` |
| **Offline Outbox Queue** | `localStorage`: `autopulse_v2_outbox` | `src/state/syncEngine.ts` |
| **Live Audit Logs** | `localStorage`: `autopulse_v2_audit_logs` | `src/state/syncEngine.ts` |
| **Network Mode / Branch / LAN URL** | `localStorage`: `autopulse_v2_online`, `autopulse_v2_branch`, `autopulse_v2_server_url` | `src/state/syncEngine.ts` |
| **Active Tab Session** | `sessionStorage`: `autopulse_v2_current_user_session` | `src/auth/authEngine.ts` |
| **Remembered 30d Workstation** | `localStorage`: `autopulse_v2_remembered_session` | `src/auth/authEngine.ts` |
| **User Directories** | `localStorage`: `autopulse_v2_cached_users`, `autopulse_v2_global_cloud_users` | `src/auth/authEngine.ts` |
| **PIN & Password Resets** | `localStorage`: `autopulse_v2_pin_reset_requests`, `autopulse_v2_password_resets` | `src/auth/authEngine.ts` |

### 3.2 Optimistic Mutations, Atomic Transfers & Outbox Pattern
`SyncEngine` (`src/state/syncEngine.ts`) exposes domain mutations that immediately update in-memory arrays, persist to `localStorage`, record live `AuditLogEntry` events (`recordAuditEvent()`), and either broadcast immediately (when `isOnline === true`) or append a `SyncMutation` (`id`, `entityType`, `action`, `payload`, `timestamp`, `status`, `retryCount`) to the outbox:

* **Job Cards**: `createJobCard()` (updates assigned tech's status/bay), `advanceJobStatus()` (releases assigned tech & increments `completedJobsCount` on `'READY_DELIVERY'`), `updateJobCardBilling()`, `saveInspectionPoints()`.
* **Inventory & Branches**: `updateInventoryStock()`, `transferStock()` (validates `qty > 0`, sufficient stock, and `sourceBranchId !== targetBranchId`; deducts from source SKU and increments or provisions the matching SKU at `targetBranchId`; replicates via `INTER_BRANCH_TRANSFER`).
* **Employees**: `toggleEmployeeClock()` (assigns branch-scoped active jobs instead of hardcoded fallbacks and recalculates `efficiencyRating` on clock-out), `updateEmployee()`.
* **Cross-Engine User Sync**: `queueUserMutation()` broadcasts complete user payloads for `'CREATE'` and `'UPDATE'` and dispatches `autopulse:user_mutation` DOM events so registered users, password resets, and PIN resets propagate across connected peers.
* **Outbox Flush & SSE Control**: `setOnlineStatus(false)` closes `EventSource` so offline devices stop applying live LAN updates; `processOutbox()` refuses offline execution, deduplicates overlapping flushes (`getIsFlushing()`), marks failed relay attempts as `'FAILED'` (`retryCount + 1`), and filters out only confirmed-synced IDs so mid-flush offline mutations are preserved.

### 3.3 Vite `localSyncBridge()` SSE Relay (`vite.config.ts`)
Mounted on both `configureServer` (`npm run dev`, default port `5173`) and `configurePreviewServer` (`npm run preview`, default port `4173`):
- **Dynamic Host IPv4 Resolution**: `resolveLocalIpv4()` skips virtual/VPN interfaces (`vEthernet`, `WSL`, `VirtualBox`, `VMware`, `Docker`, `Hyper-V`, `Loopback`, `Tailscale`, `ZeroTier`) and prefers physical `192.168.*` and `10.*` LAN subnets (fallback `127.0.0.1`).
- **Endpoints**:
  - `GET /api/sync/events`: Upgrades response to `text/event-stream`, sends `{ type: 'CONNECTED', serverIp, port }` using the dynamically bound server port, and tracks active `ServerResponse` clients.
  - `GET /api/sync/status`: Returns JSON `{ status: 'ONLINE', serverIp, port, activeClients, timestamp }`.
  - `POST /api/sync/mutation`: Enforces a `2 MB` body cap and broadcasts `{ type: 'MUTATION', mutation, sender: x-client-id }` to live SSE subscribers while pruning closed sockets.
  - `GET | POST /api/sync/state`: Stores/returns optional full state snapshots and broadcasts `STATE_REFRESH` events (handled by `syncEngine.applyRemoteSnapshot()`).
- **Event-Loop Hygiene**: The `20000ms` `: heartbeat\n\n` interval is scoped inside `attachBridge()`, marked `.unref()`, and cleared alongside `sseClients` on `httpServer?.on('close', ...)`.

---

## 4. Core Domain Data Contracts (`src/types.ts`)

```typescript
export type JobStatus =
  | 'INTAKE'
  | 'DIAGNOSIS'
  | 'IN_REPAIR'
  | 'QUALITY_CHECK'
  | 'READY_DELIVERY';

export interface VehicleDamagePoint {
  id: string;
  part: string;
  type: 'Scratch' | 'Dent' | 'Crack' | 'Wear';
  severity: 'Low' | 'Medium' | 'High';
  notes?: string;
}

export interface JobCard {
  id: string;
  jobNumber: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  vin: string;
  status: JobStatus;
  primaryComplaint: string;
  assignedTechId?: string;
  assignedTechName?: string;
  assignedBay?: string;
  estimatedLaborCost: number;
  partsCost: number;
  totalCost: number; // Tax-inclusive: max(0, labor + parts - discount) + taxAmount
  createdAt: string;
  updatedAt: string;
  branchId: string;
  inspectionNotes?: string;
  damagePoints?: VehicleDamagePoint[];
  allocatedParts?: AllocatedPartLine[];
  billingStatus?: 'PENDING' | 'INVOICED' | 'PAID' | 'PARTIAL';
  paidAmount?: number;
  invoiceNumber?: string;
  paymentMethod?: 'Card' | 'Cash' | 'Fleet Account' | 'Bank Transfer';
  taxAmount?: number;
  discountAmount?: number;
  version: number;
}
```

Additional key contracts in `src/types.ts`:
- `Employee.userId?: string` — links workshop roster entries to `User` accounts for self-service `employee:clock_self` enforcement.
- `PinResetRequest.verificationCode?: string` — holds the 6-digit IT dispatch code generated by `sendResetPrompt()`.
- `AuditLogEntry` — represents live security and synchronization events (`OK | SECURITY | SYNC | WARN`).

### Seeded Branch Topology (`src/data/mockData.ts`)
- **`branch-1`**: `Apex Downtown Service Hub` (`Downtown Metro`, 8 bays)
- **`branch-2`**: `Apex West Airport Express` (`Westside Logistics`, 6 bays)
- **`branch-3`**: `Apex North Bay Heavy Depot` (`North Industrial Area`, 10 bays)
- **`WORKSHOP_BAYS`**: Canonical 7-station array (`Bay 1 (2-Post Lift)` through `Bay 6 (Inspection & DVI Pit)` plus `Paint & Detailing Booth`) shared across floorplans, intake forms, and employee editing.

---

## 5. Tactile Hardware / Industrial Garage Design System

All colors are defined as calibrated **OKLCH tokens** inside `src/theme.css`:

| Semantic Token | OKLCH / Value | Industrial Surface / Role |
| :--- | :--- | :--- |
| `--bg-canvas` | `oklch(0.165 0.006 70)` (`#191816`) | Oiled shop-floor charcoal canvas |
| `--bg-surface` | `oklch(0.215 0.007 70)` (`#252320`) | Matte gunmetal tool-chest panels |
| `--bg-elevated` | `oklch(0.265 0.008 70)` (`#312E2A`) | Brushed dark steel cards & interactive headers |
| `--bg-recessed` | `oklch(0.135 0.005 70)` (`#141311`) | Recessed diagnostic monitors & form inputs |
| `--text-primary` | `oklch(0.945 0.007 82)` (`#F1EFEA`) | Shop-light warm chalk |
| `--accent-primary` | `oklch(0.70 0.19 42)` (`#FF6B2B`) | Hydraulic Safety Orange CTA & active pipeline |
| `--accent-secondary` | `oklch(0.74 0.16 148)` | Pit-Lane Torque Green (Ready / Paid / Clocked In) |
| `--accent-volt` | `oklch(0.85 0.17 95)` | Caution Diagnostic Yellow (Focus outlines & Alerts) |
| `--accent-amber` | `oklch(0.79 0.16 78)` | Check-Engine Amber (Diagnosis / Partial / Low Stock) |
| `--accent-danger` | `oklch(0.68 0.19 25)` | Redline Fault Red (High severity / Offline / Critical) |
| `--accent-violet` | `oklch(0.76 0.02 220)` | Brushed Chrome Alloy (QC / Audit indicators) |

### Reusable CSS Primitives (`src/index.css`)
- **`.sg-hazard-strip`**: `5px` repeating `-45deg` safety stripe (`--accent-primary` & `--bg-recessed`) marking workspace headers.
- **`.sg-plate`**: Stamped aluminum registration plate (`--plate-bg`, `--plate-ink`, `JetBrains Mono`, heavy border).
- **`.sg-led` / `.sg-led-live` / `.sg-led-warn` / `.sg-led-fault`**: Physical pilot indicator dots with `prefers-reduced-motion` safeguards.
- **`.sg-stage-track` & `.sg-stage-pip`**: Horizontal 5-stage bay stepper (`INTAKE`, `DIAGNOSIS`, `IN_REPAIR`, `QUALITY_CHECK`, `READY_DELIVERY`).
- **`.sg-segmented` & `.sg-segmented-thumb`**: Anodized pill toggle control for auth modes, scanner actions, pipeline filters, and chart timeframes.
- **`.sg-dvi-layout`**: Responsive 2-column inspection grid (`auto 1fr`) that collapses cleanly to 1 column below `640px`.
- **`@media print`**: Uses `body:has(#invoice-print-sheet)` and `position: static` to hide non-invoice DOM nodes, strip modal overflow constraints, and print single- or multi-page `#invoice-print-sheet` invoices cleanly.

---

## 6. Hardware Modules: 360° Chassis DVI & Optical Barcode Scanner

### 6.1 Digital Vehicle Inspection (`src/components/shared/VehicleInspectionModal.tsx`)
Uses a dark OBD-II chassis blueprint with percentage coordinates (`x`, `y`) mapped to **10 vehicle zones**:
`Front Bumper`, `Hood`, `Windshield`, `Roof`, `Driver Front Door`, `Passenger Front Door`, `Driver Rear Door`, `Passenger Rear Door`, `Trunk / Tailgate`, and `Rear Bumper`.  
Inspectors pick a defect category (`Scratch | Dent | Crack | Wear`), severity (`Low | Medium | High`), optional inspection note (`notes`), and save directly onto `JobCard.damagePoints`.

### 6.2 Optical Barcode Scanner (`src/components/shared/BarcodeScannerModal.tsx`)
Displays a simulated live viewfinder reticle with a permission-gated sliding action selector (`DEDUCT` `-1 Deduct to Job`, `RESTOCK` `+5 Restock` when holding `inventory:adjust_stock`, and `INSPECT` `Lookup SKU`) and filters all branch inventory items live by `name`, `sku`, `barcode`, and `oemNumber`, locking controls during the 900ms confirmation flash and cancelling timers cleanly on close.

---

## 7. Authentication, RBAC & Demo Operator Matrix

### 7.1 Role Permissions (`src/auth/permissions.ts`)
Five operational roles (`OWNER`, `MANAGER`, `MECHANIC`, `ACCOUNTANT`, `IT_ADMIN`) govern **25 granular permissions** across Job (`job:*`), Inventory (`inventory:*`), Employee (`employee:*`), Finance (`finance:*`), and System (`system:*`) namespaces—enforced uniformly across both Desktop and Mobile surfaces.

### 7.2 Seeded Accounts (`src/auth/authEngine.ts`)

> All seeded accounts share the test password **`AutoPulse@2026!`** (meets Strong validation rules: 8+ chars, uppercase, lowercase, digit, special character). `getAvailableUsers()` sets `pinCode` and `password` to `undefined` for all non-active operators, and `getGlobalCloudUsers()` strips both `pinCode` and `password` (`undefined`) for every entry.

| Operator | Username | Email | Role | PIN | Primary Workspace Focus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sarah Sterling** | `sarah.sterling` | `sarah.owner@autopulse.io` | `OWNER` | `1111` | Multi-branch oversight, all financial KPIs & admin |
| **Marcus Vance** | `marcus.vance` | `marcus.mgr@autopulse.io` | `MANAGER` | `2222` | Single-branch intake, Kanban, bay assignments & transfers |
| **Dave Miller** | `dave.miller` | `dave.tech@autopulse.io` | `MECHANIC` | `3333` | Bay Terminal focus (jobs, DVI, scanner, self clock in/out) |
| **Elena Rostova** | `elena.rostova` | `elena.acct@autopulse.io` | `ACCOUNTANT` | `4444` | Tax invoicing, cost margins & multi-branch billing |
| **Alex Chen** | `alex.chen` | `alex.admin@autopulse.io` | `IT_ADMIN` | `5555` | Outbox replay, offline simulator, PIN dispatch codes & audit |

---

## 8. Development, Verification & Capacitor Packaging

### 8.1 Daily Development Commands
Run all commands from the project root (`d:\My Documents\Work\Garage\Garage App\Prototype 2`):

```bash
# 1. Install dependencies
npm install

# 2. Start Vite Dev Server + LAN Sync Relay (binds to 0.0.0.0:5173)
npm run dev

# 3. Run static analysis (Oxlint zero-warning check)
npm run lint

# 4. Type-check (tsc -b) and produce dist/ production bundle
npm run build

# 5. Preview production dist/ bundle with localSyncBridge() (port 4173)
npm run preview
```

> **Windows PowerShell Note**: If PowerShell script execution policy blocks `npm.ps1`, invoke `npm.cmd run dev`, `npm.cmd run lint`, and `npm.cmd run build` (or run through `cmd /c`).

### 8.2 Capacitor Android Setup (Optional Native Packaging)
`capacitor.config.json` is preconfigured with `appId: "com.autopulse.garage.v2"`, `appName: "AutoPulse SpecGrid"`, `webDir: "dist"`, and `server: { "cleartext": true }` (with no hardcoded `server.url`, so Android builds load offline from `dist/` and connect dynamically to any LAN PC IP entered in `WifiDevSyncModal`). Because no `android/` native directory is checked into Prototype 2 yet, initialize and sync Android Studio cleanly whenever targeting hardware tablets:

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

---

## 9. Extending Prototype 2

1. **Adding a New Bay Terminal Tab**:
   - Extend `MobileTab` in `src/types.ts` and register the entry with an explicit `requiredPermission` in `src/modules/moduleRegistry.ts`.
   - Render the view inside `src/App.tsx`'s Bay Terminal switch block and pass granular permission flags for inner controls.
2. **Connecting Production REST / PostgreSQL APIs**:
   - Replace `localStorage` initialization and `/api/sync/mutation` dispatch inside `src/state/syncEngine.ts` with authenticated `fetch()` calls while preserving the `SyncMutation` queue so offline writes continue queuing safely during cellular/WLAN drops.
   - Replace client-side demo credential checks in `src/auth/authEngine.ts` with JWT / OAuth2 token issuance and server-verified bcrypt/Argon2 password & PIN hashing.
