import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlobalFooter } from '../../components/ui/GlobalFooter';
import { LEGAL_VERSION, LEGAL_LAST_UPDATED, LEGAL_CONTACT } from '../../lib/legalConstants';

interface LegalDocumentLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const RELATED_POLICIES = [
  { name: 'Privacy Policy', path: '/legal/privacy' },
  { name: 'Terms of Service', path: '/legal/terms' },
  { name: 'Cookie Policy', path: '/legal/cookies' },
  { name: 'Security Policy', path: '/legal/security' },
  { name: 'Acceptable Use Policy', path: '/legal/acceptable-use' },
  { name: 'Data Retention & Deletion Policy', path: '/legal/data-retention' },
  { name: 'Contact & Support Policy', path: '/legal/support' },
  { name: 'Hotel Partner Agreement', path: '/legal/hotel-partner' },
  { name: 'Copyright & Intellectual Property Notice', path: '/legal/copyright' }
];

export function LegalDocumentLayout({ title, description, children }: LegalDocumentLayoutProps) {
  useEffect(() => {
    document.title = `${title} | ScanVista`;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    if (description) {
      metaDescription.setAttribute('content', description);
    }
    
    // Add canonical link for SEO
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href.split('?')[0]);

  }, [title, description]);

  return (
    <div className="min-h-screen bg-surface legal-document is-printing-legal">
      <main className="max-w-[850px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs - Hidden in print */}
        <nav className="mb-8 text-sm text-text-muted font-medium flex items-center gap-2 legal-no-print">
          <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/legal" className="hover:text-text-primary transition-colors">Legal Center</Link>
          <span>/</span>
          <span className="text-text-primary">{title}</span>
        </nav>

        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl sm:text-[40px] font-bold text-text-primary mb-4 leading-tight">{title}</h1>
          <div className="flex flex-col items-center justify-center text-text-secondary">
            <span className="font-medium text-lg">Version {LEGAL_VERSION}</span>
            <span className="text-sm mt-1">Last Updated: {LEGAL_LAST_UPDATED}</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="prose prose-lg prose-emerald max-w-none text-[16px] leading-[1.6] text-text-primary">
          <div className="space-y-6">
            {children}
          </div>
        </div>

        {/* Footer Metadata */}
        <footer className="mt-20 pt-12 border-t border-divider">
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Related Policies */}
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-6">Related Policies</h3>
              <ul className="space-y-3">
                {RELATED_POLICIES.filter(p => p.name !== title).map(policy => (
                  <li key={policy.path}>
                    <Link to={policy.path} className="text-primary hover:underline font-medium">
                      {policy.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-text-primary mb-6">Contact</h3>
              <p className="mb-6 text-text-secondary">Questions regarding this policy may be directed to:</p>
              
              <div className="space-y-4">
                <p className="font-bold">ScanVista</p>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>Support Email: <a href={`mailto:${LEGAL_CONTACT.support}`} className="text-primary hover:underline">{LEGAL_CONTACT.support}</a></p>
                  <p>Privacy Email: <a href={`mailto:${LEGAL_CONTACT.privacy}`} className="text-primary hover:underline">{LEGAL_CONTACT.privacy}</a></p>
                  <p>Security Email: <a href={`mailto:${LEGAL_CONTACT.security}`} className="text-primary hover:underline">{LEGAL_CONTACT.security}</a></p>
                  <p>Business Inquiries: <a href={`mailto:${LEGAL_CONTACT.hello}`} className="text-primary hover:underline">{LEGAL_CONTACT.hello}</a></p>
                </div>
                <p className="text-sm mt-4 text-text-secondary">
                  Website: <a href="https://scanvista.app" className="text-primary hover:underline">https://scanvista.app</a>
                </p>
              </div>
            </div>
          </div>

        </footer>
      </main>
      <GlobalFooter />
    </div>
  );
}
