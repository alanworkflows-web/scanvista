import React from 'react';
import { LegalDocumentLayout } from '../LegalDocumentLayout';
import { LEGAL_CONTACT } from '../../../lib/legalConstants';

export function SecurityPolicy() {
  return (
    <LegalDocumentLayout 
      title="Security Policy"
      description="ScanVista Security Policy detailing how we protect customer data and platform integrity."
    >
      <p>
        ScanVista is committed to protecting the confidentiality, integrity, and availability of our platform and the information
        entrusted to us by hospitality businesses and their guests.
      </p>
      <p>
        This Security Policy describes the security principles, practices, and responsibilities that support the operation of
        ScanVista.
      </p>
      <p>
        This policy should be read together with the Privacy Policy, Terms of Service, and Data Retention & Deletion Policy.
      </p>

      <h2>1. Purpose</h2>
      <p>The purpose of this Security Policy is to:</p>
      <ul>
        <li>Protect customer information.</li>
        <li>Protect guest-facing property content.</li>
        <li>Reduce cybersecurity risks.</li>
        <li>Promote responsible security practices.</li>
        <li>Support secure operation of the ScanVista platform.</li>
      </ul>

      <h2>2. Scope</h2>
      <p>This policy applies to:</p>
      <ul>
        <li>ScanVista web applications</li>
        <li>Administrative dashboard</li>
        <li>Guest-facing pages</li>
        <li>APIs</li>
        <li>Databases</li>
        <li>Cloud infrastructure</li>
        <li>Employees, contractors, and authorized service providers (if applicable)</li>
      </ul>

      <h2>3. Security Principles</h2>
      <p>ScanVista is designed around the following principles:</p>
      <ul>
        <li>Least privilege access</li>
        <li>Secure authentication</li>
        <li>Defense in depth</li>
        <li>Data minimization</li>
        <li>Secure software development</li>
        <li>Continuous improvement</li>
        <li>Risk-based decision making</li>
      </ul>

      <h2>4. Authentication</h2>
      <p>Manager accounts are protected through secure authentication mechanisms.</p>
      <p>Security measures may include:</p>
      <ul>
        <li>Secure password hashing using industry-standard algorithms</li>
        <li>Session management</li>
        <li>Automatic session expiration after inactivity</li>
        <li>Login validation</li>
        <li>Protection against unauthorized access</li>
      </ul>
      <p>Managers are responsible for maintaining the confidentiality of their login credentials.</p>

      <h2>5. Authorization</h2>
      <p>
        ScanVista enforces authorization controls to help ensure users can access only the resources they are permitted to
        manage.
      </p>
      <p>Examples include:</p>
      <ul>
        <li>Property-level access controls</li>
        <li>Role-based permissions (where implemented)</li>
        <li>Server-side authorization checks</li>
        <li>Ownership verification before modifying protected resources</li>
      </ul>
      <p>Users must not attempt to access data belonging to other organizations or properties.</p>

      <h2>6. Encryption</h2>
      <p>ScanVista is designed to protect information using modern encryption practices.</p>
      <p>These may include:</p>
      <ul>
        <li>HTTPS/TLS encryption for data transmitted over public networks</li>
        <li>Encrypted passwords</li>
        <li>Encryption provided by cloud infrastructure where available</li>
      </ul>
      <p>Sensitive credentials should never be transmitted in plain text.</p>

      <h2>7. Infrastructure Security</h2>
      <p>ScanVista uses commercially reasonable measures to help secure its infrastructure.</p>
      <p>Examples include:</p>
      <ul>
        <li>Secure cloud hosting</li>
        <li>Network protections</li>
        <li>Firewall configurations</li>
        <li>Access restrictions</li>
        <li>Environment separation where practical</li>
        <li>Infrastructure monitoring</li>
      </ul>

      <h2>8. Application Security</h2>
      <p>ScanVista follows secure software development practices intended to reduce common security risks.</p>
      <p>Examples include:</p>
      <ul>
        <li>Input validation</li>
        <li>Output encoding</li>
        <li>Server-side validation</li>
        <li>Authentication enforcement</li>
        <li>Authorization verification</li>
        <li>Error handling</li>
        <li>Protection against common web application vulnerabilities</li>
      </ul>

      <h2>9. File Upload Security</h2>
      <p>Where file uploads are supported, ScanVista may implement controls such as:</p>
      <ul>
        <li>File type validation</li>
        <li>File size limits</li>
        <li>Secure storage</li>
        <li>Randomized file names</li>
        <li>Malware scanning where available</li>
        <li>Access restrictions</li>
      </ul>
      <p>Users must not upload malicious, illegal, or unauthorized content.</p>

      <h2>10. Logging and Monitoring</h2>
      <p>ScanVista may maintain logs for operational and security purposes, including:</p>
      <ul>
        <li>Authentication events</li>
        <li>Administrative actions</li>
        <li>Error logs</li>
        <li>Security-related events</li>
        <li>System diagnostics</li>
      </ul>
      <p>Logs are used to investigate incidents, improve platform reliability, and support compliance obligations.</p>

      <h2>11. Security Incident Response</h2>
      <p>If a security incident is identified, ScanVista may take actions including:</p>
      <ul>
        <li>Investigating the incident</li>
        <li>Containing affected systems</li>
        <li>Restoring normal operations</li>
        <li>Applying security updates</li>
        <li>Notifying affected parties where required by applicable law</li>
      </ul>
      <p>Response actions will depend on the nature and severity of the incident.</p>

      <h2>12. Vulnerability Management</h2>
      <p>ScanVista strives to identify and address security vulnerabilities through measures such as:</p>
      <ul>
        <li>Routine software updates</li>
        <li>Dependency maintenance</li>
        <li>Security reviews</li>
        <li>Bug fixes</li>
        <li>Periodic testing</li>
      </ul>
      <p>The timing and method of remediation may vary based on the severity of the issue.</p>

      <h2>13. Responsible Disclosure</h2>
      <p>If you believe you have discovered a security vulnerability in ScanVista, please report it responsibly.</p>
      <p>Reports should include:</p>
      <ul>
        <li>A description of the issue</li>
        <li>Steps to reproduce the vulnerability</li>
        <li>The potential impact</li>
        <li>Any supporting evidence</li>
      </ul>
      <p>Please do not exploit, access, modify, or disclose data without authorization.</p>
      <p>ScanVista will review legitimate reports and make reasonable efforts to address confirmed security issues.</p>

      <h2>14. Third-Party Services</h2>
      <p>ScanVista relies on reputable third-party service providers for certain infrastructure and operational functions.</p>
      <p>While we select providers carefully, their services are governed by their own security practices and terms.</p>
      <p>ScanVista is not responsible for security failures that occur solely within third-party systems beyond our reasonable control.</p>

      <h2>15. User Responsibilities</h2>
      <p>Managers are responsible for:</p>
      <ul>
        <li>Choosing strong passwords</li>
        <li>Keeping credentials confidential</li>
        <li>Logging out of shared devices</li>
        <li>Maintaining accurate account information</li>
        <li>Reporting suspected unauthorized access promptly</li>
        <li>Using the platform lawfully</li>
      </ul>
      <p>Failure to follow these responsibilities may increase security risks.</p>

      <h2>16. Business Continuity</h2>
      <p>ScanVista maintains reasonable operational practices intended to support service continuity.</p>
      <p>Depending on operational requirements, these may include:</p>
      <ul>
        <li>Routine backups</li>
        <li>Disaster recovery planning</li>
        <li>Infrastructure redundancy where appropriate</li>
        <li>Service restoration procedures</li>
      </ul>
      <p>Recovery objectives may vary depending on the nature of an incident.</p>

      <h2>17. Security Limitations</h2>
      <p>No online service can guarantee absolute security.</p>
      <p>
        Despite reasonable safeguards, unauthorized access, cyberattacks, hardware failures, software defects, human error, or
        events beyond our control may affect the availability, integrity, or confidentiality of information.
      </p>
      <p>Users acknowledge these inherent risks when using internet-based services.</p>

      <h2>18. Policy Updates</h2>
      <p>
        This Security Policy may be updated periodically to reflect changes in technology, legal requirements, industry standards,
        or ScanVista's operational practices.
      </p>
      <p>Material changes will be reflected by updating the "Last Updated" date.</p>
      <p>Continued use of the Services after an updated policy becomes effective constitutes acceptance of the revised policy.</p>

      <h2>19. Contact</h2>
      <p>Questions regarding this Security Policy or responsible disclosure reports may be directed to:</p>
      <p><strong>ScanVista</strong></p>
      <p>Support Email: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a></p>
      <p>Security Contact: <a href={`mailto:${LEGAL_CONTACT.security}`}>{LEGAL_CONTACT.security}</a></p>
      <p>Website: <a href="https://scanvista.app">https://scanvista.app</a></p>
    </LegalDocumentLayout>
  );
}
