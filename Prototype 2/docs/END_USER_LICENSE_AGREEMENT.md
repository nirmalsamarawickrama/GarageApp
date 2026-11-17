# END-USER LICENSE AGREEMENT (EULA)

**Software Product**: AutoPulse // Garage Bay OS (Prototype 2, v2.0.0)  
**Package / Bundle Identifier**: `autopulse-prototype-2` / `com.autopulse.garage.v2`  
**Effective Date**: November 2026  

IMPORTANT — READ CAREFULLY: This End-User License Agreement ("EULA") is a legal agreement between you (either an individual technician, service advisor, or an automotive service entity, referred to as "Licensee" or "You") and **AutoPulse Systems Ltd.** ("Licensor", "Company", or "We") for the AutoPulse Prototype 2 Garage Management Software, including the Desktop Command Console web interface, Bay Terminal mobile/tablet interface, offline outbox state engine, local LAN SSE relay tooling, and all accompanying documentation ("Software").

By installing, copying, accessing, or otherwise using the Software, You agree to be bound by the terms of this EULA. If You do not agree to the terms of this EULA, do not install, access, or use the Software.

---

## 1. GRANT OF LICENSE

Subject to strict compliance with the terms of this EULA, Licensor grants You a limited, non-exclusive, non-transferable, revocable license to deploy and operate the Software solely for Your internal automotive repair workshop operations, digital vehicle inspections (DVI), bay scheduling, parts inventory tracking, and point-of-sale billing workflows across authorized branch facilities.

* **Dual-Surface Permitting**: Your workspace license permits simultaneous use across Desktop Command Console terminals (`>= 1024px` web browsers) and shop-floor Bay Terminals (mobile web viewports or Capacitor-packaged Android hardware devices).
* **Multi-Branch & Multi-Seat Authorization**: Usage across concurrent branches or staff seats is governed by the Role-Based Access Control (RBAC) policies configured for Your organization and applicable subscription tier.

---

## 2. RESTRICTIONS ON USE

Licensee shall NOT, directly or indirectly:
1. Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code or proprietary sync protocols of any compiled or obfuscated production deliverables, except to the extent expressly permitted by applicable mandatory law or written evaluation terms;
2. Rent, lease, sublicense, distribute, timeshare, or operate the Software as an unauthorized third-party commercial service bureau;
3. Bypass, circumvent, or tamper with authentication gates, 4-digit bay PIN verification, OTP recovery flows, IT PIN moderation controls, or RBAC permission enforcement;
4. Modify or remove proprietary trademarks, copyright headers, hazard-stripe telemetry branding, or licensing notices in the Software or printed invoices;
5. Use the Software in safety-critical automotive hardware control (e.g., direct ECU reprogramming, ADAS radar calibration actuation, hydraulic lift interlock bypass, or brake-bench actuation) without independent manual engineering verification.

---

## 3. PROTOTYPE & EVALUATION DISCLAIMER

Prototype 2 (`v2.0.0`) is provided primarily as an **Architectural & Interactive Workshop Prototype** utilizing browser `localStorage` persistence (`autopulse_v2_*` namespaces), synthetic sample branch datasets, simulated hardware optical barcode lookup, and local development network relays (`localSyncBridge`). You acknowledge that offline browser storage is device-bound unless integrated with Your production cloud database backend, and should not be relied upon as an exclusive system of record for statutory tax or financial retention without automated off-device backups.

---

## 4. INTELLECTUAL PROPERTY RIGHTS

All title, ownership rights, patents, trade secrets, UX system tokens (`src/theme.css`), schematic vehicle inspection coordinates, source code, and documentation in and to the Software remain the exclusive property of AutoPulse Systems Ltd. This EULA grants a right to use under specified conditions and transfers no ownership of intellectual property.

---

## 5. OFFLINE STATE & LOCAL NETWORK SYNC

The Software provides an optimistic Offline Outbox engine and local Wi-Fi SSE relay intended for continuous bay operation during intermittent connectivity. Licensee assumes sole operational responsibility for securing local workshop Wi-Fi subnets (`0.0.0.0:5173` / preview `:4173`), enforcing HTTPS/TLS and authenticated API gateways prior to production internet exposure, and monitoring synchronized mutations for accuracy.

---

## 6. PRIVACY & TELEMETRY

AutoPulse Prototype 2 executes client-side without silent third-party advertising trackers. Any customer names, license plates, VIN strings, technician shift logs, invoice amounts, or operator profiles entered into a local workstation remain stored locally inside Your browser origin (`autopulse_v2_*`) or Your designated synchronization endpoint. Licensee is solely responsible for compliance with applicable data protection laws (including GDPR, CCPA, or local privacy statutes) covering vehicle owners and workshop personnel.

---

## 7. THIRD-PARTY OPEN-SOURCE COMPONENTS

The Software bundles or interfaces with open-source libraries including React, Vite, Capacitor, and Lucide React, each governed by its respective permissive open-source license (such as MIT). Nothing in this EULA restricts rights granted to You under those underlying open-source licenses.

---

## 8. UPDATES & SUPPORT

Licensor may deliver patches, security updates, or design revisions at its discretion. Unless covered by a separate written Enterprise Support SLA, Prototype builds are provided without guaranteed response-time commitments.

---

## 9. TERM & TERMINATION

This EULA remains effective until terminated. Your license terminates automatically without prior notice if You materially breach any provision herein. Upon termination, You must immediately cease operating the Software and purge local copies and cached application storage from Your terminals.

---

## 10. WARRANTY DISCLAIMER

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SOFTWARE IS PROVIDED **"AS IS"** AND **"AS AVAILABLE"**, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND. LICENSOR EXPRESSLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OF AUTOMOTIVE DIAGNOSTIC ESTIMATES, TAX CALCULATION COMPLIANCE, AND NON-INFRINGEMENT.

---

## 11. LIMITATION OF LIABILITY

TO THE EXTENT NOT PROHIBITED BY LAW, IN NO EVENT SHALL LICENSOR OR ITS CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES—INCLUDING LOST WORKSHOP REVENUE, MISCALCULATED ESTIMATES, DATA LOSS FROM CLEARED BROWSER STORAGE, OR VEHICLE DOWNTIME—EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. LICENSOR'S AGGREGATE LIABILITY UNDER THIS EULA SHALL NOT EXCEED THE AMOUNTS ACTUALLY PAID BY LICENSEE TO LICENSOR IN THE PRECEDING TWELVE (12) MONTHS (OR USD \$100 FOR NO-FEE EVALUATION BUILDS).

---

## 12. EXPORT COMPLIANCE & GOVERNING LAW

Licensee agrees to comply with all applicable export and re-export regulations. This EULA is governed by and construed in accordance with the substantive laws applicable to commercial software contracts in Licensor's jurisdiction of incorporation, without regard to conflict-of-laws rules.

---

## 13. ENTIRE AGREEMENT & CONTACT

This EULA constitutes the complete agreement between You and Licensor regarding the Software and supersedes prior oral or written understandings on its subject matter.

**Licensing & Support Inquiries**:  
AutoPulse Systems Ltd.  
Licensing: `license@autopulse-garage.io`  
Support: `support@autopulse-garage.io`  
Web: `https://autopulse-garage.io`
