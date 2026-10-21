# AutoPulse™ Garage & Network Management System
## Terms and Conditions of Service (T&C)
**Last Updated:** October 2026  
**Effective Date:** October 2026  

---

### IMPORTANT NOTICE:
PLEASE READ THESE TERMS AND CONDITIONS ("TERMS", "AGREEMENT") CAREFULLY BEFORE DOWNLOADING, ACCESSING, OR USING THE AUTOPULSE™ MOBILE APPLICATION, BACK-OFFICE WEB DASHBOARD, API SERVICES, OR RELATED SOFTWARE PLATFORMS (COLLECTIVELY, THE "SERVICE").

BY CREATING AN ACCOUNT, INSTALLING THE AUTOPULSE ANDROID APPLICATION, OR COMMENCING USE OF THE SERVICE, YOU ("CUSTOMER", "GARAGE OPERATOR", "YOU", OR "YOUR") AGREE TO BE BOUND BY ALL PROVISIONS SET FORTH IN THIS AGREEMENT. IF YOU DO NOT AGREE TO THESE TERMS, DO NOT INSTALL, ACCESS, OR USE THE SERVICE.

---

## 1. Definitions and Interpretation

1.1 **"AutoPulse"**, **"Company"**, **"We"**, **"Us"**, or **"Our"** refers to AutoPulse Systems Ltd., the provider of the workshop operations platform and accompanying cloud infrastructure.  
1.2 **"Garage Operator"** refers to the registered legal entity, business, or individual operating one or more vehicle repair shops, body shops, or maintenance service centers.  
1.3 **"Authorized User"** means any employee, contractor, service advisor, workshop manager, or mechanic granted login access by the Garage Operator.  
1.4 **"Customer Data"** means all digital records, Vehicle Identification Numbers (VIN), license plate identifiers, vehicle photos, DVI inspection damage maps, customer contact details, and repair invoices created, ingested, or stored through the Service.  
1.5 **"Local Outbox Data"** refers to transactional records stored locally on Android devices in Room SQLite database partitions awaiting synchronization with the AutoPulse Cloud.  
1.6 **"DVI System"** refers to the Digital Vehicle Inspection 360° wireframe and digital condition logging functionality.  

---

## 2. Eligibility, Account Registration, and Access Control

2.1 **Business Entity Representation:** The individual creating an administrative account on behalf of a garage or garage network warrants that they possess legal authority to bind said business entity to these Terms.  
2.2 **Credential Confidentiality:** The Garage Operator is solely responsible for maintaining the confidentiality of administrative passwords, PINs, and device security credentials. Any activity conducted through authorized accounts shall be deemed the authorized action of the Garage Operator.  
2.3 **Role-Based Permissions:** The Garage Operator shall restrict technician access to operational sectors (e.g., Job Cards, DVI, Clock-In) and safeguard executive sectors (Sales Insights, Gross Margins, and Bank Disbursal settings) via appropriate role assignments.  

---

## 3. License Grant and Permitted Use

3.1 **Commercial SaaS License:** Subject to compliance with this Agreement and timely payment of subscription fees, AutoPulse grants the Garage Operator a non-exclusive, non-transferable, revocable, limited license to:
- Install and execute the AutoPulse Android Application (APK) across authorized workshop tablets, smartphones, and bay terminals;
- Access and utilize the Back-Office Web Dashboard for administrative, inventory, and financial monitoring.
3.2 **Multi-Branch Networking:** If subscribed under an Enterprise or Multi-Branch tier, the Garage Operator may interlink multiple physical garage locations, share parts catalogs, and transfer inventory across branches subject to license quotas.  
3.3 **Restrictions:** You agree that You and Your Authorized Users shall NOT:
- Decompile, reverse engineer, disassemble, or attempt to derive the source code of the AutoPulse APK or cloud services;
- Resell, sublicense, lease, or commercially distribute the Service to independent third-party workshops without written authorization;
- Use the Service to construct a competing automotive workshop management platform;
- Circumvent or tamper with local database encryption, license keys, or network synchronization protocols.

---

## 4. Vehicle Customer Data, Privacy & Communications

4.1 **Data Ownership:** As between the parties, the Garage Operator retains all ownership, title, and intellectual property rights in and to Customer Data (vehicle repair histories, customer personal details, and business billing records).  
4.2 **Privacy Regulations Compliance:** The Garage Operator is the Data Controller, and AutoPulse acts as the Data Processor. The Garage Operator warrants that it has collected all necessary consents from vehicle owners required under applicable laws (including GDPR, CCPA, and national privacy statutes) prior to ingesting:
- Customer names, phone numbers, and home/business addresses;
- License plates, registration certificates, and Vehicle Identification Numbers (VIN);
- Pre-existing vehicle damage imagery and inspection reports.
4.3 **Automated Customer Communications (SMS / WhatsApp):**
- The Service provides functionality to transmit repair progress updates, DVI inspection summaries, and payment reminders via WhatsApp or SMS.
- The Garage Operator represents that all recipients have provided valid opt-in authorization to receive transactional workshop notifications. AutoPulse accepts no liability for unsolicited messages or regulatory fines stemming from spam compliance breaches.

---

## 5. Digital Vehicle Inspection (DVI) & Mechanical Disclaimers

5.1 **Visual Documentation Aid Only:** The DVI 360° wireframe tool is designed solely to facilitate visual documentation of observable scratches, dents, and body panel damage at the time of intake.  
5.2 **No Mechanical Safety Certification:** AutoPulse does NOT certify, guarantee, or warrant that a vehicle marked "Passed" or "QC Complete" is mechanically roadworthy, compliant with highway safety standards, or free of latent mechanical, structural, or electronic defects.  
5.3 **Sole Professional Responsibility:** Qualified mechanics, licensed inspectors, and shop foremen retain exclusive professional and legal liability for all diagnostic determinations, repair procedures, torque specifications, and road test evaluations performed on customer vehicles.  

---

## 6. Offline-First Operations, Local Room DB & Cloud Sync

6.1 **Local Data Resilience:** AutoPulse utilizes an offline-first architecture powered by Android Room SQLite local storage to facilitate continuous shop-floor operations during network outages.  
6.2 **Synchronization Obligation:**
- Mutations performed while offline are queued in the local device Outbox.
- The Garage Operator must ensure devices are connected to an active internet network periodically to flush queued mutations and pull global database updates.
6.3 **Risk of Local Storage Loss:** If an Android device is physically damaged, submerged, destroyed, stolen, or factory-reset while containing un-synchronized Outbox data, that un-synced data may be permanently lost. AutoPulse disclaims all liability for un-synced local data destroyed prior to successful cloud transmission.  
6.4 **Conflict Resolution:** In rare instances where two technicians modify the same job card or deduct identical inventory SKUs simultaneously while offline, the Service applies automated conflict resolution rules (e.g., Last-Write-Wins or server timestamp precedence). The Garage Operator acknowledges that operational discrepancies resulting from concurrent offline edits must be reviewed and reconciled by the shop manager.

---

## 7. Parts Catalog, Inventory, and Supplier Integrations

7.1 **Catalog Accuracy:** While AutoPulse provides structured parts catalogs and OEM numbering fields, the Company does not warrant the merchantability, vehicle compatibility, or cross-reference accuracy of third-party automotive replacement parts.  
7.2 **Technician Verification:** Certified technicians must physically verify that ordered replacement parts (e.g., brake calipers, suspension control arms, timing belts) match the physical dimensions and manufacturer specifications of the target vehicle before installation.  

---

## 8. Financial Insights, Taxes & Invoicing

8.1 **Tax Calculation Disclaimers:** Financial reporting metrics (Average Repair Order, Gross Profit Margins, and Labor vs. Parts splits) are operational estimates calculated based on user-entered values.  
8.2 **Accounting Compliance:** AutoPulse is not a certified public accounting firm. The Garage Operator is responsible for verifying that generated invoices comply with local Value Added Tax (VAT), Goods and Services Tax (GST), or state sales tax laws before dispatching to customers or tax authorities.  

---

## 9. Service Availability, Maintenance & SLAs

9.1 **Uptime Target:** AutoPulse endeavors to maintain a 99.5% availability target for its cloud synchronization infrastructure, excluding scheduled maintenance windows.  
9.2 **Maintenance Windows:** Routine cloud database maintenance and upgrades will be announced in advance and performed during low-traffic hours whenever commercially reasonable.  
9.3 **Emergency Downtime:** AutoPulse reserves the right to suspend cloud connectivity without prior notice in the event of severe security incidents, distributed denial of service (DDoS) attacks, or critical zero-day patch deployments. During such events, local Android Room DB functionality remains operational on local devices.  

---

## 10. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
10.1 **EXCLUSION OF CONSEQUENTIAL DAMAGES:** IN NO EVENT SHALL AUTOPULSE, ITS DIRECTORS, EMPLOYEES, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, EXEMPLARY, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, SHOP REVENUE, WORKSHOP REPUTATION, BUSINESS INTERRUPTION, LOSS OF CUSTOMER DATA, OR VEHICLE DAMAGE ARISEN OUT OF OR IN CONNECTION WITH THE USE OR INABILITY TO USE THE SERVICE.  
10.2 **AGGREGATE MONETARY CAP:** IN ALL CASES, AUTOPULSE'S TOTAL CUMULATIVE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, SHALL BE STRICTLY LIMITED TO THE TOTAL AMOUNT ACTUALLY PAID BY THE GARAGE OPERATOR TO AUTOPULSE FOR THE SERVICE IN THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE INCIDENT GIVING RISE TO LIABILITY.  

---

## 11. Indemnification

The Garage Operator agrees to defend, indemnify, and hold harmless AutoPulse and its officers, directors, and agents against any claims, liabilities, damages, losses, or legal expenses (including reasonable attorney fees) arising from:
- Any bodily injury, vehicle accident, or mechanical failure occurring in connection with repairs recorded or managed on the Service;
- Any violation of applicable vehicle data protection, privacy, or consumer protection statutes by the Garage Operator;
- Any dispute between the Garage Operator and its vehicle customers or parts vendors.

---

## 12. Term, Suspension, and Termination

12.1 **Term:** This Agreement commences upon account registration or installation of the APK and continues until terminated.  
12.2 **Termination for Cause:** AutoPulse may immediately suspend or terminate access if the Garage Operator breaches these Terms, fails to pay subscription fees, or engages in fraudulent workshop practices.  
12.3 **Data Portability Upon Termination:** Upon written request within thirty (30) days of termination, AutoPulse will provide a structured export of the Garage Operator's Customer Data (CSV/JSON formatted vehicle repair histories, inventory catalogs, and past invoices). After 30 days, AutoPulse reserves the right to securely purge all customer records.  

---

## 13. Modifications to Terms

AutoPulse reserves the right to revise these Terms at any time. Notice of material modifications will be delivered via in-app broadcast or email thirty (30) days prior to enforcement. Continued use of the Service following the effective date of updated Terms constitutes full acceptance.

---

## 14. Governing Law and Dispute Resolution

14.1 **Governing Law:** These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AutoPulse Systems Ltd. is registered, without regard to its conflict of law principles.  
14.2 **Arbitration:** Any controversy or claim arising out of or relating to this Agreement shall be settled by binding commercial arbitration conducted in the English language.  

---

## 15. Contact & Support Escalation

For questions concerning these Terms and Conditions or enterprise service agreements, please contact:
- **Legal Department:** legal@autopulse-garage.io  
- **Customer Support:** support@autopulse-garage.io  
- **Corporate Address:** AutoPulse Systems Ltd., Operational Software Division.
