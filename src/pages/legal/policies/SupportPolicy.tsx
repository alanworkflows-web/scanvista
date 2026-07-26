import React from 'react';
import { LegalDocumentLayout } from '../LegalDocumentLayout';
import { LEGAL_CONTACT } from '../../../lib/legalConstants';

export function SupportPolicy() {
  return (
    <LegalDocumentLayout 
      title="Contact & Support Policy"
      description="ScanVista Contact & Support Policy explaining how to get help and report issues."
    >
      <p>
        This Contact & Support Policy explains how users may contact ScanVista, request assistance, report issues, submit
        feedback, and communicate regarding legal, security, and privacy matters.
      </p>
      <p>
        This policy should be read together with the Terms of Service, Privacy Policy, and Security Policy.
      </p>

      <h2>1. Purpose</h2>
      <p>The purpose of this policy is to:</p>
      <ul>
        <li>Provide clear communication channels.</li>
        <li>Explain the types of support available.</li>
        <li>Define expected responsibilities for both ScanVista and users.</li>
        <li>Ensure timely handling of operational, legal, and security matters.</li>
      </ul>

      <h2>2. Scope</h2>
      <p>This policy applies to:</p>
      <ul>
        <li>Hospitality Managers</li>
        <li>Property administrators</li>
        <li>Business account owners</li>
        <li>Authorized staff members</li>
        <li>Guests using publicly available ScanVista-powered pages</li>
        <li>Prospective customers contacting ScanVista</li>
      </ul>

      <h2>3. Support Services</h2>
      <p>ScanVista provides support for matters including:</p>
      <ul>
        <li>Account access issues</li>
        <li>Property configuration</li>
        <li>QR code functionality</li>
        <li>Publishing problems</li>
        <li>Technical issues</li>
        <li>Bug reporting</li>
        <li>Security concerns</li>
        <li>Privacy requests</li>
        <li>General platform questions</li>
      </ul>
      <p>
        Support is provided on a commercially reasonable basis and may vary depending on the user's plan or any applicable
        service agreement.
      </p>

      <h2>4. Contact Channels</h2>
      
      <h3>General Support</h3>
      <p>Email: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a></p>
      <p>Purpose:</p>
      <ul>
        <li>General assistance</li>
        <li>Technical support</li>
        <li>Account questions</li>
        <li>Feature guidance</li>
      </ul>

      <h3>Privacy Requests</h3>
      <p>Email: <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a></p>
      <p>Purpose:</p>
      <ul>
        <li>Privacy questions</li>
        <li>Data access requests</li>
        <li>Data correction requests</li>
        <li>Data deletion requests</li>
        <li>Consent-related inquiries</li>
      </ul>

      <h3>Security Reports</h3>
      <p>Email: <a href={`mailto:${LEGAL_CONTACT.security}`}>{LEGAL_CONTACT.security}</a></p>
      <p>Purpose:</p>
      <ul>
        <li>Responsible vulnerability disclosure</li>
        <li>Security incidents</li>
        <li>Unauthorized access reports</li>
        <li>Suspected account compromise</li>
      </ul>

      <h3>Business & Partnerships</h3>
      <p>Email: <a href={`mailto:${LEGAL_CONTACT.hello}`}>{LEGAL_CONTACT.hello}</a></p>
      <p>Purpose:</p>
      <ul>
        <li>Pilot program inquiries</li>
        <li>Business partnerships</li>
        <li>Sales inquiries</li>
        <li>Hospitality onboarding</li>
        <li>Media requests</li>
      </ul>

      <h2>5. Support Hours</h2>
      <p>Unless otherwise agreed in writing, ScanVista provides support during normal business hours.</p>
      <p>Response times may vary depending on:</p>
      <ul>
        <li>Issue severity</li>
        <li>Available support resources</li>
        <li>Volume of requests</li>
        <li>Applicable subscription or pilot agreement</li>
      </ul>
      <p>ScanVista does not guarantee immediate or continuous support availability.</p>

      <h2>6. Support Priorities</h2>
      <p>Requests are generally prioritized in the following order:</p>
      
      <h3>Critical</h3>
      <p>Examples:</p>
      <ul>
        <li>Security incidents</li>
        <li>Platform-wide outages</li>
        <li>Unauthorized account access</li>
        <li>Data integrity issues</li>
      </ul>

      <h3>High</h3>
      <p>Examples:</p>
      <ul>
        <li>Publishing failures</li>
        <li>QR code failures</li>
        <li>Account login issues</li>
        <li>Major platform errors</li>
      </ul>

      <h3>Normal</h3>
      <p>Examples:</p>
      <ul>
        <li>Feature questions</li>
        <li>Configuration assistance</li>
        <li>Documentation requests</li>
        <li>General troubleshooting</li>
      </ul>

      <h3>Low</h3>
      <p>Examples:</p>
      <ul>
        <li>Product suggestions</li>
        <li>Cosmetic issues</li>
        <li>General feedback</li>
        <li>Enhancement requests</li>
      </ul>
      <p>Priority classification may be adjusted based on operational impact.</p>

      <h2>7. Information to Include in Support Requests</h2>
      <p>To help us resolve issues efficiently, users should include:</p>
      <ul>
        <li>Property name</li>
        <li>Registered email address</li>
        <li>Description of the issue</li>
        <li>Steps to reproduce the issue (if applicable)</li>
        <li>Date and time of occurrence</li>
        <li>Screenshots or screen recordings (if available)</li>
        <li>Browser and device information (where relevant)</li>
      </ul>
      <p>Providing complete information may reduce resolution time.</p>

      <h2>8. User Responsibilities</h2>
      <p>Users requesting support should:</p>
      <ul>
        <li>Provide accurate information.</li>
        <li>Cooperate during troubleshooting.</li>
        <li>Maintain current contact details.</li>
        <li>Follow reasonable troubleshooting instructions.</li>
        <li>Report suspected security issues promptly.</li>
      </ul>

      <h2>9. Security Reports</h2>
      <p>Users who discover a potential security vulnerability should:</p>
      <ul>
        <li>Report the issue privately to ScanVista.</li>
        <li>Avoid exploiting the vulnerability.</li>
        <li>Avoid accessing information without authorization.</li>
        <li>Allow ScanVista a reasonable opportunity to investigate before public disclosure.</li>
      </ul>
      <p>Good-faith security research conducted responsibly is appreciated.</p>

      <h2>10. Privacy Requests</h2>
      <p>
        Individuals wishing to exercise rights available under applicable privacy laws may contact ScanVista using the
        designated privacy contact.
      </p>
      <p>Depending on applicable law and verification requirements, users may request:</p>
      <ul>
        <li>Access to personal information.</li>
        <li>Correction of inaccurate information.</li>
        <li>Deletion of eligible information.</li>
        <li>Restriction of certain processing activities.</li>
        <li>Withdrawal of consent where applicable.</li>
      </ul>
      <p>Additional verification may be required before processing requests.</p>

      <h2>11. Service Announcements</h2>
      <p>ScanVista may communicate important operational information, including:</p>
      <ul>
        <li>Security notices</li>
        <li>Planned maintenance</li>
        <li>Service interruptions</li>
        <li>Policy updates</li>
        <li>Critical platform changes</li>
      </ul>
      <p>
        These communications are considered part of the operation of the Services and may be sent even if a user has opted out
        of marketing communications.
      </p>

      <h2>12. Feedback and Suggestions</h2>
      <p>Users may voluntarily submit:</p>
      <ul>
        <li>Feature requests</li>
        <li>Product suggestions</li>
        <li>Improvement ideas</li>
        <li>Feedback regarding platform usability</li>
      </ul>
      <p>
        Unless otherwise agreed in writing, feedback may be used by ScanVista without compensation, while ownership of the
        ScanVista platform and resulting developments remains with ScanVista.
      </p>

      <h2>13. Complaints</h2>
      <p>If a user is dissatisfied with the Services, they should first contact ScanVista using the appropriate support channel.</p>
      <p>ScanVista will make reasonable efforts to review and respond to complaints in a fair and timely manner.</p>
      <p>Submitting a complaint does not guarantee a specific outcome.</p>

      <h2>14. Policy Updates</h2>
      <p>This Contact & Support Policy may be updated periodically to reflect operational, legal, or business changes.</p>
      <p>Material changes will be indicated by updating the "Last Updated" date.</p>
      <p>Continued use of the Services after an updated policy becomes effective constitutes acceptance of the revised policy.</p>

      <h2>15. Contact Summary</h2>
      <p><strong>Purpose | Email</strong></p>
      <p>General Support: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a></p>
      <p>Privacy Requests: <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a></p>
      <p>Security Reports: <a href={`mailto:${LEGAL_CONTACT.security}`}>{LEGAL_CONTACT.security}</a></p>
      <p>Business Inquiries: <a href={`mailto:${LEGAL_CONTACT.hello}`}>{LEGAL_CONTACT.hello}</a></p>
    </LegalDocumentLayout>
  );
}
