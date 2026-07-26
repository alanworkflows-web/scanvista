import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GlobalFooter } from '../../components/ui/GlobalFooter';

const LEGAL_DOCUMENTS = [
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

export function LegalCenter() {
  useEffect(() => {
    document.title = "Legal Center | ScanVista";
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <main className="flex-1 max-w-[850px] mx-auto w-full py-16 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl sm:text-[40px] font-bold text-text-primary mb-4 leading-tight">Legal Center</h1>
          <p className="text-xl text-text-secondary">
            Policies governing the use of ScanVista and the protection of our users.
          </p>
        </header>

        {/* Document List */}
        <div className="bg-background border border-divider shadow-premium rounded-sm p-8 sm:p-12">
          <h2 className="text-24px font-bold text-text-primary mb-8 border-b border-divider pb-4">Documents</h2>
          <div className="flex flex-col space-y-4">
            {LEGAL_DOCUMENTS.map((doc, index) => (
              <Link 
                key={index} 
                to={doc.path}
                className="group flex items-center justify-between p-4 rounded-sm hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20"
              >
                <span className="text-lg font-medium text-text-primary group-hover:text-primary transition-colors">
                  {doc.name}
                </span>
                <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>

      </main>
      
      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
}
