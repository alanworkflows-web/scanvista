import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Settings, CreditCard, LogOut, Menu, X, Hotel, Utensils, QrCode } from "lucide-react";
import { cn } from "../lib/utils";

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Property Setup', href: '/manager/setup', icon: Settings },
    { name: 'Menu & Amenities', href: '/manager/operations', icon: Utensils },
    { name: 'QR Generator', href: '/manager/qr', icon: QrCode },
    { name: 'Plan & Billing', href: '/manager/plan', icon: CreditCard },
  ];

  const handleLogout = () => {
    fetch("/api/logout", { method: "POST" }).then(() => navigate("/manager"));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-serif font-bold text-xl text-gray-900">
          <Hotel className="text-emerald-600" />
          ScanVista
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-gray-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col",
        isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 hidden lg:flex gap-2 font-serif font-bold text-xl text-gray-900">
          <Hotel className="text-emerald-600" />
          ScanVista
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon size={18} className={isActive ? "text-emerald-600" : "text-gray-400"} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full rounded-xl transition-colors"
          >
            <LogOut size={18} className="text-gray-400" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
