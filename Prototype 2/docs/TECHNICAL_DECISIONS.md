# AutoPulse Garage Management System (Prototype 2) — Technical Architecture & Decision Records

**Document ID**: `DOC-TDR-2026-V2`  
**System**: AutoPulse // Garage Bay OS (`com.autopulse.garage.v2`)  
**Prototype Version**: 2.0.0 (`autopulse-prototype-2`)  
**Date**: November 2026  

---

## 1. Architectural Overview & Core Design Principles

**AutoPulse Prototype 2** evolves the multi-branch garage management architecture into an automotive bay-grade dual-surface web and hybrid-native application. It delivers work-order progression, 360° interactive chassis damage inspection, branch-isolated parts inventory with optical scanner support, technician time tracking, tax-inclusive invoicing/profitability telemetry, two-way verified IT PIN-reset moderation, and offline outbox synchronization—built around three structural pillars:

1. **Zero-Inheritance Visual Architecture**: Complete replacement of Prototype 1's slate/cyan glassmorphism stylesheet with a bespoke **Tactile Hardware / Industrial Garage** design system built on calibrated OKLCH color tokens, anodized gunmetal panels, hydraulic safety orange indicators, stamped registration plates, and bay telemetry controls.
2. **Responsive Dual-Surface Adaptability**: Intelligent switching between the **Desktop Command Console** (`>= 1024px` web viewports) and the **Bay Terminal** (`< 1024px` mobile web viewports or `Capacitor.isNativePlatform()` Android tablets), backed by a manual surface toggle and unified RBAC enforcement across both surfaces.
3. **Hardened Network, Branch Isolation & Zero-Knowledge Runtime**: Virtual-adapter-aware LAN IPv4 resolution in the Vite dev/preview sync relay, event-loop safe SSE heartbeat cleanup, branch-scoped state isolation, unified tax-inclusive billing math, and redaction of non-active operator PINs and passwords across directory queries.

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Cross-Platform Application Stack (React 19 + TypeScript 6 + Vite 8 + Capacitor 8)

* **Status**: Accepted  
* **Context**: The system must run inside desktop operations browsers (`1920x1080`+ control rooms), mobile web browsers, and handheld rugged Android bay devices via Capacitor without duplicating business state machines (`SyncEngine` and `AuthEngine`) across separate codebases.  
* **Decision**: Use **React `^19.2.8`**, **TypeScript `~6.0.2`**, **Vite `^8.3.0`**, **Lucide React `^1.55.0`**, and **Capacitor `^8.5.3`** (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`).  
* **Rationale**:
  - One canonical TypeScript codebase governs offline queueing, billing calculations, RBAC authorization checks, and multi-branch filtering across all form factors.
  - Capacitor wraps the production `dist/` bundle directly into Android (`com.autopulse.garage.v2`) with `{ "server": { "cleartext": true } }` in `capacitor.config.json`—booting offline-first from bundled `dist/` assets without hardcoding a dev URL, while permitting cleartext HTTP LAN sync to any PC relay configured in `WifiDevSyncModal`.
* **Consequences**: Web builds compile cleanly via `tsc -b && vite build`; Android native shells initialize cleanly via `npx cap add android && npx cap sync android`.

---

### ADR-002: Offline-First Persistence & Outbox Synchronization Pattern (`autopulse_v2_*`)

* **Status**: Accepted  
* **Context**: Repair bays and underground tire/transmission pits suffer intermittent Wi-Fi coverage. Technicians cannot block on synchronous REST responses when clocking in, marking damage pins, or moving repair cards.  
* **Decision**: Implement an **Optimistic Outbox Pattern** in `src/state/syncEngine.ts` backed by browser storage partitioned under `autopulse_v2_*` keys (`autopulse_v2_jobs`, `autopulse_v2_inventory`, `autopulse_v2_employees`, `autopulse_v2_outbox`, `autopulse_v2_online`, `autopulse_v2_branch`, `autopulse_v2_server_url`, `autopulse_v2_audit_logs`, plus `authEngine.ts` keys including `autopulse_v2_remembered_session`).  
* **Rationale**:
  - Every write action (`createJobCard`, `advanceJobStatus`, `updateInventoryStock`, `transferStock`, `toggleEmployeeClock`, `updateEmployee`, `updateJobCardBilling`, `saveInspectionPoints`, `queueUserMutation`) immediately commits locally and either dispatches to the LAN relay when online or appends a `SyncMutation` record (`PENDING` | `SYNCED` | `FAILED` with `retryCount`) to the outbox queue.
  - `processOutbox()` refuses execution while `isOnline === false`, prevents concurrent duplicate flushes (`isFlushing`), marks failed dispatches as `'FAILED'` with incremented `retryCount` when an active LAN relay fails, and removes **only** confirmed-synced mutation IDs after the confirmation window—preserving any offline mutations queued mid-flush.
  - `loadState()` strips any stale `'SYNCED'` entries left over across reloads and `EventSource` pauses automatically while offline.
* **Production Evolution**: On native Android deployments, swap the `localStorage` adapter with Room SQLite / `@capacitor-community/sqlite` using identical `SyncMutation` table semantics and a background `WorkManager` worker.

---

### ADR-003: Real-Time LAN Synchronization via Vite `localSyncBridge()` SSE Relay

* **Status**: Accepted  
* **Context**: When demonstrating or operating multi-device terminals on a local garage subnet (e.g., Front Desk Desktop + Bay Technician Tablet), state mutations made on one client should appear live on peer terminals without configuring an external cloud database.  
* **Decision**: Embed an HTTP + **Server-Sent Events (SSE)** middleware plugin directly into `vite.config.ts` (`localSyncBridge()`), mounted on both `configureServer` (`npm run dev`, port `5173`) and `configurePreviewServer` (`npm run preview`, port `4173`), exposing `/api/sync/events`, `/api/sync/status`, `/api/sync/mutation`, and `/api/sync/state`.  
* **Rationale**:
  - Zero external broker setup (no Redis/Socket.io server needed during workshop prototyping).
  - Query-string safe pathname parsing (`new URL(req.url, 'http://localhost').pathname`), dynamic bound port detection, `2 MB` body cap on `POST` endpoints, automatic pruning of closed SSE sockets, and full CORS headers for Capacitor/LAN peers.

---

### ADR-004: Multi-Branch Isolation & Atomic Cross-Branch Stock Transfers

* **Status**: Accepted  
* **Context**: Workshop networks operate multiple physical locations (`branch-1` Apex Downtown Service Hub, `branch-2` Apex West Airport Express, `branch-3` Apex North Bay Heavy Depot). Parts, staff, and active repair orders belong to specific facilities, while multi-branch operators need visibility and parts relocation.  
* **Decision**: Enforce strict `branchId` scoping in `App.tsx` across `jobs`, `inventory`, `employees`, `MobileBottomNav` badges, and all Desktop/Mobile views (`branch-1`, `branch-2`, and `branch-3` all ship with baseline seed data in `src/data/mockData.ts`, linked to demo operators via `Employee.userId` and standardized `WORKSHOP_BAYS`), paired with atomic `transferStock()` mutations in `SyncEngine`.  
* **Consequences**:
  - Branch switching is restricted to roles holding `'system:switch_all_branches'` (`OWNER`, `ACCOUNTANT`, `IT_ADMIN`); `MANAGER` and `MECHANIC` remain locked to their assigned `currentUser.branchId`.
  - `transferStock()` rejects self-transfers and invalid/over-stock quantities, deducts from the source SKU, increments or provisions the matching `(sku, targetBranchId)` inventory record, and replicates both sides cleanly via `INTER_BRANCH_TRANSFER` SSE mutations.

---

### ADR-005: Deterministic Outbox Replay & State Reconciliation

* **Status**: Accepted  
* **Context**: Replayed offline mutations and LAN broadcasts must converge cleanly without duplicating job cards, clobbering newer versions, or losing user credential updates.  
* **Decision**: Represent every outbox entry (`SyncMutation`) with a collision-resistant client ID, `entityType` (`'JOB_CARD' | 'INVENTORY' | 'EMPLOYEE' | 'USER'`), `action` (`'CREATE' | 'UPDATE' | 'DELETE'`), typed `payload`, `timestamp`, `status` (`'PENDING' | 'SYNCED' | 'FAILED'`), and `retryCount`. `applyIncomingMutation()` reconciles `JOB_CARD` `version`/`updatedAt`, handles `DELETE`, handles `INTER_BRANCH_TRANSFER`, processes `STATE_REFRESH` snapshots, and dispatches complete `USER` `CREATE` and `UPDATE` records via `autopulse:user_mutation`.  
* **Consequences**: UI indicators surface live pending/failed queue counts in headers and `OutboxSyncDrawer` (with PIN/password redaction in payload previews), and `SystemAdminView` records live `AuditLogEntry` events (`autopulse_v2_audit_logs`).

---

### ADR-006: Zero-Trust Multi-User Kiosk Switcher & Granular RBAC (25 Permissions / 5 Roles)

* **Status**: Accepted  
* **Context**: Shared rugged bay tablets require fast 4-digit PIN handoffs between technicians while enforcing strict authorization across both Desktop and Mobile surfaces.  
* **Decision**: Enforce a unified credential and RBAC model in `src/auth/authEngine.ts` and `src/auth/permissions.ts`:
  - **5 Fixed Roles**: `OWNER`, `MANAGER`, `MECHANIC`, `ACCOUNTANT`, `IT_ADMIN`.
  - **25 Atomic Permission Tokens**: Covering work-order operations (`job:*`), inventory adjustments/transfers/scanning (`inventory:*`), staff roster/self-clock/rate viewing (`employee:*`), financial KPIs/invoicing/reminders/tax (`finance:*`), and system sync/admin/multi-branch scope (`system:*`, including `system:switch_all_branches`).
  - **Unified Surface Gating**: Both `DesktopDashboardLayout` (plus all Desktop child views) and Mobile Bay Terminal (`MobileHeader`, `MobileBottomNav`, and all Mobile views) gate navigation, branch switching, offline simulation, job intake, DVI, stock adjustments/transfers, invoicing, user management, and self-only vs. roster-wide clocking via `hasPermission()`.
  - **Credential Hardening**: `loginWithEmail()` strictly requires a verified non-empty password; password whitespace trimming is uniform across registration, recovery, and login; `completePasswordReset()` verifies OTP expiration and prevents replay of `'COMPLETED'` sessions; optional 30-day persistence (`rememberWorkstation`) uses `autopulse_v2_remembered_session`.
  - **Two-Way Verified PIN Reset**: `requestPinReset()` -> `sendResetPrompt()` (restricted to `system:manage_users`, generating a 6-digit `verificationCode`) -> `completePinReset()` (requires self-authentication or either the 6-digit IT dispatch code or the user's account password).

---

### ADR-007: Interactive Normalized-Coordinate 360° Chassis DVI Mapping

* **Status**: Accepted  
* **Context**: Fixed dropdown inspection forms fail to convey *where* dents, cracks, or wear sit on a customer's vehicle and lead to intake disputes.  
* **Decision**: Build `VehicleInspectionModal.tsx` around a dark OBD-II diagnostic SVG vehicle blueprint mapped with percentage coordinates (`x`, `y`) across 10 semantic chassis zones (`Front Bumper`, `Hood`, `Windshield`, `Roof`, `Driver Front Door`, `Passenger Front Door`, `Driver Rear Door`, `Passenger Rear Door`, `Trunk / Tailgate`, `Rear Bumper`), four damage types (`Scratch`, `Dent`, `Crack`, `Wear`), three severity levels (`Low`, `Medium`, `High`), and inspector damage notes (`notes?: string`), wrapped in `.sg-dvi-layout` to stack cleanly on narrow mobile viewports (`<= 640px`).  
* **Rationale**: Percentage coordinates and responsive grid stacking keep the CAD blueprint and defect logger usable on both 4K desktop displays and compact handheld screens.

---

### ADR-008: Optical Camera Barcode Scanning with Instant Manual Catalog Filter

* **Status**: Accepted  
* **Context**: Bay technicians use tablet cameras to check parts in/out, yet physical cameras are unavailable in desktop browsers, headless QA environments, or dark engine bays.  
* **Decision**: Build `BarcodeScannerModal.tsx` with a live animated laser-reticle scanner interface coupled to a real-time query filter across inventory `name`, `sku`, `barcode`, and `oemNumber`, plus a permission-gated segmented action switcher (`DEDUCT` `-1 Deduct to Job`, `RESTOCK` `+5 Restock` gated on `inventory:adjust_stock`, and `INSPECT` `Lookup SKU`) and unmount-safe scan timers.  
* **Consequences**: Zero dead-ends when camera hardware is missing and zero accidental duplicate/post-close scans; native `@capacitor-mlkit/barcode-scanning` can plug directly into the existing SKU resolution handler.

---

### ADR-009: Domain-Matched Typography & Tactile Plate Formatting

* **Status**: Accepted  
* **Context**: Dense financial invoices, VIN plates, bay numbers, and timestamps blur together under generic sans-serif styling, causing transcription errors.  
* **Decision**: Load three purposeful font families in `index.html` and map them via `src/theme.css`:
  - `--font-display`: **Barlow Condensed** (600/700/800) for bay headers, plate codes, KPI readouts, and navigation titles.
  - `--font-body`: **DM Sans** (400–700) for readable UI copy, repair notes, and checklists.
  - `--font-mono`: **JetBrains Mono** (500/600/700) with strict `font-variant-numeric: tabular-nums` for SKUs, timestamps, currency totals, and telemetry readouts.

---

### ADR-010: Fast Zero-Tolerance Build & Static Verification Pipeline

* **Status**: Accepted  
* **Context**: Rapid prototyping requires immediate feedback without multi-minute lint bottlenecks.  
* **Decision**: Pair **Oxlint (`^1.81.0`)** (`npm run lint`) with **TypeScript (`tsc -b`) + Vite production bundling** (`npm run build`), verified additionally with `--strict --noUnusedLocals --noUnusedParameters`.  
* **Outcome**: Full lint (`oxlint src vite.config.ts`) runs across all 36 source files with 0 warnings and 0 errors, and Vite build completes in sub-second wall time.

---

### ADR-011: Pure Custom CSS Design Tokens (Zero Utility Framework Overhead)

* **Status**: Accepted  
* **Context**: Heavy CSS-in-JS or utility frameworks introduce bundle churn and obscure theme invariants when transitioning entirely away from Prototype 1 styling.  
* **Decision**: Author all styling natively across two clean stylesheets (`src/theme.css` for design tokens and keyframes; `src/index.css` for resets, desktop/mobile layout grids, modal/drawer shells, `.sg-dvi-layout`, and print media queries) using pure CSS Custom Properties.

---

### ADR-012: Flat Workspace Repository Topology

* **Status**: Accepted  
* **Context**: Prototype 1 nested its Vite/React/Capacitor project under a sub-folder (`Prototype 1/prototype-app/`), requiring repeated `cd` steps and splitting docs from config.  
* **Decision**: Place `package.json`, `vite.config.ts`, `capacitor.config.json`, `index.html`, and `src/` directly at the root of `Prototype 2/`, keeping `docs/` neatly alongside at `Prototype 2/docs/`.  
* **Consequences**: Commands run directly from workspace root; tooling, IDE path resolution, and CI scripts operate without nested sub-package configuration.

---

### ADR-013: Standardized Tax-Inclusive Billing, Live Metrics & Printable A4 Tax Invoice (`#invoice-print-sheet`)

* **Status**: Accepted  
* **Context**: Accounting and service advisors need consistent pre-tax/tax/discount calculations, real-time branch financial telemetry, and multi-page printable customer receipts.  
* **Decision**:
  - Standardize `JobCard.totalCost` across `mockData.ts`, `NewJobCardModal.tsx`, `DesktopBillingView.tsx`, and `DesktopBillEditModal.tsx` as **tax-inclusive**: `max(0, estimatedLaborCost + partsCost - discountAmount) + 8% tax`.
  - Keep `laborHours`, `hourlyRate`, and `laborCost` bidirectionally synchronized in `DesktopBillEditModal.tsx`, preserve fractional part quantities (e.g., `4.5` liters), eliminate synthetic fallback line items when `partsCost === 0`, and compute branch analytics/bay utilization (`DesktopAnalyticsView`, `SalesInsightsView`) and parts markups (`DesktopInventoryView`) dynamically from live branch records.
  - Scope `@media print` via `body:has(#invoice-print-sheet)` and `position: static` in `src/index.css` so `.no-print` chrome hides cleanly and multi-page invoices print without modal clipping.

---

### ADR-014: Dual-Surface Architecture (Desktop Command Console vs Bay Terminal)

* **Status**: Accepted  
* **Context**: Front-desk dispatchers and accountants operate on wide screens needing dense multi-column Kanban boards, 6-bay lift floorplans, and editable billing tables, whereas bay technicians need thumb-friendly bottom navigation tabs (`Work Progress`, `Inventory`, `Staff & Bays`, `Financials`, `IT & System`) and large single-handed cards.  
* **Decision**: Split presentation components cleanly into `src/components/desktop/` (`DesktopDashboardLayout`, `DesktopKanbanView`, `DesktopInventoryView`, `DesktopStaffView`, `DesktopBillingView`, `DesktopAnalyticsView`) and `src/components/mobile/` (`MobileHeader`, `MobileBottomNav`, `WorkProgressView`, `InventoryView`, `EmployeesView`, `SalesInsightsView`, `SystemAdminView`), sharing modals and engines under `src/components/shared/`, `src/state/`, and `src/auth/`.

---

### ADR-015: Desktop Portal Registration, Password Strength Validation & Cloud Account Linking

* **Status**: Accepted  
* **Context**: Newly onboarded branch staff or fleet owners registering via the web portal need realistic password quality checks, role selection, optional 30-day workstation persistence, and linking to an existing cloud operator record.  
* **Decision**: Implement `evaluatePasswordStrength()` (`Weak` / `Fair` / `Good` / `Strong`, scoring `0–4` across minimum 8 characters, uppercase, lowercase, digit, and special character checks), `registerDesktopUser()`, `linkExistingCloudAccount()`, and collision-free username generation (`registerNewUser()`) in `src/auth/authEngine.ts`, surfaced via `DesktopAuthScreen.tsx` and `RegisterUserModal.tsx`.

---

### ADR-016: Tactile Hardware / Industrial Garage Aesthetic System

* **Status**: Accepted  
* **Context**: Prototype 2 required a bespoke theme authentically matched to an automotive repair shop floor without inheriting Prototype 1's slate/cyan glassmorphism.  
* **Decision**: Design the **Tactile Hardware / Industrial Garage** aesthetic in `src/theme.css` using OKLCH perceptual color space:
  - **Surfaces**: Matte Shop Charcoal `--bg-canvas` (`oklch(0.165 0.006 70)`), Tool-Chest Steel `--bg-surface` (`oklch(0.215 0.007 70)`), Anodized Gunmetal `--bg-elevated` (`oklch(0.265 0.008 70)`), Recessed Gauges `--bg-recessed` (`oklch(0.135 0.005 70)`).
  - **Automotive Signals**: Hydraulic Safety Orange (`--accent-primary: oklch(0.70 0.19 42)`), Pit-Lane Green (`--accent-secondary: oklch(0.74 0.16 148)`), Caution Yellow (`--accent-volt: oklch(0.85 0.17 95)`), Oil Amber (`--accent-amber`), Fault Red (`--accent-danger`), and Brushed Chrome (`--accent-violet`).
  - **Shop-Floor Primitives**: Diagonal workshop hazard stripes (`.sg-hazard-strip`), stamped license plate badges (`.sg-plate`), physical hardware status LEDs (`.sg-led`, `.sg-led-live`, `.sg-led-warn`, `.sg-led-fault`), 5-stage horizontal bay progress steppers (`.sg-stage-track` / `.sg-stage-pip`), anodized segmented controls (`.sg-segmented`), and an OBD-II dark-screen chassis diagnostic viewfinder.
  - **Accessibility**: `@media (prefers-reduced-motion: reduce)` disables LED pulsing and scanner laser sweep motion while retaining `:focus-visible` high-contrast outlines.

---

### ADR-017: Responsive Viewport Auto-Detection & Manual Surface Switcher

* **Status**: Accepted  
* **Context**: Narrow laptop windows, tablets, and mobile browsers need direct access to the Bay Terminal while desktop operators can switch surfaces on demand.  
* **Decision**: Track `window.innerWidth` reactively in `src/App.tsx` via a resize listener and expose `surfaceOverride` (`'auto' | 'desktop' | 'mobile'`):
  ```ts
  const useDesktopSurface =
    !isNativeApp &&
    (surfaceOverride === 'desktop' || (surfaceOverride === 'auto' && viewportWidth >= 1024));
  ```
  Users can switch between **Desktop Command Console** and **Bay Terminal** across both auth screens and active workspaces (`Bay Terminal` ↔ `Desktop Portal`).

---

### ADR-018: Virtual-Adapter-Safe LAN IPv4 Discovery, Leak-Safe SSE Heartbeat & Directory Redaction

* **Status**: Accepted  
* **Context**: Development workstations often expose virtual network adapters (WSL2, Hyper-V, VirtualBox, Docker) ahead of physical Wi-Fi NICs, and shared terminal queries must not leak credentials of inactive users.  
* **Decision**:
  1. **Prioritized IPv4 Discovery (`vite.config.ts`)**: `resolveLocalIpv4()` filters out common virtual/VPN interfaces (`vEthernet`, `WSL`, `VirtualBox`, `VMware`, `Docker`, `Hyper-V`, `Loopback`, `Tailscale`, `ZeroTier`) and prioritizes physical `192.168.*` and `10.*` LAN addresses (fallback `127.0.0.1`) on `/api/sync/status` and `/api/sync/events`.
  2. **Event-Loop Safe SSE Heartbeat & Cleanup**: Scope the `20000ms` `: heartbeat\n\n` interval inside `attachBridge()`, call `heartbeat.unref()`, prune closed/errored `sseClients`, and clear timers/clients on `httpServer?.on('close', ...)`.
  3. **Directory Redaction & Modal Lifecycle Hygiene (`authEngine.ts`, shared modals)**: `getAvailableUsers()` strips `pinCode` and `password` (`undefined`) for every non-current user; `getGlobalCloudUsers()` strips `pinCode` and `password` (`undefined`) for all entries; stateful modals (`RegisterUserModal`, `PinResetModal`, `PinChallengeModal`, `NewJobCardModal`, `BarcodeScannerModal`, `WifiDevSyncModal`) cleanly unmount when closed and look up entities by ID to prevent stale snapshots.

---

## 3. Architecture Summary Matrix

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         AutoPulse Prototype 2 // Bay OS                        │
├───────────────────────────────────┬───────────────────────────────────────────┤
│   DESKTOP COMMAND CONSOLE         │   BAY TERMINAL (MOBILE / CAPACITOR APP)   │
│   (Web >=1024px / Manual Toggle)  │   (Native Android / <1024px / Toggle)     │
│   • Live Branch Telemetry & Bays  │   • Work Progress + 5-Stage Bar + VIN     │
│   • 5-Column Bay Kanban (RBAC)    │   • Branch Inventory + Optical Scanner    │
│   • Warehouse & Branch Transfers  │   • Crew Roster + Self/Roster Clocking    │
│   • 6-Bay Floorplan & Staff Admin │   • Live Branch Financials & Reminders    │
│   • Tax-Inclusive Billing & Print │   • IT Admin, Verified PIN Reset & Audit  │
├───────────────────────────────────┴───────────────────────────────────────────┤
│                     SHARED MODALS & HARDWARE OVERLAYS                         │
│   NewJobCardModal • VehicleInspectionModal (360° Chassis) • BarcodeScannerModal│
│   OutboxSyncDrawer • WifiDevSyncModal • PinChallengeModal • PinResetModal     │
├───────────────────────────────────────────────────────────────────────────────┤
│                         SHARED ENGINE LAYER (TypeScript)                      │
│   AuthEngine (25 RBAC Perms, OTP Recovery, 6-Digit PIN Reset, 30d Remember)   │
│   SyncEngine (Optimistic Mutations, autopulse_v2_* Storage, Live Audit Logs)  │
├───────────────────────────────────────────────────────────────────────────────┤
│                         TRANSPORT & RUNTIME BRIDGE                            │
│   Vite localSyncBridge() (dev :5173 & preview :4173, SSE + CORS + 2MB Guard)  │
│   Capacitor 8 Shell (com.autopulse.garage.v2, offline dist/ + cleartext LAN)  │
└───────────────────────────────────────────────────────────────────────────────┘
```
