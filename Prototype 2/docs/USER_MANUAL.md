# AutoPulse Garage Management System (Prototype 2) — Operator & User Manual

**Application**: AutoPulse // Garage Bay OS (Prototype 2)  
**Target Roles**: Owners, Workshop Managers, Bay Mechanics, Accountants, IT Administrators  
**Surfaces**: Desktop Command Console (`>= 1024px` Web) & Bay Terminal (`< 1024px` Mobile Web / Capacitor Android App)  

---

## 1. Welcome to AutoPulse Prototype 2

**AutoPulse Prototype 2** is an automotive bay-grade operations platform built with a **Tactile Hardware / Industrial Garage** interface. It allows multi-branch service centers to manage branch-isolated vehicle intake, live Kanban repair pipelines, interactive 360° chassis inspections, branch parts warehouses, technician shift timesheets, A4 customer tax invoicing, and IT offline-outbox controls from a single synchronized workspace.

### Surface Switching (Desktop Console <-> Bay Terminal)
On desktop and tablet web browsers, AutoPulse automatically selects the **Desktop Command Console** when the viewport is `1024px` or wider and the **Bay Terminal** below `1024px`.
* **Switch from Desktop Console to Bay Terminal**: Click **Bay Terminal** in the top header controls (or **Bay PIN Terminal** on the Desktop Sign-In portal).
* **Switch from Bay Terminal to Desktop Console**: Tap **Desktop Portal** in the Bay Terminal top bar (or on the Bay Terminal Sign-In screen).
* **Native Android (Capacitor Shell)**: Boots offline-first directly from bundled assets into the thumb-friendly **Bay Terminal** layout and syncs over LAN Wi-Fi via **PC Wi-Fi Link**.

---

## 2. Signing In, Account Recovery & Kiosk Switcher

### 2.1 Demo Operator Credentials
All five pre-configured roles share the demo password **`AutoPulse@2026!`** and have individual 4-digit bay PINs for shared tablet handoffs:

| Role | Operator Name | Username | Email | Quick PIN |
| :--- | :--- | :--- | :--- | :--- |
| **Owner** | Sarah Sterling | `sarah.sterling` | `sarah.owner@autopulse.io` | `1111` |
| **Manager** | Marcus Vance | `marcus.vance` | `marcus.mgr@autopulse.io` | `2222` |
| **Mechanic** | Dave Miller | `dave.miller` | `dave.tech@autopulse.io` | `3333` |
| **Accountant** | Elena Rostova | `elena.rostova` | `elena.acct@autopulse.io` | `4444` |
| **IT Admin** | Alex Chen | `alex.chen` | `alex.admin@autopulse.io` | `5555` |

### 2.2 Desktop Command Console Sign-In & Onboarding
1. On wide screens (`>= 1024px`), you land on the **Desktop Authentication Portal** (`DesktopAuthScreen`).
2. **Sign In**: Enter either your **Username** or **Work Email** paired with your **Master Password** (`AutoPulse@2026!`), or use the one-click **Quick Demo Profiles** selector. Check **Remember this workstation for 30 days** to persist your session across browser restarts.
3. **Register User**: Switch to the **Register User** tab, choose your Organizational Role and Assigned Garage Branch, and set a password meeting all live **Password Strength** checks (`8+ chars`, uppercase, lowercase, digit, special character).
4. **Forgot Password (OTP Verification)**:
   * Switch to **Forgot Password** (or click **Forgot password?**), enter your Username or Work Email, and click **Dispatch Verification Code**.
   * For offline workshop prototyping, the simulated relay banner displays your 6-digit OTP code; enter it to verify and save a new strong password (expired or already-used codes cannot be replayed).

### 2.3 Bay Terminal Sign-In & 4-Digit Kiosk PIN Switcher
1. On Bay Terminals (`< 1024px` or Android), the **Mechanic Bay PIN** mode lets you enter a 4-digit PIN via touch keypad or hardware keyboard, or switch to **Email / Password** for credential sign-in.
2. Below the keypad, the **Switch Account** roster bar opens `PinChallengeModal` for fast 4-digit PIN handoffs between cached operators.
3. Tap **Register User** or **Link Account** to onboard a new technician or authenticate and link an existing cloud directory profile to the terminal.

### 2.4 Forgot PIN? Two-Way IT Security Workflow
1. If a technician forgets their 4-digit bay PIN, tap **Forgot PIN? Request Reset from IT** on the Bay Terminal sign-in screen, tap **Request IT PIN Reset** inside `PinChallengeModal`, or request a reset from **Staff Profile & Security Settings** (`UserProfileModal`).
2. An **IT Administrator** (or **Owner**) opens **IT & System** / **IT Security & Sync Relay** (`SystemAdminView`) -> **Staff Credentials & Accounts** and clicks **Send Reset Prompt** on the pending ticket. AutoPulse generates a **6-digit IT Dispatch Code** (`Prompt Dispatched (Code: XXXXXX)`).
3. On the Bay Terminal login screen, tap the **Reset Prompt Ready** banner to open `PinResetModal`. If resetting while logged out, verify identity with either the **6-digit IT Dispatch Code** provided by IT Admin or your **Account Password**, then save a new 4-digit PIN. (Operators already signed into their own profile can complete their prompted reset directly from `UserProfileModal`.)

---

## 3. Desktop Command Console Workspace

When signed in on Desktop, the left navigation rail displays only the modules permitted for your role:

1. **Executive Analytics** (`finance:view_kpis`):
   - View branch **Monthly Revenue**, **Avg Repair Order (ARO)**, live **Bay Utilization** (`occupied of total bays`), and **Team Labor Efficiency**.
   - Toggle **Last 7 Days (`7D`)**, **Past 30 Days (`30D`)**, and **Year to Date (`YTD`)** to scale the Revenue Flow chart, inspect live Labor/Parts/Tax contributions, and monitor the **Multi-Location Network Performance** ledger.
2. **Repair Pipeline (Kanban)** (`job:view`):
   - Interactive 5-column workshop board for the active branch: **Vehicle Intake** -> **Diagnostic Scans** -> **Bay Active Repair** -> **Quality & Road Test** -> **Ready for Customer**.
   - Search by Job #, Customer, Plate, Model, or **VIN**. Roles with appropriate permissions can launch **360° DVI**, open **Bill**, advance/revert repair stages, or create intake orders with **New Intake Job**.
3. **Bills & Invoicing** (`finance:manage_invoices` / `finance:view_kpis`):
   - Search branch invoices and filter by billing status (`ALL`, `PENDING`, `INVOICED`, `PARTIAL`, `PAID`). All job `totalCost` values are **tax-inclusive** (`max(0, labor + parts - discount) + 8% tax`).
   - Click **Edit Bill** to adjust synchronized labor hours/hourly rate/subtotal, fractional or unit parts quantities, discounts, payment status, and collected amount, then toggle **Print Preview** and click **Send to System Printer** for a clean black-on-white A4 sheet (`#invoice-print-sheet`).
   - Click **Settle** for instant full-balance settlement.
4. **Staff & Bay Operations** (`employee:view` / `employee:view_rates`):
   - **6-Bay Physical Floorplan (`BAY 01`–`BAY 06`)**: Shows live `OCCUPIED`, `STANDBY`, and `VACANT` bay statuses across the active branch's lifts.
   - Managers/Owners can edit status, canonical bay assignments (`WORKSHOP_BAYS`), roles, hours, and job assignments; technicians with `employee:clock_self` can clock their own shift in/out.
5. **Parts & Warehouse** (`inventory:view`):
   - View branch-scoped stock counts, critical low-stock alerts, and live average parts markup.
   - Adjust stock (`-1` / `+5`), launch the **Optical Barcode Scanner**, or use **Transfer** to relocate stock to another Apex branch (automatically deducting from the source branch and crediting/provisioning the destination branch).
6. **IT Security & Sync Relay** (`system:view_outbox` / `system:manage_users`):
   - Monitor offline outbox queue count, simulate offline mode, safely flush pending mutations when online, approve IT PIN reset tickets with 6-digit dispatch codes, inspect live **Audit Trail** events, or restore baseline sample data with **Reset Demo**.

---

## 4. Bay Terminal (Mobile / Tablet) Navigation & Sectors

On mobile screens or Android tablets, work flows across up to five permission-gated bottom dock tabs (`Work Progress`, `Inventory`, `Staff & Bays`, `Financials`, `IT & System`):

* **Top Telemetry Header (`MobileHeader`)**:
  - **Branch Selector**: Switch active hubs (locked to your assigned branch unless holding `system:switch_all_branches`).
  - **Outbox Badge & Network Indicator**: Shows queued mutation count (`system:view_outbox`) and live Online/Offline Room DB state (interactive toggle requires `system:force_sync`).
  - **PC Wi-Fi Link**: Opens `WifiDevSyncModal` to verify or customize the LAN sync host URL.

### Module 1: Work Progress (`Work Progress`)
- Filter branch jobs by **In Service**, **Ready**, or **All Jobs**, and search by license plate, model, customer name, **VIN**, or Job Number.
- Inspect the **5-stage horizontal stepper bar**, tap **Perform DVI** (`job:perform_dvi`), or tap **Advance to ...** (`job:advance_status`).

### Module 2: 360° Digital Vehicle Inspection (`VehicleInspectionModal`)
1. Open **Perform DVI** on any repair order to inspect the dark OBD-II chassis blueprint (stacks automatically for narrow mobile viewports).
2. Tap any of the **10 chassis zones** (`Front Bumper`, `Hood`, `Windshield`, `Roof`, `Driver Front Door`, `Passenger Front Door`, `Driver Rear Door`, `Passenger Rear Door`, `Trunk / Tailgate`, `Rear Bumper`).
3. Choose Defect Type (`Scratch | Dent | Crack | Wear`), Severity (`Low | Medium | High`), optional notes, tap **+ Log Defect**, and save via **Save Inspection Report**.

### Module 3: Inventory & Optical Barcode Scanner (`Inventory`)
- Filter branch parts across all 6 categories (`Brakes`, `Fluids & Oils`, `Filters`, `Engine`, `Suspension`, `Electrical`) and search by name, SKU, OEM number, or **barcode**.
- Roles with `inventory:adjust_stock` see **`+1`** / **`-1`** adjusters; roles with `inventory:transfer_branch` can dispatch **Transfer Branch** stock relocations.
- **Optical Barcode Scanner (`BarcodeScannerModal`)**: Mechanics (`inventory:scan_barcode`) can run **`-1 Deduct to Job`** and **`Lookup SKU`**; roles with `inventory:adjust_stock` also see **`+5 Restock`**.

### Module 4: Staff & Bays (`Staff & Bays`)
- Track branch technician count, active bays, and average efficiency %, and clock shifts in/out (limited to your own profile under `employee:clock_self`, or all branch technicians under `employee:manage_roster`).

### Module 5: Financials (`Financials`)
- View live branch baseline monthly revenue, live open-order Average Repair Order (ARO), labor vs. parts revenue split, 7-day revenue velocity, and live unpaid job balances for the selected branch—with one-tap WhatsApp payment reminders (`finance:send_reminders`).

---

## 5. Offline Outbox Sync & Wi-Fi Dev Link

### Working Offline in Deep Repair Bays
When WLAN drops out (or when testing via **IT & System -> Simulate Offline Mode**):
- Live SSE incoming broadcasts pause automatically and all local mutations queue chronologically in the **Offline Outbox Queue** (`OutboxSyncDrawer`).
- **Force Flush** is safely disabled while offline so queued mutations are never dropped. Once reconnected online, `SyncEngine` flushes queued mutations automatically and preserves any new offline edits made mid-flush.

### Multi-Device Live LAN Sync (`WifiDevSyncModal`)
1. Ensure both your workstation running `npm run dev` (port `5173`) or `npm run preview` (port `4173`) and peer laptops/tablets share the same local Wi-Fi subnet.
2. Open **PC Wi-Fi Link** / **Link** from the sign-in screen or workspace header.
3. Verify the auto-detected LAN IPv4 host URL and tap **Test Connection** to confirm **Active SSE Clients**. Mutations executed on one device broadcast live to all connected terminals.

---

## 6. Troubleshooting & Frequently Asked Questions

* **I cannot see the Financial Insights, Billing, or IT & System modules.**  
  AutoPulse enforces 25 RBAC permissions identically on both Desktop and Bay Terminal. For example, `MECHANIC` (`Dave Miller`) cannot view financial margins, edit invoices, adjust warehouse stock directly, or open IT controls. Switch to **Sarah Sterling (`OWNER`, PIN `1111`)**, **Elena Rostova (`ACCOUNTANT`, PIN `4444`)**, or **Alex Chen (`IT_ADMIN`, PIN `5555`)** as needed.
* **The Branch Selector is disabled/locked for my account.**  
  Multi-branch switching requires `system:switch_all_branches` (`OWNER`, `ACCOUNTANT`, `IT_ADMIN`). `MANAGER` and `MECHANIC` operators are locked to their assigned facility (`branch-1`, `branch-2`, or `branch-3`).
* **Force Flush is disabled in System Admin.**  
  Outbox flushing requires an active online connection so queued mutations are never discarded offline. Click **Reconnect Network** first, then flush if any pending/failed items remain.
* **Demo data was heavily modified during testing—how do I restore clean sample records?**  
  Navigate to **IT Security & Sync Relay** / **IT & System** (`SystemAdminView`) and click **Reset Demo**. To clear user credentials/sessions completely, clear `autopulse_v2_*` entries in Browser Storage/DevTools.
