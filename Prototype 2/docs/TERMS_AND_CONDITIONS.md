# TERMS AND CONDITIONS OF SERVICE

**Platform**: AutoPulse // Garage Bay OS (Prototype 2, v2.0.0)  
**Effective Date**: November 2026  

These Terms and Conditions ("Terms") govern access to and use of the **AutoPulse Garage Bay OS** web platform, companion hybrid-native Android application (`com.autopulse.garage.v2`), synchronization bridge, and associated documentation (collectively, the "Service") operated by **AutoPulse Systems Ltd.** ("AutoPulse", "We", "Us"). By launching an instance, signing in with operator credentials, or enrolling workshop branches, You ("Subscriber", "Garage Operator", or "You") accept and agree to these Terms.

---

## 1. SCOPE OF SERVICE & PROTOTYPE NATURE

AutoPulse provides multi-branch garage management tools spanning work-order intake, Kanban lift tracking, 360° interactive chassis damage logging, optical inventory scanning, technician efficiency timesheets, billing/invoicing, and offline mutation queuing. Prototype 2 (`v2.0.0`) runs locally on operator workstations and mobile browsers using client-partitioned `autopulse_v2_*` storage and optional LAN Vite SSE relaying unless linked to a provisioned cloud database backend.

---

## 2. OPERATOR ACCOUNTS, AUTHENTICATION & ACCESS CONTROL

* **Role Segregation**: Access is enforced across five system roles (`OWNER`, `MANAGER`, `MECHANIC`, `ACCOUNTANT`, `IT_ADMIN`) covering 25 granular permissions.
* **Credential Responsibility**: Organizations must maintain confidential strong passwords (minimum 8 characters including uppercase, lowercase, digits, and symbols) and immediately deactivate sample demo credentials (`AutoPulse@2026!`, preset PINs `1111`–`5555`) before using any environment with real customer data.
* **Kiosk & IT PIN Moderation**: Bay Terminals permit rapid 4-digit PIN handoffs for shared shop-floor tablets. IT Administrators retain responsibility for verifying identity before issuing PIN reset prompts (`sendResetPrompt`) and providing the generated 6-digit dispatch verification codes to waiting staff terminals.

---

## 3. ACCEPTABLE USE POLICY

You agree not to:
1. Transmit malicious scripts, automated scraping traffic, or unauthorized payloads to local or hosted synchronization endpoints (`/api/sync/*`);
2. Falsify repair inspection logs, OEM part numbers, tax invoice totals, or audit trails;
3. Expose an unauthenticated development bridge (`vite.config.ts` / port `5173`) directly onto public untrusted networks without TLS termination and reverse-proxy access controls;
4. Use AutoPulse branding or synthetic demo data as live statutory financial filings.

---

## 4. WORKSHOP DATA OWNERSHIP & PRIVACY

You retain full ownership of all customer records, VIN entries, vehicle damage annotations, parts pricing, employee timesheets, and generated invoices recorded through Your deployment. Subscriber warrants that it has obtained all legally required customer consents before logging vehicle registration plates, telephone numbers, or inspection histories.

---

## 5. INVENTORY, BILLING & TAX COMPLIANCE DISCLAIMER

While AutoPulse Prototype 2 calculates subtotals, labor charges, parts markups, discounts, and printable A4 invoices (`#invoice-print-sheet`), automated line-item totals and estimated tax percentages are operational aids only. Subscribers remain solely responsible for auditing final invoice figures, complying with regional automotive repair consumer notices, and remitting applicable sales/VAT taxes through certified accounting systems.

---

## 6. OFFLINE QUEUEING & CONFLICTS

When bays lose connectivity, AutoPulse records updates in the local Offline Outbox queue (`autopulse_v2_outbox`). Upon reconnection, updates transmit in chronological order (`FAILED` items retain `retryCount` until acknowledged). Under concurrent disconnected edits to identical inventory SKUs or job fields, versioned/last-committed mutation ordering applies unless augmented with custom backend conflict resolution. Subscriber acknowledges that clearing browser site storage while queued mutations remain `PENDING` or `FAILED` permanently erases unsent local changes.

---

## 7. AVAILABILITY, MAINTENANCE & DEMO RESETS

Service uptime targets apply strictly to managed production SaaS tiers under executed commercial contracts. Standalone Prototype 2 instances run directly on Subscriber hardware without uptime guarantees. Using **Reset Demo Data** inside System Administration irreversibly restores sample workshop branches, technicians, inventory, and job cards to factory baseline values.

---

## 8. FEES & SUBSCRIPTIONS (COMMERCIAL TIERS)

If subscribed to a paid AutoPulse Cloud tier (multi-branch hosting, managed PostgreSQL synchronization, encrypted backups), subscription fees are billed per active workshop branch or active terminal seat in accordance with Your executed Order Form. Failure to settle overdue invoices may result in account suspension after written notice.

---

## 9. INTELLECTUAL PROPERTY

AutoPulse retains all right, title, and interest in the AutoPulse platform, brand marks, Tactile Hardware UI design system, workflow engines, and software source code. Feedback or feature suggestions provided by Subscriber may be used freely by AutoPulse without royalty obligations.

---

## 10. HARDWARE & BAY SAFETY

Digital Vehicle Inspection (DVI) wireframes and 6-bay lift floorplans provide organizational tracking only. Operators must follow OEM vehicle lift points, lockout/tagout procedures, PPE rules, and physical pre-delivery torque/brake safety checklists independently of software stage advancement.

---

## 11. SUSPENSION & TERMINATION

We reserve the right to suspend or terminate access to hosted AutoPulse services immediately in the event of material Terms breach, security compromise, or unlawful usage. Subscriber may stop using local Prototype deployments at any time by clearing application storage and removing local files.

---

## 12. WARRANTY DISCLAIMER

THE SERVICE IS DELIVERED ON AN **"AS IS"** AND **"AS AVAILABLE"** BASIS WITHOUT EXPRESS OR IMPLIED WARRANTIES OF ANY KIND, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR ERROR-FREE OPERATION.

---

## 13. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW, AUTOPULSE SYSTEMS LTD. SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR SPECIAL DAMAGES, LOSS OF PROFITS, CORRUPTION OF LOCAL BROWSER DATA, OR WORKSHOP SERVICE DELAYS ARISING FROM USE OR INABILITY TO USE THE SERVICE. TOTAL AGGREGATE LIABILITY IS CAPPED AT THE FEES PAID BY SUBSCRIBER IN THE PRECEDING TWELVE (12) MONTHS (OR USD \$100 FOR EVALUATION/PROTOTYPE USE).

---

## 14. MODIFICATIONS TO TERMS

AutoPulse may revise these Terms periodically to reflect functional upgrades or regulatory updates. Continued operation after posted revisions constitutes acceptance of updated Terms.

---

## 15. DISPUTE RESOLUTION & CONTACT

Disputes arising out of or relating to these Terms shall first be negotiated in good faith between authorized representatives for thirty (30) days before pursuing formal resolution under the governing law of Licensor's primary jurisdiction.

**Legal & Operations Contact**:  
AutoPulse Systems Ltd.  
Legal Compliance: `legal@autopulse-garage.io`  
Technical Support: `support@autopulse-garage.io`
