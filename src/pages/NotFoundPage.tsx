import React from "react";
import { Link } from "react-router-dom";
import { Home, MapPinOff } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="bg-surface max-w-md w-full rounded-sm shadow-premium border border-divider p-8 text-center">
        <div className="w-16 h-16 bg-surface-hover text-text-secondary opacity-60 rounded-full flex items-center justify-center mx-auto mb-12">
          <MapPinOff size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-text-primary mb-2">Page Not Found</h1>
        <p className="text-text-secondary opacity-60 mb-12">
          The link you followed may be broken, or the page may have been removed.
        </p>
        <Link 
          to="/"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-sm flex items-center justify-center gap-2"
        >
          <Home size={18} /> Return Home
        </Link>
      </div>
    </div>
  );
}
