import React from 'react';
import { LegalDocumentLayout } from '../LegalDocumentLayout';
import { LEGAL_CONTACT } from '../../../lib/legalConstants';

export function TermsOfService() {
  return (
    <LegalDocumentLayout 
      title="Terms of Service"
      description="ScanVista Terms of Service governing access and use of the platform."
    >
      <p>Welcome to ScanVista.</p>
      <p>
        These Terms of Service ("Terms") govern your access to and use of the ScanVista website, software, applications, APIs,
        and related services (collectively, the "Services").
      </p>
      <p>
        By creating an account, accessing, or using ScanVista, you agree to be bound by these Terms. If you do not agree with
        these Terms, do not use the Services.
      </p>

      <h2>1. Definitions</h2>
      <p>For the purposes of these Terms:</p>
      <ul>
        <li><strong>ScanVista</strong> refers to the ScanVista platform and related services.</li>
        <li><strong>Manager</strong> means a registered user managing one or more hospitality properties.</li>
        <li><strong>Guest</strong> means a visitor accessing publicly available hospitality information through ScanVista.</li>
        <li><strong>Property</strong> means a hotel, resort, homestay, serviced apartment, restaurant, or hospitality business managed through ScanVista.</li>
        <li><strong>Content</strong> includes text, images, menus, amenities, logos, descriptions, contact information, and other material uploaded by Managers.</li>
      </ul>

      <h2>2. Eligibility</h2>
      <p>To use ScanVista, you must:</p>
      <ul>
        <li>Be at least 18 years old or the age of majority in your jurisdiction.</li>
        <li>Have the legal authority to represent your business if registering on behalf of an organization.</li>
        <li>Provide accurate and current information.</li>
        <li>Comply with all applicable laws.</li>
      </ul>

      <h2>3. Manager Accounts</h2>
      <p>Managers are responsible for:</p>
      <ul>
        <li>Maintaining the confidentiality of their login credentials.</li>
        <li>All activity occurring under their account.</li>
        <li>Promptly notifying ScanVista of any unauthorized access.</li>
      </ul>
      <p>Managers may not:</p>
      <ul>
        <li>Share accounts with unauthorized users.</li>
        <li>Impersonate another individual or organization.</li>
        <li>Attempt to bypass security controls.</li>
      </ul>

      <h2>4. Services Provided</h2>
      <p>ScanVista provides software that enables hospitality businesses to:</p>
      <ul>
        <li>Create digital property profiles.</li>
        <li>Publish digital menus.</li>
        <li>Display amenities and services.</li>
        <li>Share QR-code-based guest experiences.</li>
        <li>Manage guest-facing content.</li>
        <li>Publish and update hospitality information.</li>
      </ul>
      <p>ScanVista may modify or improve its Services over time.</p>

      <h2>5. Property Content</h2>
      <p>Managers retain ownership of all content they upload.</p>
      <p>Managers are solely responsible for ensuring:</p>
      <ul>
        <li>Accuracy of published information.</li>
        <li>Compliance with applicable laws.</li>
        <li>Ownership or permission to use uploaded content.</li>
        <li>Removal of outdated or incorrect information.</li>
      </ul>
      <p>ScanVista does not verify the accuracy of property content.</p>

      <h2>6. Acceptable Use</h2>
      <p>Users agree not to:</p>
      <ul>
        <li>Upload unlawful material.</li>
        <li>Upload malware or malicious code.</li>
        <li>Attempt unauthorized access.</li>
        <li>Interfere with the Services.</li>
        <li>Reverse engineer the platform where prohibited by law.</li>
        <li>Use ScanVista for fraudulent activities.</li>
        <li>Infringe intellectual property rights.</li>
        <li>Misrepresent business information.</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <p>
        All software, branding, trademarks, logos, source code, interface designs, documentation, and technology provided by
        ScanVista remain the property of ScanVista unless otherwise stated.
      </p>
      <p>These Terms do not transfer ownership of the platform to users.</p>

      <h2>8. User Content License</h2>
      <p>By uploading content to ScanVista, Managers grant ScanVista a limited, non-exclusive, worldwide license to:</p>
      <ul>
        <li>Store the content.</li>
        <li>Display the content to intended users.</li>
        <li>Process the content to provide Services.</li>
        <li>Create backups.</li>
        <li>Generate QR-code experiences.</li>
        <li>Deliver hospitality functionality requested by the Manager.</li>
      </ul>
      <p>This license ends when the content is permanently deleted, subject to reasonable backup retention and legal obligations.</p>

      <h2>9. Availability</h2>
      <p>ScanVista strives to provide reliable Services but does not guarantee uninterrupted or error-free operation.</p>
      <p>Maintenance, upgrades, security events, or circumstances beyond our control may temporarily affect availability.</p>

      <h2>10. Third-Party Services</h2>
      <p>ScanVista may rely on third-party providers for infrastructure, hosting, databases, email delivery, or related services.</p>
      <p>ScanVista is not responsible for outages or failures caused solely by third-party providers.</p>

      <h2>11. Fees</h2>
      <p>If ScanVista introduces paid plans in the future:</p>
      <ul>
        <li>Pricing will be clearly communicated.</li>
        <li>Subscription terms will be disclosed before purchase.</li>
        <li>Applicable taxes may apply.</li>
        <li>Failure to pay may result in suspension of paid features.</li>
      </ul>
      <p>Pilot users may receive access under separate agreements.</p>

      <h2>12. Suspension and Termination</h2>
      <p>ScanVista may suspend or terminate accounts that:</p>
      <ul>
        <li>Violate these Terms.</li>
        <li>Engage in illegal activity.</li>
        <li>Threaten platform security.</li>
        <li>Abuse the Services.</li>
        <li>Infringe intellectual property rights.</li>
      </ul>
      <p>Managers may stop using ScanVista at any time.</p>

      <h2>13. Data Deletion</h2>
      <p>Managers may request deletion of their account and associated property data.</p>
      <p>Certain information may be retained as required by law, for fraud prevention, security, or backup restoration.</p>
      <p>Additional details are available in the Data Retention Policy.</p>

      <h2>14. Privacy</h2>
      <p>Our collection and use of information are governed by the ScanVista Privacy Policy, which forms part of these Terms.</p>
      <p>Users should review the Privacy Policy before using the Services.</p>

      <h2>15. Disclaimers</h2>
      <p>ScanVista is provided on an "as is" and "as available" basis.</p>
      <p>
        To the maximum extent permitted by applicable law, ScanVista disclaims warranties including, but not limited to:
      </p>
      <ul>
        <li>Merchantability.</li>
        <li>Fitness for a particular purpose.</li>
        <li>Non-infringement.</li>
        <li>Continuous availability.</li>
        <li>Error-free operation.</li>
      </ul>
      <p>Nothing in these Terms excludes rights that cannot legally be excluded under applicable law.</p>

      <h2>16. Limitation of Liability</h2>
      <p>To the fullest extent permitted by law:</p>
      <ul>
        <li>ScanVista shall not be liable for indirect, incidental, special, consequential, or punitive damages arising from use of the Services.</li>
        <li>ScanVista is not responsible for losses caused by inaccurate content uploaded by Managers.</li>
        <li>Managers remain responsible for business decisions made using the platform.</li>
      </ul>
      <p>These limitations apply except where prohibited by applicable law.</p>

      <h2>17. Indemnification</h2>
      <p>Managers agree to indemnify and hold ScanVista harmless from claims, damages, liabilities, and expenses arising from:</p>
      <ul>
        <li>Content uploaded by the Manager.</li>
        <li>Violation of these Terms.</li>
        <li>Infringement of third-party rights.</li>
        <li>Unlawful use of the Services.</li>
      </ul>

      <h2>18. Governing Law</h2>
      <p>These Terms shall be governed by the laws of India, without regard to conflict of law principles.</p>
      <p>Any disputes shall be subject to the jurisdiction of the competent courts in India, unless otherwise required by applicable law.</p>

      <h2>19. Changes to These Terms</h2>
      <p>ScanVista may update these Terms from time to time.</p>
      <p>When material changes are made:</p>
      <ul>
        <li>The "Last Updated" date will be revised.</li>
        <li>Continued use of the Services after the effective date constitutes acceptance of the revised Terms.</li>
      </ul>

      <h2>20. Contact</h2>
      <p>Questions regarding these Terms may be directed to:</p>
      <p><strong>ScanVista</strong></p>
      <p>Support Email: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a></p>
      <p>Website: <a href="https://scanvista.app">https://scanvista.app</a></p>
    </LegalDocumentLayout>
  );
}
