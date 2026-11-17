# AutoPulse // Garage Bay OS (Prototype 2)

Offline-first, multi-branch automotive garage management prototype combining a **Desktop Command Console** (`>= 1024px`) and a rugged shop-floor **Bay Terminal** (`< 1024px` web or Capacitor 8 Android shell) inside a unified React 19 + TypeScript 6 + Vite 8 application.

Styled from scratch with a **Tactile Hardware / Industrial Garage** design system (`src/theme.css`, `src/index.css`) featuring shop-floor charcoal surfaces, Hydraulic Safety Orange signals, stamped aluminum license plates, 5-stage horizontal bay progress steppers, LED indicators, and a dark OBD-II 360° chassis DVI monitor.

---

## Quick Start

Run directly from `Prototype 2/`:

```bash
# Install dependencies
npm install

# Start Vite dev server + LAN SSE sync relay (0.0.0.0:5173)
npm run dev

# Run static analysis (Oxlint)
npm run lint

# Type-check & build production dist/ bundle
npm run build

# Preview production dist/ bundle with LAN SSE sync relay (port 4173)
npm run preview
```

> **Windows PowerShell Note**: If `npm.ps1` is blocked by execution policy on Windows, use `npm.cmd run dev`, `npm.cmd run lint`, and `npm.cmd run build` (or run via `cmd /c`).

---

## Demo Credentials

All 5 pre-configured operator roles share the demo password **`AutoPulse@2026!`** and support fast 4-digit tablet PIN handoffs:

| Operator | Username | Email | Role | Bay PIN |
| :--- | :--- | :--- | :--- | :--- |
| Sarah Sterling | `sarah.sterling` | `sarah.owner@autopulse.io` | `OWNER` | `1111` |
| Marcus Vance | `marcus.vance` | `marcus.mgr@autopulse.io` | `MANAGER` | `2222` |
| Dave Miller | `dave.miller` | `dave.tech@autopulse.io` | `MECHANIC` | `3333` |
| Elena Rostova | `elena.rostova` | `elena.acct@autopulse.io` | `ACCOUNTANT` | `4444` |
| Alex Chen | `alex.chen` | `alex.admin@autopulse.io` | `IT_ADMIN` | `5555` |

---

## Documentation Suite

Complete technical, user, and legal documentation is located under [`docs/`](./docs):

- [`docs/USER_MANUAL.md`](./docs/USER_MANUAL.md) — Step-by-step guide for Desktop & Bay Terminal operations, 360° DVI, barcode scanning, invoicing, PIN resets & offline sync
- [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md) — Codebase map, `autopulse_v2_*` persistence & outbox engine, CSS design tokens, RBAC & Capacitor packaging
- [`docs/TECHNICAL_DECISIONS.md`](./docs/TECHNICAL_DECISIONS.md) — Architecture Decision Records (`ADR-001` through `ADR-018`, including Prototype 2 upgrades)
- [`docs/END_USER_LICENSE_AGREEMENT.md`](./docs/END_USER_LICENSE_AGREEMENT.md) — Software EULA (`com.autopulse.garage.v2`)
- [`docs/TERMS_AND_CONDITIONS.md`](./docs/TERMS_AND_CONDITIONS.md) — Terms & Conditions of Service
