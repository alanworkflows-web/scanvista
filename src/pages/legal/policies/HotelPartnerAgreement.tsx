import React from 'react';
import { LegalDocumentLayout } from '../LegalDocumentLayout';
import { LEGAL_CONTACT } from '../../../lib/legalConstants';

export function HotelPartnerAgreement() {
  return (
    <LegalDocumentLayout 
      title="Hotel Partner Agreement"
      description="ScanVista Hotel Partner Agreement detailing the terms for hospitality businesses using our platform."
    >
      <p>
        This Hotel Partner Agreement ("Agreement") governs the relationship between ScanVista ("ScanVista", "we", "our", or
        "us") and the hospitality business ("Partner", "you", or "your") using the ScanVista platform.
      </p>
      <p>
        By creating an account, publishing a property, or otherwise using ScanVista for business purposes, the Partner agrees to
        this Agreement.
      </p>

      <h2>1. Purpose</h2>
      <p>
        ScanVista provides software that enables hospitality businesses to create, manage, and publish digital guest
        experiences, including but not limited to:
      </p>
      <ul>
        <li>Digital guest information</li>
        <li>QR-code-powered property pages</li>
        <li>Digital menus</li>
        <li>Amenities and facility information</li>
        <li>Property announcements</li>
        <li>Hospitality content management</li>
      </ul>
      <p>This Agreement defines the responsibilities of both ScanVista and the Partner.</p>

      <h2>2. Eligibility</h2>
      <p>To become a Partner, you represent and warrant that:</p>
      <ul>
        <li>You are at least 18 years of age.</li>
        <li>You have authority to act on behalf of the business.</li>
        <li>Your business operates lawfully.</li>
        <li>The information you provide is accurate and complete.</li>
        <li>You will keep your account information current.</li>
      </ul>

      <h2>3. Partner Responsibilities</h2>
      <p>The Partner agrees to:</p>
      <ul>
        <li>Maintain accurate property information.</li>
        <li>Keep menus, prices, and amenities up to date.</li>
        <li>Use ScanVista only for lawful business purposes.</li>
        <li>Protect account credentials.</li>
        <li>Ensure only authorized personnel access the account.</li>
        <li>Promptly report suspected security incidents.</li>
        <li>Comply with all applicable laws and regulations.</li>
      </ul>
      <p>The Partner remains solely responsible for all content published through their account.</p>

      <h2>4. Property Content</h2>
      <p>The Partner may upload content including:</p>
      <ul>
        <li>Logos</li>
        <li>Images</li>
        <li>Menus</li>
        <li>Pricing</li>
        <li>Contact details</li>
        <li>Facility information</li>
        <li>Room information</li>
        <li>Property descriptions</li>
        <li>Promotional materials</li>
      </ul>
      <p>The Partner represents that:</p>
      <ul>
        <li>They own the content or have the necessary rights to use it.</li>
        <li>The content does not infringe third-party rights.</li>
        <li>The content is accurate and not misleading.</li>
        <li>The content complies with applicable laws.</li>
      </ul>
      <p>ScanVista may remove content that violates this Agreement or applicable law.</p>

      <h2>5. QR Codes</h2>
      <p>ScanVista may generate QR codes that link guests to Partner-managed content.</p>
      <p>The Partner is responsible for:</p>
      <ul>
        <li>Printing and displaying QR codes correctly.</li>
        <li>Ensuring QR codes are not altered or misrepresented.</li>
        <li>Replacing outdated QR codes if instructed by ScanVista.</li>
        <li>Monitoring guest-facing information for accuracy.</li>
      </ul>
      <p>ScanVista is not responsible for QR codes modified by third parties after download.</p>

      <h2>6. Platform Availability</h2>
      <p>ScanVista aims to provide reliable services but does not guarantee uninterrupted availability.</p>
      <p>Temporary interruptions may occur due to:</p>
      <ul>
        <li>Scheduled maintenance</li>
        <li>Security updates</li>
        <li>Infrastructure failures</li>
        <li>Third-party service outages</li>
        <li>Events beyond ScanVista's reasonable control</li>
      </ul>

      <h2>7. Fees and Billing</h2>
      <p>Where applicable:</p>
      <ul>
        <li>Pricing will be communicated before subscription or purchase.</li>
        <li>Fees are payable according to the selected plan.</li>
        <li>Applicable taxes may be added where required by law.</li>
        <li>Failure to pay may result in suspension or termination of paid features.</li>
      </ul>
      <p>Pilot programs, promotional pricing, or custom commercial agreements may be governed by separate written terms.</p>

      <h2>8. Intellectual Property</h2>
      <p>ScanVista retains ownership of:</p>
      <ul>
        <li>Software</li>
        <li>Source code</li>
        <li>Platform design</li>
        <li>Trademarks</li>
        <li>Logos</li>
        <li>Documentation</li>
        <li>APIs</li>
        <li>Technology</li>
      </ul>
      <p>The Partner retains ownership of the content it uploads.</p>
      <p>Nothing in this Agreement transfers ownership of ScanVista's intellectual property.</p>

      <h2>9. License Granted to ScanVista</h2>
      <p>The Partner grants ScanVista a limited, non-exclusive, worldwide, royalty-free license to:</p>
      <ul>
        <li>Store uploaded content.</li>
        <li>Process content to provide the Services.</li>
        <li>Display content to intended guests.</li>
        <li>Generate QR-code experiences.</li>
        <li>Create backups.</li>
        <li>Perform technical operations necessary to operate the platform.</li>
      </ul>
      <p>
        This license terminates when the Partner's content is permanently removed from active systems, subject to applicable
        legal obligations and backup retention.
      </p>

      <h2>10. Data Protection</h2>
      <p>ScanVista processes information in accordance with its:</p>
      <ul>
        <li>Privacy Policy</li>
        <li>Security Policy</li>
        <li>Data Retention & Deletion Policy</li>
      </ul>
      <p>
        Partners remain responsible for complying with any privacy or data protection obligations applicable to their own
        business operations.
      </p>

      <h2>11. Confidentiality</h2>
      <p>
        Each party agrees to protect confidential information received from the other party and to use such information only as
        necessary to perform under this Agreement.
      </p>
      <p>This obligation does not apply to information that:</p>
      <ul>
        <li>Is publicly available through no fault of the receiving party.</li>
        <li>Was lawfully known before disclosure.</li>
        <li>Is independently developed without reference to the confidential information.</li>
        <li>Must be disclosed by law.</li>
      </ul>

      <h2>12. Suspension and Termination</h2>
      <p>ScanVista may suspend or terminate access if the Partner:</p>
      <ul>
        <li>Violates this Agreement.</li>
        <li>Violates applicable law.</li>
        <li>Engages in fraudulent activity.</li>
        <li>Threatens platform security.</li>
        <li>Uses the Services in a manner that harms other users or ScanVista.</li>
      </ul>
      <p>The Partner may stop using ScanVista at any time, subject to any applicable subscription commitments.</p>

      <h2>13. Disclaimers</h2>
      <p>ScanVista is provided on an "as is" and "as available" basis.</p>
      <p>
        To the maximum extent permitted by law, ScanVista disclaims warranties including warranties of merchantability, fitness
        for a particular purpose, and uninterrupted availability.
      </p>
      <p>Nothing in this Agreement excludes rights that cannot legally be excluded under applicable law.</p>

      <h2>14. Limitation of Liability</h2>
      <p>To the fullest extent permitted by applicable law:</p>
      <ul>
        <li>ScanVista is not liable for indirect, incidental, consequential, special, or punitive damages.</li>
        <li>ScanVista is not responsible for losses resulting from inaccurate information published by the Partner.</li>
        <li>The Partner remains responsible for business decisions made using the platform.</li>
      </ul>
      <p>Nothing in this Agreement limits liability where such limitation is prohibited by applicable law.</p>

      <h2>15. Indemnification</h2>
      <p>The Partner agrees to indemnify and hold ScanVista harmless from claims, liabilities, damages, losses, and expenses arising from:</p>
      <ul>
        <li>The Partner's use of the Services.</li>
        <li>Content uploaded by the Partner.</li>
        <li>Violations of this Agreement.</li>
        <li>Infringement of third-party rights.</li>
        <li>Violations of applicable law.</li>
      </ul>

      <h2>16. Governing Law</h2>
      <p>This Agreement shall be governed by the laws of India.</p>
      <p>
        Any disputes arising under or relating to this Agreement shall be subject to the jurisdiction of the competent courts in
        India, unless otherwise required by applicable law.
      </p>

      <h2>17. Changes to This Agreement</h2>
      <p>ScanVista may update this Agreement from time to time.</p>
      <p>
        Material changes will be communicated by updating the "Last Updated" date and, where appropriate, providing additional
        notice.
      </p>
      <p>Continued use of the Services after the revised Agreement becomes effective constitutes acceptance of the updated terms.</p>

      <h2>18. Contact</h2>
      <p>Questions regarding this Agreement may be directed to:</p>
      <p><strong>ScanVista</strong></p>
      <p>General Support: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a></p>
      <p>Business Inquiries: <a href={`mailto:${LEGAL_CONTACT.hello}`}>{LEGAL_CONTACT.hello}</a></p>
      <p>Website: <a href="https://scanvista.app">https://scanvista.app</a></p>
    </LegalDocumentLayout>
  );
}
