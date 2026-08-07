import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel } from 'lucide-react';

interface GlobalFooterProps {
  variant?: 'full' | 'guest';
}

export function GlobalFooter({ variant = 'full' }: GlobalFooterProps) {
  if (variant === 'guest') {
    return (
      <footer className="bg-gray-900/50 text-text-muted py-6 w-full mt-auto">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-gray-500">Powered by <span className="font-medium text-gray-400">ScanVista</span></p>
          <p className="text-[10px] text-gray-600">&copy; {new Date().getFullYear()} ScanVista</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-text-muted py-12 legal-no-print w-full mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 font-serif font-medium text-xl text-white mb-4">
            <Hotel className="text-primary" size={24}/>
            ScanVista
          </div>
          <p className="text-text-secondary opacity-60 max-w-sm mb-4">
            The QR-powered Guest Experience Platform
          </p>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Product</h4>
          <ul className="space-y-2">
            <li><Link to="/manager" className="hover:text-white transition-colors">Manager Login</Link></li>
            <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="/#outcomes" className="hover:text-white transition-colors">Outcomes</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium mb-4">Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/legal" className="hover:text-white transition-colors">Legal Center</Link></li>
            <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            <li><Link to="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            <li><Link to="/legal/security" className="hover:text-white transition-colors">Security Policy</Link></li>
            <li><Link to="/legal/acceptable-use" className="hover:text-white transition-colors">Acceptable Use</Link></li>
            <li><Link to="/legal/data-retention" className="hover:text-white transition-colors">Data Retention</Link></li>
            <li><Link to="/legal/support" className="hover:text-white transition-colors">Contact & Support</Link></li>
            <li><Link to="/legal/copyright" className="hover:text-white transition-colors">Copyright</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center md:text-left">
        &copy; {new Date().getFullYear()} ScanVista. All Rights Reserved.
      </div>
    </footer>
  );
}
