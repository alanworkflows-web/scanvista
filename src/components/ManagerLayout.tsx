import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { routeComponents } from "../App";
import { 
  Hotel, 
  Menu as MenuIcon, 
  X, 
  LayoutDashboard, 
  UtensilsCrossed, 
  QrCode, 
  Palette, 
  Sparkles, 
  TrendingUp, 
  Settings as SettingsIcon,
  LogOut,
  HelpCircle,
  Users
} from "lucide-react";
import { cn } from "./ui/Button";
import { theme } from "../design/theme";
import { SyncStatus } from "./ui/SyncStatus";
import { GlobalFooter } from "./ui/GlobalFooter";
export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // When clicking an anchor link on the same page, react-router doesn't always scroll automatically.
  // We handle scroll into view if needed, but standard href anchor works in standard cases.
  // The mapping uses path + hash combinations.
  const navigation = [
    { name: 'Home', href: '/manager/home', icon: LayoutDashboard },
    { name: 'Restaurant', href: '/manager/restaurant', icon: Palette },
    { name: 'Menu', href: '/manager/menu', icon: UtensilsCrossed },
    { name: 'Guests', href: '/manager/guests', icon: Users },
    { name: 'Publishing', href: '/manager/publishing', icon: QrCode },
    { name: 'Billing', href: '/manager/billing', icon: TrendingUp },
    { name: 'Help', href: '/manager/help', icon: Sparkles },
  ];

  const handleLogout = () => {
    fetch("/api/logout", { method: "POST" }).then(() => navigate("/manager"));
  };

  const isActivePath = (href: string) => {
    return location.pathname === href;
  };

  const sidebarStyle = {
    '--sidebar-bg': theme.colors.bg.primary,
    '--sidebar-text': theme.colors.text.secondary,
    '--sidebar-hover-bg': theme.colors.bg.secondary,
    '--sidebar-hover-text': theme.colors.text.primary,
    '--sidebar-active-bg': theme.colors.bg.secondary, // Linear style subtle active state
    '--sidebar-active-text': theme.colors.text.primary,
    '--sidebar-border': theme.colors.border.light,
    '--sidebar-brand': theme.colors.text.brand,
    '--sidebar-font-sans': theme.typography.fonts.sans,
    '--sidebar-font-serif': theme.typography.fonts.display,
  } as React.CSSProperties;

  return (
    <div className="min-h-[100dvh] bg-[var(--sidebar-hover-bg)] flex animate-in fade-in duration-[500ms]" style={sidebarStyle}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-[length:var(--ph-title-size)] [font-family:var(--sidebar-font-serif)] font-bold text-[var(--sidebar-active-text)]">
          <Hotel className="text-[var(--sidebar-brand)]" />
          ScanVista
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-[var(--sidebar-text)]">
          {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {/* Sidebar - Linear/Notion style */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transform transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 lg:static lg:block flex flex-col",
        isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 hidden lg:flex gap-2 [font-family:var(--sidebar-font-serif)] font-bold text-2xl text-[var(--sidebar-active-text)] mt-2 mb-4">
          <Hotel className="text-[var(--sidebar-brand)]" />
          ScanVista
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-0.5 [font-family:var(--sidebar-font-sans)]">
          {navigation.map((item) => {
            const active = isActivePath(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onMouseEnter={() => {
                  setHoveredPath(item.href);
                  const comp = routeComponents[item.href as keyof typeof routeComponents];
                  if (comp?.preload) comp.preload();
                }}
                onMouseLeave={() => setHoveredPath(null)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  active ? "text-[var(--sidebar-active-text)]" : "text-[var(--sidebar-text)] hover:text-[var(--sidebar-hover-text)]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-[var(--sidebar-active-bg)] rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {!active && hoveredPath === item.href && (
                  <motion.div
                    layoutId="sidebar-hover"
                    className="absolute inset-0 bg-[var(--sidebar-hover-bg)] rounded-lg opacity-50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <item.icon size={16} className={active ? "text-[var(--sidebar-active-text)]" : "text-[var(--sidebar-text)] opacity-70"} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="p-8 flex flex-col gap-2">
          <div className="flex justify-center gap-10 text-xs text-text-muted mb-2">
            <Link to="/legal/privacy" className="hover:text-text-secondary opacity-80 transition-colors">Privacy</Link>
            <span>&middot;</span>
            <Link to="/legal/terms" className="hover:text-text-secondary opacity-80 transition-colors">Terms</Link>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-hover-text)] w-full rounded-lg transition-colors"
          >
            <LogOut size={16} className="opacity-70" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 relative">
        <div className="absolute top-4 right-8 z-10 hidden lg:block">
          <SyncStatus />
        </div>
        <main className="flex-1 p-8 sm:p-12 lg:p-16 max-w-5xl mx-auto w-full mb-16">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
        <div className="legal-no-print">
          <GlobalFooter />
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/20 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
