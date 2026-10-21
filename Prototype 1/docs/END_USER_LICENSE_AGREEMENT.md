# AutoPulse™ Garage & Network Management System
## End User License Agreement (EULA)
**Application:** AutoPulse Mobile Client for Android (`AutoPulse-v1.0-debug.apk` / Production Builds)  
**Package Identifier:** `com.autopulse.garage`  
**Effective Date:** October 2026  

---

### IMPORTANT — READ CAREFULLY BEFORE DOWNLOADING OR INSTALLING:
THIS END USER LICENSE AGREEMENT ("EULA", "AGREEMENT") IS A LEGALLY BINDING CONTRACT BETWEEN YOU (EITHER AN INDIVIDUAL WORKSHOP TECHNICIAN OR A CORPORATE GARAGE OPERATOR, HEREINAFTER "END USER", "LICENSEE", OR "YOU") AND AUTOPULSE SYSTEMS LTD. ("LICENSOR", "AUTOPULSE", OR "WE").

BY CLICKING "INSTALL", SIDELOADING THE ANDROID APPLICATION PACKAGE (APK), LAUNCHING THE APPLICATION, OR ACCESSING ANY PORTION OF THE AUTOPULSE SOFTWARE, YOU EXPRESSLY AGREE TO BE BOUND BY THE TERMS OF THIS EULA. IF YOU DO NOT AGREE WITH THE TERMS OF THIS AGREEMENT, DO NOT DOWNLOAD, INSTALL, OR RUN THE APPLICATION, AND PROMPTLY DELETE ALL COPIES OF THE APK FROM YOUR DEVICES.

---

## 1. Grant of License

1.1 **Limited License:** AutoPulse hereby grants You a limited, non-exclusive, non-transferable, revocable license to download, install, and execute the AutoPulse Android Application ("Application", "Software") on compatible Android-powered smartphones, tablets, and ruggedized shop-floor handheld terminals solely for Your internal automotive repair and garage management business operations.  
1.2 **Authorized Scope:** This license is granted strictly in connection with Your authorized subscription or trial access to the AutoPulse Cloud platform. The number of active devices executing the Software must not exceed the device quota permitted under Your active service tier.  
1.3 **No Sale of Software:** The Software is licensed, not sold. You obtain no title, copyright, ownership rights, or trade secret interests in or to the Application or any underlying algorithms, UI designs, or database schemas.  

---

## 2. Permitted Use and Deployment

You are entitled to:
- Install the Application across authorized workshop bay devices (e.g., service counter tablets, diagnostic cart mounts, technician smartphones);
- Utilize the offline-first Room SQLite database caching system to record vehicle job cards, perform 360° Digital Vehicle Inspections (DVI), track labor time, and scan parts barcodes during periods of network disconnection;
- Sync local outbox records with the AutoPulse Cloud backend once active network connectivity is restored.

---

## 3. Restrictions on Use

You shall NOT, and shall not permit any employee, technician, or third party to:
3.1 **Reverse Engineer:** Decompile, disassemble, decrypt, reverse engineer, or attempt to reconstruct the human-readable source code, bytecode, or Room SQLite database architecture of the Application, except to the extent permitted by mandatory statutory law;  
3.2 **Modify or Derivative Works:** Modify, translate, adapt, alter, or create derivative works based upon the Application or any component thereof;  
3.3 **Redistribution:** Sublicense, rent, lease, lend, sell, redistribute, host, or commercially exploit the APK binary to any independent automotive repair facility without an executed Enterprise Reseller Agreement;  
3.4 **Bypass Protection:** Tamper with, circumvent, or disable any digital rights management (DRM), network sync authentication headers, device registration tokens, or multi-branch security filters built into the Software;  
3.5 **Malicious Interference:** Introduce viruses, malware, corrupted database injections, or automated scrapers designed to destabilize the synchronization bridge between local Room SQLite and cloud servers.

---

## 4. Updates, Upgrades, and Database Migrations

4.1 **Automatic Updates:** AutoPulse may, from time to time, issue updates, maintenance patches, or feature upgrades for the Application. Certain updates may be deployed Over-The-Air (OTA) or require manual installation of an updated APK binary.  
4.2 **Database Migrations:** The Application includes automated database migration logic for its local Room SQLite cache. While AutoPulse designs migrations to preserve stored job records and outbox queues, You are advised to connect all devices to the network and ensure the outbox is completely cleared prior to installing major version upgrades.  
4.3 **End of Life Support:** AutoPulse reserves the right to discontinue support for legacy Android operating system versions (e.g., Android versions below API 28) upon sixty (60) days prior notification.

---

## 5. Third-Party & Open-Source Components

5.1 The Application incorporates certain open-source software libraries, runtimes, and frameworks, each governed by its respective open-source license:
- **Capacitor Android Core & Plugins:** Licensed under the MIT License;
- **Android Jetpack / Room Persistence Library:** Licensed under the Apache License, Version 2.0;
- **Lucide Icons & Web Components:** Licensed under the ISC License;
- **Microsoft OpenJDK / Android Toolchain:** Licensed under the GPL v2 with Classpath Exception.
5.2 Nothing in this EULA limits or overrides your rights under the applicable open-source licenses governing these third-party components.

---

## 6. Device Telemetry & Diagnostic Information

6.1 **Anonymous Diagnostic Logging:** To maintain system stability and optimize the offline-to-cloud synchronization protocol, the Application may collect anonymous diagnostic and operational telemetry, including:
- Device model, Android OS version, and display density;
- Outbox sync latency and transmission retry metrics;
- Unhandled application crash traces and optical barcode scanner failure rates.
6.2 **No Personal Telemetry Harvesting:** Telemetry transmissions do NOT harvest customer personal identifying information, customer banking records, or detailed proprietary garage pricing without explicit consent.

---

## 7. Security of Physical Devices

7.1 The Licensee acknowledges that because the Application utilizes an offline-first Room SQLite database, customer vehicle records, VINs, and workshop invoices are stored on the physical client hardware.  
7.2 **Licensee Security Obligations:** You agree to enforce reasonable physical and digital security controls on all workshop devices, including:
- Enforcing device PIN codes, biometric authentication, or screen locks;
- Promptly revoking access credentials or wiping devices that are lost, stolen, or assigned to departing employees;
- Restricting installation of untrusted third-party APKs on dedicated workshop terminals.

---

## 8. Disclaimer of Warranties

8.1 **"AS IS" WARRANTY DISCLAIMER:** TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE APPLICATION IS PROVIDED TO YOU "AS IS" AND "AS AVAILABLE", WITH ALL FAULTS AND DEFECTS, WITHOUT WARRANTY OF ANY KIND.  
8.2 AUTOPULSE EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.  
8.3 WITHOUT LIMITING THE FOREGOING, AUTOPULSE MAKES NO WARRANTY THAT THE APPLICATION WILL MEET YOUR SPECIFIC WORKSHOP REQUIREMENTS, OPERATE WITHOUT INTERRUPTION, BE COMPLETELY ERROR-FREE IN UNDERGROUND SERVICE PITS, OR DETECT EVERY INSTANCE OF PRE-EXISTING VEHICLE DAMAGE VIA THE DVI SYSTEM.

---

## 9. Limitation of Liability

9.1 **NO LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL LOSSES:** UNDER NO CIRCUMSTANCES SHALL AUTOPULSE OR ITS SUPPLIERS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, PUNITIVE, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF PROFITS, SHOP DELAYS, MECHANIC DOWNTIME, VEHICLE DAMAGE, OR LOSS OF DATA) ARISING OUT OF THE USE OF OR INABILITY TO USE THE APPLICATION.  
9.2 **STATUTORY REMEDY:** IF APPLICABLE LAW DOES NOT PERMIT THE COMPLETE EXCLUSION OF LIABILITY, AUTOPULSE'S MAXIMUM AGGREGATE LIABILITY UNDER THIS EULA SHALL NOT EXCEED THE AMOUNT ACTUALLY PAID BY YOU FOR THE INDIVIDUAL CLIENT SOFTWARE LICENSE OR FIFTY DOLLARS ($50.00 USD), WHICHEVER IS LESS.

---

## 10. Term and Termination

10.1 **Term:** This EULA is effective from the date You first install or use the Application and remains in force until terminated.  
10.2 **Automatic Termination:** Your rights under this Agreement will terminate automatically without notice from AutoPulse if You fail to comply with any provision of this EULA or if Your overarching subscription to the AutoPulse Service expires.  
10.3 **Obligations Upon Termination:** Upon termination, You must immediately cease all use of the Application and permanently delete, uninstall, and destroy all copies of the APK binary, installation files, and local Room SQLite cache stored on Your devices.

---

## 11. Export Controls and Legal Compliance

You warrant that You will not export or re-export the Application, directly or indirectly, to any country, entity, or individual subject to international trade sanctions or embargoes in violation of applicable laws.

---

## 12. Severability and Entire Agreement

If any provision of this EULA is held to be invalid or unenforceable under applicable law, such provision will be modified to the minimum extent necessary to accomplish its objectives, and the remaining provisions will continue in full force and effect. This EULA, together with the AutoPulse Terms and Conditions, constitutes the complete and exclusive agreement between the parties with respect to the Software.

---

## 13. Contact Information

For inquiries regarding this End User License Agreement, open-source compliance, or enterprise deployment agreements, contact:

**AutoPulse Systems Ltd.**  
Software Licensing & Compliance Division  
Email: license@autopulse-garage.io  
Technical Support: support@autopulse-garage.io  
Website: https://autopulse-garage.io  
