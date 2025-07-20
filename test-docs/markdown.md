# TechCorp Help Desk Knowledge Base

## Table of Contents
1. [Network Infrastructure](#network-infrastructure)
2. [User Account Management](#user-account-management)
3. [Software Installation and Licensing](#software-installation-and-licensing)
4. [Hardware Troubleshooting](#hardware-troubleshooting)
5. [Email and Communication Systems](#email-and-communication-systems)
6. [Security Protocols and Incident Response](#security-protocols-and-incident-response)
7. [Cloud Services and SaaS Applications](#cloud-services-and-saas-applications)
8. [Database Administration](#database-administration)
9. [Backup and Recovery Procedures](#backup-and-recovery-procedures)
10. [Mobile Device Management](#mobile-device-management)

## Network Infrastructure

### VPN Connection Issues

**Symptom**: Users cannot connect to corporate VPN
**Common Causes**: 
- Expired certificates
- Firewall blocking VPN ports (UDP 1194, TCP 443)
- Incorrect server configuration
- Network adapter issues

**Resolution Steps**:
1. Verify VPN client version is current (minimum version 2.8.3)
2. Check certificate expiration in VPN client settings
3. Test connectivity to VPN gateway IP 192.168.1.100
4. Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (macOS)
5. Reset network adapter: Device Manager > Network Adapters > Disable/Enable
6. If using Cisco AnyConnect, clear profile cache in `%ProgramData%\Cisco\Cisco AnyConnect Secure Mobility Client\Profile`

**Advanced Troubleshooting**:
- Packet capture analysis using Wireshark on port 1194
- Check MTU settings (recommended: 1200 for VPN tunnels)
- Verify NAT-T is enabled for IPSec connections
- Review event logs for authentication failures

### DHCP Pool Exhaustion

**Symptom**: New devices cannot obtain IP addresses
**Impact**: Critical - affects new device connectivity
**Resolution**:
1. Access DHCP server console (typically Windows Server 2019/2022)
2. Navigate to DHCP > IPv4 > Scope Options
3. Current pool: 192.168.10.100 - 192.168.10.200 (100 addresses)
4. Extend pool to 192.168.10.50 - 192.168.10.250 (200 addresses)
5. Release expired leases older than 7 days
6. Monitor pool utilization - alert when >80% utilized

### Wireless Network Performance Issues

**Common Issues**:
- Channel interference on 2.4GHz band
- Insufficient coverage in conference rooms
- Authentication timeouts with 802.1X

**Optimization Steps**:
1. Conduct wireless site survey using Ekahau or similar tools
2. Separate 2.4GHz and 5GHz SSIDs for better band steering
3. Configure 5GHz channels: 36, 40, 44, 48 (DFS channels 52-144 if supported)
4. Implement band steering ratios: 5GHz preferred, 2.4GHz fallback
5. Adjust power levels: High-density areas (10-15 dBm), Open areas (20 dBm)
6. Enable 802.11k, 802.11r, 802.11v for seamless roaming

## User Account Management

### Active Directory Account Lockouts

**Symptom**: User receives "account locked" error when attempting login
**Diagnostic Process**:
1. Identify lockout source using PowerShell:
   ```powershell
   Search-ADAccount -LockedOut | Select Name,LockedOut,LastLogonDate
   Get-ADUser -Identity "username" -Properties * | Select AccountLockoutTime,BadLogonCount,LastBadPasswordAttempt
   ```
2. Check domain controller event logs (Event ID 4740)
3. Review failed authentication attempts from multiple sources
4. Identify if mobile devices have cached old passwords

**Resolution**:
1. Unlock account: `Unlock-ADAccount -Identity "username"`
2. Force password reset if multiple lockouts occur within 24 hours
3. Clear cached credentials on all user devices
4. Update saved passwords in browsers and applications

### Group Membership and Permissions

**Standard Security Groups**:
- **IT_Admins**: Full administrative access to all systems
- **HR_Staff**: Access to HRIS, payroll systems, employee records
- **Finance_Team**: QuickBooks Enterprise, financial reporting tools
- **Sales_Reps**: CRM access, sales reports, customer databases
- **Marketing_Dept**: Adobe Creative Suite, marketing automation tools
- **Executives**: Executive dashboard access, confidential folder permissions

**Permission Inheritance Model**:
- Department OUs inherit base permissions from parent containers
- Security groups are nested within role-based groups
- File server permissions follow AGDLP model (Account-Global-Domain Local-Permission)
- SharePoint permissions synchronized with AD groups every 4 hours

### Password Policy Enforcement

**Current Policy Requirements**:
- Minimum length: 12 characters
- Complexity: 3 of 4 character types (uppercase, lowercase, numbers, symbols)
- Password history: 24 passwords remembered
- Maximum age: 90 days for standard users, 60 days for privileged accounts
- Account lockout: 5 failed attempts, 30-minute lockout duration

**Self-Service Password Reset**:
- Users must register security questions and alternate email
- SMS verification required for mobile-registered users
- Password reset portal: https://password.techcorp.com
- Alternative: Call help desk for verification (requires manager approval)

## Software Installation and Licensing

### Microsoft Office 365 Deployment

**Standard Configuration**:
- Office 365 E3 licenses for all full-time employees
- Office 365 F3 licenses for part-time and contractor accounts
- Deployment via Microsoft System Center Configuration Manager (SCCM)
- Shared computer activation for terminal server environments

**Installation Troubleshooting**:
1. Clear Office installation cache: `%ProgramData%\Microsoft\ClickToRun\`
2. Run Office uninstall tool: Microsoft Support and Recovery Assistant
3. Check Windows Installer service status
4. Verify sufficient disk space (minimum 4GB free)
5. Install using offline installer for unreliable connections

**License Management**:
- Monitor license usage through Office 365 Admin Center
- Reclaim licenses from inactive users (>90 days no sign-in)
- Assign licenses based on job function matrix
- Track license compliance monthly

### Adobe Creative Suite Management

**License Types**:
- Adobe Creative Cloud for Teams (50 licenses)
- Individual licenses for Photoshop, Illustrator, InDesign
- Deployment via Adobe Admin Console and SCCM

**Common Issues**:
- "License expired" errors due to network connectivity
- Multiple user sign-ins on single license
- Creative Cloud desktop app sync failures

**Resolution Steps**:
1. Sign out and sign in to Creative Cloud desktop app
2. Clear Creative Cloud cache: `%APPDATA%\Adobe\OOBE\`
3. Reset Adobe activation: Adobe CC Cleaner Tool
4. Verify internet connectivity to Adobe licensing servers
5. Check proxy configuration for Adobe domains

### Specialized Software Licensing

**Engineering Software**:
- AutoCAD Network License Manager (25 concurrent licenses)
- SolidWorks PDM Professional (15 licenses)
- MATLAB Campus-Wide License Agreement
- License server: license-srv.techcorp.com (port 27000-27009)

**Accounting Software**:
- QuickBooks Enterprise (10 concurrent users)
- Sage 50 Premium Accounting (5 users)
- TaxAct Professional (3 licenses, seasonal)

**License Monitoring**:
- Weekly license usage reports generated automatically
- Alert system for license utilization >90%
- Annual license renewal calendar maintained
- Vendor relationship management for renewals

## Hardware Troubleshooting

### Desktop Computer Issues

**Common Hardware Failures**:
1. **Hard Drive Failure**
   - Symptoms: SMART errors, clicking sounds, boot failures
   - Diagnostic: Run CHKDSK, CrystalDiskInfo health check
   - Resolution: Replace drive, restore from backup, reinstall OS

2. **Memory (RAM) Issues**
   - Symptoms: Random crashes, blue screens, application errors
   - Diagnostic: Windows Memory Diagnostic, MemTest86
   - Resolution: Reseat memory modules, replace faulty DIMMs

3. **Power Supply Problems**
   - Symptoms: Random shutdowns, failure to power on, unusual noises
   - Diagnostic: Multimeter testing, PSU tester tool
   - Resolution: Replace power supply unit

### Printer Management

**Standard Printer Models**:
- HP LaserJet Enterprise M506dn (office workgroup printers)
- Canon imageRUNNER ADVANCE C3330i (color multifunction)
- Zebra ZT230 (label printing for shipping department)
- Epson WorkForce Pro WF-C869R (high-volume color printing)

**Common Printer Issues**:
1. **Print Spooler Errors**
   - Clear print queue: Services.msc > Print Spooler > Restart
   - Delete stuck jobs from `%WINDIR%\System32\spool\PRINTERS\`
   - Reinstall printer drivers

2. **Network Printer Connectivity**
   - Verify printer IP address and network connectivity
   - Check SNMP configuration and community strings
   - Update printer firmware
   - Reconfigure printer ports in Devices and Printers

3. **Print Quality Issues**
   - Replace toner cartridges when yield drops below 10%
   - Clean paper path and transfer rollers
   - Calibrate color settings for color printers
   - Adjust fuser temperature for different paper types

### Laptop and Mobile Hardware

**Standard Corporate Laptops**:
- Dell Latitude 5420 (standard business laptop)
- Dell Precision 3560 (engineering workstations)
- MacBook Pro 16" (creative professionals)
- Surface Laptop Studio (executive/presentation use)

**Common Laptop Issues**:
1. **Battery Degradation**
   - Check battery health using built-in diagnostics
   - Replace batteries with <80% capacity
   - Implement power management policies
   - Educate users on proper charging habits

2. **Overheating Problems**
   - Clean internal fans and heat sinks
   - Thermal paste replacement (every 3-4 years)
   - Monitor CPU temperatures using HWiNFO64
   - Adjust power profiles for thermal management

3. **Display Issues**
   - External monitor connectivity problems
   - Screen flickering or dead pixels
   - Backlight failure diagnosis
   - Graphics driver updates and rollbacks

## Email and Communication Systems

### Microsoft Exchange Server Management

**Server Configuration**:
- Exchange Server 2019 on Windows Server 2019
- Database Availability Group (DAG) with 3 nodes
- Mailbox databases: 500GB maximum size per database
- Transport rules for compliance and security

**Common Exchange Issues**:
1. **Mailbox Full Errors**
   - Standard mailbox limit: 50GB
   - Executive mailbox limit: 100GB
   - Archive mailbox auto-expansion enabled
   - Retention policies: 7 years for business emails

2. **Mail Flow Problems**
   - Check message tracking logs
   - Verify transport rules and connectors
   - Test mail flow using Exchange Management Shell
   - Monitor queue health and delivery delays

3. **Outlook Connectivity Issues**
   - Autodiscover configuration verification
   - Profile corruption and rebuilding
   - Cached Exchange Mode optimization
   - Authentication issues with Modern Auth

### Microsoft Teams Administration

**Teams Environment**:
- Teams Enterprise license for all users
- Integration with SharePoint Online and OneDrive
- External guest access enabled with restrictions
- Audio/video conferencing with dial-in capability

**Common Teams Issues**:
1. **Audio/Video Quality Problems**
   - Network bandwidth assessment (minimum 1.5 Mbps upload/download)
   - Camera and microphone driver updates
   - Teams app cache clearing
   - Media optimization for VDI environments

2. **Meeting and Calling Issues**
   - PSTN calling configuration and routing
   - Meeting recording storage and retention
   - Screen sharing and application sharing problems
   - External participant access restrictions

3. **Teams Integration Problems**
   - SharePoint file access and permissions
   - Power Automate workflow integration
   - Third-party app integration management
   - Guest access policy enforcement

### Voice over IP (VoIP) System

**VoIP Infrastructure**:
- Cisco Unified Communications Manager (CUCM) 12.5
- Cisco Unity Connection for voicemail
- SIP trunking with primary carrier (Verizon)
- Quality of Service (QoS) configuration for voice traffic

**Phone System Features**:
- Direct Inward Dialing (DID) numbers for all employees
- Call forwarding and find-me/follow-me services
- Conference bridge capacity: 50 concurrent participants
- Call recording for compliance (sales and support calls)

**VoIP Troubleshooting**:
1. **Call Quality Issues**
   - Packet loss and jitter analysis
   - Codec selection (G.711, G.729)
   - Network QoS policy verification
   - Echo cancellation configuration

2. **Registration Problems**
   - SIP authentication failures
   - Network connectivity to CUCM servers
   - Firewall rules for SIP signaling
   - Phone firmware updates

## Security Protocols and Incident Response

### Endpoint Protection

**Antivirus/Anti-malware Solution**:
- Symantec Endpoint Protection (SEP) 14.3
- Real-time protection enabled on all endpoints
- Scheduled full system scans weekly
- Quarantine policies and exception management

**Endpoint Detection and Response (EDR)**:
- CrowdStrike Falcon deployment across all systems
- 24/7 threat hunting and incident response
- Integration with SIEM system (Splunk Enterprise Security)
- Automated containment for high-severity threats

### Incident Response Procedures

**Incident Classification**:
- **Critical**: Data breach, ransomware, system compromise
- **High**: Malware detection, unauthorized access attempts
- **Medium**: Policy violations, suspicious network activity
- **Low**: False positive alerts, minor security events

**Response Timeline**:
- Critical incidents: Initial response within 15 minutes
- High priority: Response within 1 hour
- Medium priority: Response within 4 hours
- Low priority: Response within 24 hours

**Incident Response Team**:
- Incident Commander: IT Security Manager
- Technical Lead: Senior Network Administrator
- Communications: IT Manager
- Legal Liaison: General Counsel (for data breach incidents)

### Data Loss Prevention (DLP)

**DLP Policies**:
- Credit card number detection and blocking
- Social Security number protection
- Intellectual property classification and handling
- Email encryption for sensitive data transmission

**Monitoring and Enforcement**:
- Symantec DLP monitoring all email, web, and file transfers
- Policy violations logged and reported monthly
- User education and training for policy awareness
- Quarterly DLP policy review and updates

### Multi-Factor Authentication (MFA)

**MFA Implementation**:
- Microsoft Authenticator app (primary method)
- SMS backup authentication
- Hardware tokens for privileged accounts (YubiKey)
- Emergency bypass codes for account recovery

**MFA Policies**:
- Required for all administrative accounts
- Required for external access (VPN, remote desktop)
- Optional but encouraged for standard user accounts
- Conditional access based on risk assessment

## Cloud Services and SaaS Applications

### Microsoft Azure Environment

**Azure Subscription Management**:
- Production subscription: Azure Enterprise Agreement
- Development/testing: Pay-as-you-go subscription
- Resource groups organized by department and project
- Cost management alerts at 80% of monthly budget

**Azure Services in Use**:
- Azure Virtual Machines (Windows and Linux)
- Azure SQL Database (managed instance)
- Azure Active Directory Premium P1
- Azure Backup and Site Recovery
- Azure Monitor and Log Analytics

**Common Azure Issues**:
1. **Virtual Machine Performance**
   - CPU and memory utilization monitoring
   - Disk IOPS and throughput analysis
   - Network latency and bandwidth issues
   - VM sizing recommendations and scaling

2. **Azure AD Synchronization**
   - Azure AD Connect health monitoring
   - Password hash synchronization issues
   - Group membership synchronization delays
   - Conditional access policy troubleshooting

### Software as a Service (SaaS) Management

**Primary SaaS Applications**:
- Salesforce CRM (Sales Cloud and Service Cloud)
- Slack (Enterprise Grid)
- Zoom (Business plan with 500 licenses)
- DocuSign (Business Pro)
- Box (Business plan for file sharing)

**SaaS Integration Challenges**:
1. **Single Sign-On (SSO) Configuration**
   - SAML 2.0 integration with Azure AD
   - User provisioning and de-provisioning
   - Attribute mapping and claims configuration
   - SSO troubleshooting and log analysis

2. **Data Integration and APIs**
   - Salesforce-to-ERP data synchronization
   - Custom API development and maintenance
   - Rate limiting and error handling
   - Data mapping and transformation

3. **License Management**
   - Usage monitoring and optimization
   - License harvesting from inactive users
   - Renewal management and budget planning
   - Vendor relationship management

### Backup and Disaster Recovery

**Backup Strategy**:
- Local backups: Veeam Backup & Replication
- Cloud backups: Azure Backup for critical systems
- File server backups: Daily incremental, weekly full
- Database backups: Transaction log every 15 minutes, full daily

**Recovery Time Objectives (RTO)**:
- Critical systems (Email, AD): 2 hours
- Business applications (ERP, CRM): 4 hours
- File servers and shared drives: 8 hours
- Non-critical systems: 24 hours

**Recovery Point Objectives (RPO)**:
- Critical databases: 15 minutes
- Email systems: 1 hour
- File servers: 4 hours
- Workstation data: 24 hours

**Disaster Recovery Testing**:
- Quarterly failover tests for critical systems
- Annual full disaster recovery exercise
- Documentation updates after each test
- Lessons learned and improvement plans

## Database Administration

### SQL Server Management

**SQL Server Environment**:
- SQL Server 2019 Enterprise Edition
- Always On Availability Groups (3-node cluster)
- Database mirroring for secondary databases
- Regular maintenance plans and index optimization

**Common Database Issues**:
1. **Performance Problems**
   - Query execution plan analysis
   - Index fragmentation and maintenance
   - Database statistics updates
   - Blocking and deadlock resolution

2. **Backup and Recovery**
   - Full backup strategy and scheduling
   - Point-in-time recovery procedures
   - Backup file integrity verification
   - Recovery testing and validation

3. **Security and Compliance**
   - SQL Server authentication modes
   - User account and permission management
   - Transparent Data Encryption (TDE)
   - Audit trail configuration and monitoring

### Oracle Database Administration

**Oracle Environment**:
- Oracle Database 19c Enterprise Edition
- Real Application Clusters (RAC) configuration
- Oracle Data Guard for disaster recovery
- Enterprise Manager for monitoring and management

**Oracle-Specific Tasks**:
1. **Tablespace Management**
   - Space allocation and growth monitoring
   - Datafile management and optimization
   - Temporary tablespace configuration
   - Archive log management and cleanup

2. **Performance Tuning**
   - SQL tuning advisor recommendations
   - Memory allocation (SGA/PGA) optimization
   - Wait event analysis and resolution
   - Oracle Automatic Workload Repository (AWR) reports

### MySQL/MariaDB Administration

**Open Source Database Environment**:
- MySQL 8.0 Community Edition
- MariaDB 10.6 for web applications
- Master-slave replication configuration
- phpMyAdmin for web-based administration

**Common MySQL Issues**:
1. **Connection Problems**
   - Max connections configuration
   - User account and privilege management
   - Host-based access restrictions
   - SSL certificate configuration

2. **Replication Issues**
   - Master-slave synchronization problems
   - Binary log configuration and rotation
   - Slave lag monitoring and resolution
   - Failover procedures and automation

## Mobile Device Management

### Microsoft Intune Implementation

**Device Management Policies**:
- iOS and Android device enrollment
- App deployment and management
- Device compliance policies
- Conditional access integration

**Security Policies**:
- Device encryption requirements
- PIN/password complexity enforcement
- Remote wipe capabilities for lost devices
- App data protection and containerization

**Common MDM Issues**:
1. **Enrollment Problems**
   - Apple Business Manager integration
   - Google Play Managed configurations
   - Certificate-based authentication
   - Device registration troubleshooting

2. **App Deployment Issues**
   - Line-of-business (LOB) app distribution
   - App store connectivity problems
   - App update and patch management
   - User self-service portal issues

### BYOD (Bring Your Own Device) Policies

**BYOD Requirements**:
- Device registration in Intune required
- Minimum OS version requirements
- Security app installation mandatory
- Personal/corporate data separation

**Supported BYOD Platforms**:
- iOS 14.0 and later
- Android 9.0 and later (Samsung Knox preferred)
- Windows 10/11 (limited support)
- macOS (case-by-case approval)

**Data Protection Measures**:
- Microsoft Intune App Protection Policies
- Conditional access based on device compliance
- Remote selective wipe for corporate data
- VPN access restricted to compliant devices

## Escalation Procedures and Contact Information

### Internal Escalation Matrix

**Level 1 Support (Help Desk Technicians)**:
- Password resets and account unlocks
- Basic software installation and troubleshooting
- Printer and peripheral support
- Standard hardware replacement

**Level 2 Support (Senior Technicians)**:
- Complex software issues and configuration
- Network connectivity problems
- Server and infrastructure issues
- Security incident initial response

**Level 3 Support (Specialists and Administrators)**:
- Advanced server and network administration
- Database performance and optimization
- Security incident investigation and remediation
- Custom application development and integration

### Vendor Contact Information

**Critical Vendors**:
- **Microsoft Premier Support**: 1-800-MICROSOFT (Priority 1 incidents)
- **Cisco TAC**: 1-800-553-2447 (SmartNet coverage)
- **VMware GSS**: 1-877-486-9273 (Production Support)
- **Symantec Enterprise Support**: 1-800-745-6274 (24/7 coverage)

**Service Level Agreements (SLAs)**:
- Priority 1 (System Down): 2-hour response time
- Priority 2 (Severely Impaired): 4-hour response time
- Priority 3 (Moderately Impaired): 8-hour response time
- Priority 4 (Minimally Impaired): 24-hour response time

### Change Management Process

**Change Categories**:
- **Emergency Changes**: Critical security patches, system failures
- **Standard Changes**: Pre-approved, low-risk changes
- **Major Changes**: Significant system modifications, new deployments
- **Minor Changes**: Configuration updates, software updates

**Change Approval Board (CAB)**:
- IT Manager (Chair)
- Network Administrator
- Database Administrator
- Information Security Officer
- Business Representative

**Change Implementation Windows**:
- Emergency: Immediate implementation with post-approval
- Standard: Weekly implementation window (Saturday 6 PM - Sunday 6 AM)
- Major: Monthly planned maintenance window (Third Saturday of month)
- Minor: Any time during business hours with minimal impact

### Knowledge Base Maintenance

**Documentation Standards**:
- All procedures must be tested and validated
- Screenshots updated with each software version change
- Review and update cycle: Quarterly for critical procedures
- Version control using SharePoint document libraries

**Knowledge Base Categories**:
- Troubleshooting guides and step-by-step procedures
- Configuration templates and best practices
- Emergency response procedures and contact lists
- Training materials and user guides

**Continuous Improvement Process**:
- Monthly review of help desk ticket trends
- Identification of knowledge gaps and documentation needs
- User feedback integration and procedure refinement
- Training material development and delivery

---

*This knowledge base document is maintained by the TechCorp IT Department and is updated quarterly. Last revision: December 2024. For questions or corrections, contact the Help Desk at helpdesk@techcorp.com or extension 4357.*
