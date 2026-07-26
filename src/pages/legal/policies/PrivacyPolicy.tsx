import React from 'react';
import { LegalDocumentLayout } from '../LegalDocumentLayout';
import { LEGAL_CONTACT } from '../../../lib/legalConstants';

export function PrivacyPolicy() {
  return (
    <LegalDocumentLayout 
      title="Privacy Policy"
      description="ScanVista Privacy Policy explaining how we collect, use, and protect your information."
    >
      <p>Welcome to ScanVista.</p>
      <p>
        Your privacy is important to us. This Privacy Policy explains how ScanVista collects, uses, stores, protects, and shares
        information when you use our platform, website, applications, and related services.
      </p>
      <p>
        By using ScanVista, you agree to the collection and use of information in accordance with this Privacy Policy.
      </p>

      <h2>1. About ScanVista</h2>
      <p>
        ScanVista is a digital hospitality platform that enables hotels, resorts, homestays, serviced apartments, restaurants, and
        other hospitality businesses to create and manage digital guest experiences, including digital menus, amenities, property
        information, QR-code-based guest access, and related hospitality services.
      </p>
      <p>Throughout this policy:</p>
      <ul>
        <li><strong>"ScanVista", "we", "our", or "us"</strong> refers to ScanVista.</li>
        <li><strong>"Manager"</strong> refers to a registered business user managing one or more hospitality properties.</li>
        <li><strong>"Guest"</strong> refers to an individual accessing publicly available property information through ScanVista.</li>
        <li><strong>"Services"</strong> refers to all websites, applications, APIs, software, and related offerings provided by ScanVista.</li>
      </ul>

      <h2>2. Information We Collect</h2>
      
      <h3>2.1 Manager Information</h3>
      <p>When a manager creates an account, we may collect:</p>
      <ul>
        <li>Full name</li>
        <li>Email address</li>
        <li>Password (stored securely using industry-standard hashing)</li>
        <li>Business name</li>
        <li>Property information</li>
        <li>Login timestamps</li>
        <li>Account preferences</li>
      </ul>

      <h3>2.2 Property Information</h3>
      <p>Managers may provide:</p>
      <ul>
        <li>Property name</li>
        <li>Address</li>
        <li>Contact numbers</li>
        <li>Email addresses</li>
        <li>Website links</li>
        <li>Social media links</li>
        <li>Hero images</li>
        <li>Logos</li>
        <li>Menus</li>
        <li>Amenities</li>
        <li>Room information</li>
        <li>Operating hours</li>
        <li>Descriptions</li>
        <li>QR configuration</li>
        <li>Other hospitality-related content</li>
      </ul>
      <p>Managers are responsible for ensuring they have the right to upload and publish this content.</p>

      <h3>2.3 Guest Information</h3>
      <p>
        Guests generally access publicly available property information without creating an account.
      </p>
      <p>
        Depending on future features enabled by a property, ScanVista may process limited guest information necessary to
        provide requested services.
      </p>
      <p>
        At the time of this policy, ScanVista does not intentionally require guests to create accounts to browse publicly published
        property information.
      </p>

      <h3>2.4 Technical Information</h3>
      <p>We may automatically collect technical information, including:</p>
      <ul>
        <li>Device type</li>
        <li>Browser type</li>
        <li>Operating system</li>
        <li>IP address</li>
        <li>Language preferences</li>
        <li>Time zone</li>
        <li>Access timestamps</li>
        <li>Error logs</li>
        <li>Diagnostic information</li>
        <li>Basic usage analytics (if enabled)</li>
      </ul>

      <h3>2.5 Cookies and Similar Technologies</h3>
      <p>ScanVista may use cookies or similar technologies to:</p>
      <ul>
        <li>Maintain secure sessions</li>
        <li>Remember preferences</li>
        <li>Improve platform performance</li>
        <li>Analyze service usage (where applicable)</li>
      </ul>
      <p>For more information, please see our Cookie Policy.</p>

      <h2>3. How We Use Information</h2>
      <p>We use information to:</p>
      <ul>
        <li>Provide ScanVista services</li>
        <li>Authenticate managers</li>
        <li>Publish hospitality content</li>
        <li>Display guest experiences</li>
        <li>Generate QR codes</li>
        <li>Improve platform performance</li>
        <li>Detect security incidents</li>
        <li>Prevent fraud and abuse</li>
        <li>Respond to support requests</li>
        <li>Comply with legal obligations</li>
      </ul>
      <p>We do not sell personal information.</p>

      <h2>4. Legal Basis for Processing</h2>
      <p>Depending on the jurisdiction, we may process information based on:</p>
      <ul>
        <li>Performance of a contract</li>
        <li>Legitimate business interests</li>
        <li>Compliance with legal obligations</li>
        <li>User consent where required by law</li>
      </ul>

      <h2>5. Information Sharing</h2>
      <h3>Service Providers</h3>
      <p>Trusted providers that help us operate ScanVista, such as:</p>
      <ul>
        <li>Cloud hosting providers</li>
        <li>Database providers</li>
        <li>Email service providers</li>
        <li>Analytics providers (if enabled)</li>
        <li>Security providers</li>
      </ul>
      <p>These providers may process information only as necessary to provide their services.</p>

      <h3>Legal Requirements</h3>
      <p>We may disclose information when required to:</p>
      <ul>
        <li>Comply with applicable law</li>
        <li>Respond to lawful requests</li>
        <li>Protect our rights</li>
        <li>Prevent fraud</li>
        <li>Protect users or the public</li>
      </ul>

      <h3>Business Transfers</h3>
      <p>
        If ScanVista undergoes a merger, acquisition, or sale of assets, information may be transferred as part of that
        transaction.
      </p>

      <h2>6. Public Information</h2>
      <p>
        Information intentionally published by a manager for guests—including menus, amenities, property descriptions, and
        contact details—may be publicly accessible through QR codes or shared links.
      </p>
      <p>
        Managers are responsible for ensuring that only information intended for public viewing is published.
      </p>

      <h2>7. Data Security</h2>
      <p>
        ScanVista implements reasonable technical and organizational measures designed to protect information against
        unauthorized access, alteration, disclosure, or destruction.
      </p>
      <p>Examples may include:</p>
      <ul>
        <li>Encrypted communications (HTTPS)</li>
        <li>Secure password storage</li>
        <li>Access controls</li>
        <li>Authentication</li>
        <li>Server-side validation</li>
        <li>Security monitoring</li>
      </ul>
      <p>
        No method of electronic transmission or storage can be guaranteed to be completely secure. Users should also take
        reasonable steps to protect their account credentials.
      </p>

      <h2>8. Data Retention</h2>
      <p>We retain information only for as long as reasonably necessary to:</p>
      <ul>
        <li>Provide our services</li>
        <li>Maintain account functionality</li>
        <li>Resolve disputes</li>
        <li>Comply with legal obligations</li>
        <li>Protect our legitimate interests</li>
      </ul>
      <p>Retention periods may vary depending on the type of information and applicable legal requirements.</p>

      <h2>9. Account Deletion</h2>
      <p>Managers may request deletion of their account and associated data by contacting ScanVista support.</p>
      <p>
        Deletion requests may be subject to reasonable verification and may not immediately remove information retained for
        legal, security, fraud prevention, or backup purposes.
      </p>

      <h2>10. International Data Transfers</h2>
      <p>
        Depending on where ScanVista's infrastructure or service providers are located, information may be processed in
        countries other than the user's country of residence.
      </p>
      <p>Where required, ScanVista will take reasonable steps to protect information during such transfers.</p>

      <h2>11. Children's Privacy</h2>
      <p>ScanVista is intended for business and hospitality use.</p>
      <p>
        It is not directed toward children under the age required by applicable law to provide their own consent for data
        processing.
      </p>
      <p>
        If we become aware that personal information has been collected from a child in violation of applicable law, we will take
        reasonable steps to remove such information.
      </p>

      <h2>12. Your Rights</h2>
      <p>Subject to applicable law, users may have rights to:</p>
      <ul>
        <li>Access their information</li>
        <li>Correct inaccurate information</li>
        <li>Request deletion</li>
        <li>Request restriction of processing</li>
        <li>Object to certain processing</li>
        <li>Withdraw consent where consent is the legal basis</li>
        <li>Request a copy of certain information</li>
      </ul>
      <p>Requests may require identity verification.</p>

      <h2>13. Third-Party Links</h2>
      <p>ScanVista may contain links to third-party websites or services.</p>
      <p>We are not responsible for the privacy practices, content, or security of third-party websites.</p>
      <p>Users should review the privacy policies of any third-party services they access.</p>

      <h2>14. Changes to This Privacy Policy</h2>
      <p>We may update this Privacy Policy from time to time.</p>
      <p>
        When significant changes are made, we will update the "Last Updated" date and, where appropriate, provide additional
        notice.
      </p>
      <p>Continued use of ScanVista after changes become effective constitutes acceptance of the revised Privacy Policy.</p>

      <h2>15. Contact Us</h2>
      <p>For questions about this Privacy Policy or privacy-related requests, please contact:</p>
      <p><strong>ScanVista</strong></p>
      <p>Support Email: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a></p>
      <p>Website: <a href="https://scanvista.app">https://scanvista.app</a></p>
    </LegalDocumentLayout>
  );
}
