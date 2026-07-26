import React from 'react';
import { LegalDocumentLayout } from '../LegalDocumentLayout';
import { LEGAL_CONTACT } from '../../../lib/legalConstants';

export function CookiePolicy() {
  return (
    <LegalDocumentLayout 
      title="Cookie Policy"
      description="ScanVista Cookie Policy explaining our use of cookies and similar technologies."
    >
      <p>
        This Cookie Policy explains how ScanVista ("ScanVista", "we", "our", or "us") uses cookies and similar technologies
        when you access our website, applications, and related services (collectively, the "Services").
      </p>
      <p>
        This Cookie Policy should be read together with our Privacy Policy and Terms of Service.
      </p>
      <p>
        By continuing to use ScanVista, you agree to the use of cookies as described in this policy, except where applicable law
        requires your consent.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a website or use an online service.
      </p>
      <p>Cookies help websites:</p>
      <ul>
        <li>Remember user preferences</li>
        <li>Maintain secure login sessions</li>
        <li>Improve website functionality</li>
        <li>Analyze performance</li>
        <li>Enhance user experience</li>
      </ul>
      <p>Cookies cannot execute programs or install software on your device.</p>

      <h2>2. Why ScanVista Uses Cookies</h2>
      <p>ScanVista uses cookies and similar technologies to:</p>
      <ul>
        <li>Authenticate Managers</li>
        <li>Maintain secure sessions</li>
        <li>Remember user preferences</li>
        <li>Improve platform performance</li>
        <li>Protect against fraud</li>
        <li>Improve security</li>
        <li>Understand general platform usage</li>
        <li>Provide a consistent experience across devices</li>
      </ul>

      <h2>3. Types of Cookies We Use</h2>
      
      <h3>Essential Cookies</h3>
      <p>These cookies are necessary for ScanVista to function properly.</p>
      <p>Examples include:</p>
      <ul>
        <li>Login authentication</li>
        <li>Session management</li>
        <li>Security verification</li>
        <li>CSRF protection (if implemented)</li>
        <li>Load balancing</li>
        <li>System functionality</li>
      </ul>
      <p>Without these cookies, core platform features may not operate correctly.</p>

      <h3>Functional Cookies</h3>
      <p>These cookies remember user preferences, such as:</p>
      <ul>
        <li>Language selection</li>
        <li>Interface preferences</li>
        <li>Theme settings (if available)</li>
        <li>Recently viewed pages</li>
        <li>Dashboard preferences</li>
      </ul>
      <p>These cookies improve convenience but are not strictly required.</p>

      <h3>Performance Cookies</h3>
      <p>Performance cookies help us understand how the platform is used.</p>
      <p>Examples include:</p>
      <ul>
        <li>Page loading performance</li>
        <li>Navigation patterns</li>
        <li>Error reporting</li>
        <li>Anonymous usage statistics</li>
      </ul>
      <p>These cookies help improve ScanVista over time.</p>

      <h3>Analytics Cookies</h3>
      <p>If analytics services are enabled, cookies may be used to understand:</p>
      <ul>
        <li>Visitor trends</li>
        <li>Popular pages</li>
        <li>Device types</li>
        <li>Browser usage</li>
        <li>General traffic patterns</li>
      </ul>
      <p>Analytics data is used to improve ScanVista and is not intended to identify individual users.</p>
      <p>If analytics are not enabled, this section does not apply.</p>

      <h2>4. Third-Party Cookies</h2>
      <p>Certain third-party services integrated with ScanVista may place their own cookies.</p>
      <p>Examples may include:</p>
      <ul>
        <li>Hosting providers</li>
        <li>Analytics providers</li>
        <li>Security services</li>
        <li>Customer support tools (if added)</li>
      </ul>
      <p>These providers have their own privacy and cookie policies.</p>
      <p>ScanVista does not control third-party cookies.</p>

      <h2>5. Session Cookies</h2>
      <p>Session cookies are temporary cookies that:</p>
      <ul>
        <li>Keep Managers logged in</li>
        <li>Maintain secure authentication</li>
        <li>Prevent repeated login requests</li>
        <li>Improve navigation during a session</li>
      </ul>
      <p>Session cookies are generally removed when the browser is closed unless otherwise required for security or functionality.</p>

      <h2>6. Persistent Cookies</h2>
      <p>Some cookies remain on your device for a limited period to:</p>
      <ul>
        <li>Remember preferences</li>
        <li>Improve future visits</li>
        <li>Maintain selected settings</li>
      </ul>
      <p>Persistent cookies automatically expire or may be deleted manually by the user.</p>

      <h2>7. Managing Cookies</h2>
      <p>Most web browsers allow users to:</p>
      <ul>
        <li>View stored cookies</li>
        <li>Delete cookies</li>
        <li>Block cookies</li>
        <li>Receive notifications before cookies are stored</li>
        <li>Configure cookie preferences</li>
      </ul>
      <p>Please note that disabling essential cookies may affect the functionality of ScanVista.</p>
      <p>Instructions for managing cookies are available in your browser's help documentation.</p>

      <h2>8. Do Not Track</h2>
      <p>Some browsers provide a "Do Not Track" (DNT) feature.</p>
      <p>Because there is currently no universally accepted standard for responding to DNT signals, ScanVista does not guarantee a specific response to such requests.</p>

      <h2>9. Cookie Consent</h2>
      <p>Where required by applicable law, ScanVista will request your consent before placing non-essential cookies on your device.</p>
      <p>Essential cookies necessary for the operation of the platform may still be used without additional consent where permitted by law.</p>

      <h2>10. Future Technologies</h2>
      <p>As ScanVista evolves, we may introduce new technologies that perform functions similar to cookies, including local storage or other browser-based technologies.</p>
      <p>These technologies will be used in accordance with applicable privacy laws and this Cookie Policy.</p>

      <h2>11. Changes to This Cookie Policy</h2>
      <p>We may update this Cookie Policy from time to time.</p>
      <p>When material changes are made:</p>
      <ul>
        <li>The "Last Updated" date will be updated.</li>
        <li>Continued use of ScanVista after the updated policy becomes effective constitutes acceptance of the revised policy.</li>
      </ul>

      <h2>12. Contact Us</h2>
      <p>Questions regarding this Cookie Policy may be directed to:</p>
      <p><strong>ScanVista</strong></p>
      <p>Support Email: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a></p>
      <p>Website: <a href="https://scanvista.app">https://scanvista.app</a></p>
    </LegalDocumentLayout>
  );
}
