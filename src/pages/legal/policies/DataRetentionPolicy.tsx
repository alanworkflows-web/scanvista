import React from 'react';
import { LegalDocumentLayout } from '../LegalDocumentLayout';
import { LEGAL_CONTACT } from '../../../lib/legalConstants';

export function DataRetentionPolicy() {
  return (
    <LegalDocumentLayout 
      title="Data Retention & Deletion Policy"
      description="ScanVista Data Retention & Deletion Policy explaining how we handle information storage and removal."
    >
      <p>
        This Data Retention & Deletion Policy explains how ScanVista ("ScanVista", "we", "our", or "us") retains, archives, and
        deletes information processed through our Services.
      </p>
      <p>
        This policy should be read together with the Privacy Policy, Terms of Service, and Security Policy.
      </p>

      <h2>1. Purpose</h2>
      <p>The purpose of this policy is to:</p>
      <ul>
        <li>Explain how long ScanVista retains information.</li>
        <li>Describe how deletion requests are handled.</li>
        <li>Support compliance with applicable legal obligations.</li>
        <li>Balance user privacy with operational and security requirements.</li>
      </ul>

      <h2>2. Scope</h2>
      <p>This policy applies to information processed through ScanVista, including:</p>
      <ul>
        <li>Manager account information</li>
        <li>Property information</li>
        <li>Guest-facing content</li>
        <li>Uploaded files and images</li>
        <li>Authentication records</li>
        <li>Technical logs</li>
        <li>Security records</li>
        <li>Support communications</li>
        <li>System backups</li>
      </ul>

      <h2>3. Data We Retain</h2>
      <p>Depending on how ScanVista is used, retained information may include:</p>
      
      <h3>Manager Information</h3>
      <ul>
        <li>Name</li>
        <li>Email address</li>
        <li>Account settings</li>
        <li>Authentication records</li>
        <li>Account activity</li>
      </ul>

      <h3>Property Information</h3>
      <ul>
        <li>Property name</li>
        <li>Address</li>
        <li>Contact details</li>
        <li>Menus</li>
        <li>Amenities</li>
        <li>Images</li>
        <li>Descriptions</li>
        <li>QR configuration</li>
        <li>Published content</li>
      </ul>

      <h3>Technical Information</h3>
      <ul>
        <li>IP addresses</li>
        <li>Browser information</li>
        <li>Device information</li>
        <li>Error logs</li>
        <li>Login history</li>
        <li>Security events</li>
      </ul>

      <h3>Support Records</h3>
      <ul>
        <li>Customer support requests</li>
        <li>Feedback</li>
        <li>Communications</li>
        <li>Bug reports</li>
      </ul>

      <h2>4. Retention Principles</h2>
      <p>ScanVista retains information only for as long as reasonably necessary to:</p>
      <ul>
        <li>Provide the Services.</li>
        <li>Maintain platform security.</li>
        <li>Resolve disputes.</li>
        <li>Detect fraud.</li>
        <li>Comply with applicable laws.</li>
        <li>Enforce contractual obligations.</li>
        <li>Restore systems from backups where necessary.</li>
      </ul>
      <p>Information that is no longer required will be securely deleted or anonymized where reasonably practicable.</p>

      <h2>5. Account Data</h2>
      <p>Manager account information is generally retained while the account remains active.</p>
      <p>After an account is deleted, certain information may continue to be retained for a limited period where necessary for:</p>
      <ul>
        <li>Legal compliance</li>
        <li>Fraud prevention</li>
        <li>Security investigations</li>
        <li>Backup recovery</li>
        <li>Resolution of disputes</li>
      </ul>

      <h2>6. Property Data</h2>
      <p>Property information remains available while a property is active on ScanVista.</p>
      <p>If a Manager deletes a property or closes an account:</p>
      <ul>
        <li>Public access to the property may be disabled.</li>
        <li>Operational records may be retained for a reasonable period.</li>
        <li>Backups may temporarily contain historical copies until overwritten through normal backup cycles.</li>
      </ul>

      <h2>7. Uploaded Files</h2>
      <p>Files uploaded by Managers may remain stored while they are actively associated with a property.</p>
      <p>Deleted files may remain in encrypted backups for a limited period before permanent removal as part of routine backup rotation.</p>

      <h2>8. Security Logs</h2>
      <p>Security-related records may be retained for a reasonable period to:</p>
      <ul>
        <li>Investigate incidents</li>
        <li>Detect unauthorized activity</li>
        <li>Improve platform security</li>
        <li>Comply with legal obligations</li>
      </ul>
      <p>Retention periods may vary depending on the nature of the event.</p>

      <h2>9. Backup Data</h2>
      <p>ScanVista performs routine backups to support disaster recovery and business continuity.</p>
      <p>Backup copies:</p>
      <ul>
        <li>Are protected using appropriate security controls.</li>
        <li>Are not intended for routine operational access.</li>
        <li>May remain available until scheduled backup rotation or expiration.</li>
      </ul>
      <p>Deleting active data does not necessarily result in the immediate removal of historical backup copies.</p>

      <h2>10. Deletion Requests</h2>
      <p>Managers may request deletion of their account or associated information by contacting ScanVista.</p>
      <p>Before processing a deletion request, ScanVista may verify the identity and authority of the requester.</p>
      <p>Deletion requests may not be completed immediately if information must be retained for legitimate legal, contractual, or security reasons.</p>

      <h2>11. Legal Holds</h2>
      <p>
        Where required by law or reasonably necessary to protect legal rights, ScanVista may preserve relevant information
        despite a deletion request.
      </p>
      <p>Examples include:</p>
      <ul>
        <li>Court orders</li>
        <li>Government investigations</li>
        <li>Ongoing litigation</li>
        <li>Fraud investigations</li>
        <li>Regulatory requirements</li>
      </ul>
      <p>Only the information necessary for these purposes will be retained.</p>

      <h2>12. Data Anonymization</h2>
      <p>Where appropriate, ScanVista may anonymize information instead of deleting it.</p>
      <p>Anonymized information:</p>
      <ul>
        <li>Cannot reasonably identify an individual.</li>
        <li>May be used for statistical analysis.</li>
        <li>May support platform improvements and reporting.</li>
      </ul>

      <h2>13. User Responsibilities</h2>
      <p>Managers are responsible for:</p>
      <ul>
        <li>Keeping published information accurate.</li>
        <li>Removing outdated content.</li>
        <li>Requesting deletion when appropriate.</li>
        <li>Downloading any information they wish to retain before requesting account deletion.</li>
      </ul>
      <p>Once deletion is complete, recovery of deleted information may not be possible.</p>

      <h2>14. Security During Deletion</h2>
      <p>ScanVista aims to securely delete information using reasonable technical and organizational measures.</p>
      <p>Depending on the type of data, deletion methods may include:</p>
      <ul>
        <li>Secure database deletion</li>
        <li>Removal from active storage</li>
        <li>Scheduled deletion from backup systems</li>
        <li>Secure destruction of temporary files</li>
      </ul>

      <h2>15. Changes to This Policy</h2>
      <p>
        ScanVista may update this policy from time to time to reflect changes in legal requirements, technology, or operational
        practices.
      </p>
      <p>Material updates will be indicated by revising the "Last Updated" date.</p>
      <p>Continued use of the Services after an updated policy becomes effective constitutes acceptance of the revised policy.</p>

      <h2>16. Contact</h2>
      <p>Questions or requests regarding this policy may be directed to:</p>
      <p><strong>ScanVista</strong></p>
      <p>Support Email: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a></p>
      <p>Privacy Email: <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a></p>
      <p>Website: <a href="https://scanvista.app">https://scanvista.app</a></p>
    </LegalDocumentLayout>
  );
}
