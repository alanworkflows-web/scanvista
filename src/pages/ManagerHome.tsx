import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ManagerLayout } from "../components/ManagerLayout";
import { Image as ImageIcon, Loader2, Save, ArrowRight, CheckCircle2, AlertCircle, Activity, Utensils, Wifi, QrCode, CreditCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useManagerProperty } from "../hooks/useManagerProperty";
// removed RestaurantProfile
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function ManagerHome() {
  const {
    property,
    dishes,
    amenities,
    categories,
    loading,
    error: multiPropertyError,
  } = useManagerProperty();
  
  const propertySlug = property?.slug;
  const isReadOnly = property?.entitlement?.accessMode === "read_only";
  
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (multiPropertyError) {
    return (
      <ManagerLayout>
        <div className="bg-amber-50 border border-amber-200 px-4 py-6 text-center sm:px-6 lg:px-8 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-amber-900 mb-2">Multiple Restaurants Found</h2>
          <p className="text-amber-800">Switching is not yet available.</p>
        </div>
      </ManagerLayout>
    );
  }

  // Evaluate "What should I do next?"
  const isBrandSetup = !!property?.name && !!property?.description;
  const isMenuSetup = dishes && dishes.length > 0;
  let intelligentAction = null;

  if (isReadOnly) {
    intelligentAction = {
      title: "Renew your Subscription",
      desc: "Your workspace is locked in Read-Only mode.",
      btnText: "Update Billing",
      action: () => navigate("/manager/plan"),
      icon: <CreditCard className="text-red-500 mb-4" size={48} />,
      bg: "bg-red-50/50",
      border: "border-red-200"
    };
  } else if (!property?.bannerUrl) {
    intelligentAction = {
      title: "Add a hero image to improve your guests' first impression.",
      desc: "A beautiful cover photo sets the tone for your restaurant.",
      btnText: "Upload Image",
      action: () => navigate('/manager/brand'),
      icon: <ImageIcon className="text-emerald-500 mb-4" size={48} />,
      bg: "bg-emerald-50/50",
      border: "border-emerald-200"
    };
  } else if (!dishes || dishes.length === 0) {
    intelligentAction = {
      title: "Build your first menu.",
      desc: "Add your first category and dish to get started.",
      btnText: "Open Menu Studio",
      action: () => navigate("/manager/operations"),
      icon: <Utensils className="text-emerald-500 mb-4" size={48} />,
      bg: "bg-emerald-50/50",
      border: "border-emerald-200"
    };
  } else if (!property?.qrPrintsThisMonth || property.qrPrintsThisMonth === 0) {
    intelligentAction = {
      title: "Download your first table QR.",
      desc: "Print your QR code so guests can access your menu.",
      btnText: "Open Publishing Center",
      action: () => navigate("/manager/qr"),
      icon: <QrCode className="text-emerald-500 mb-4" size={48} />,
      bg: "bg-emerald-50/50",
      border: "border-emerald-200"
    };
  } else {
    intelligentAction = {
      title: "Your restaurant is fully ready. Excellent work.",
      desc: "Your menu is live and QR codes are printed.",
      btnText: null,
      action: null,
      icon: <CheckCircle2 className="text-emerald-500 mb-4" size={48} />,
      bg: "bg-emerald-50/50",
      border: "border-emerald-200"
    };
  }

  return (
    <ManagerLayout>
      <div className="mb-12 animate-in fade-in slide-in-from-bottom-2 duration-[300ms]">
        <h1 className="text-[length:var(--ph-title-size)] [font-family:var(--ph-font-serif)] font-bold text-[var(--ph-title-color)] mb-2">
          {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}, {property?.name || "Restaurant Owner"}
        </h1>
        <p className="text-[length:var(--ph-desc-size)] [font-family:var(--ph-font-sans)] text-[var(--ph-desc-color)] flex items-center gap-2">
          {isReadOnly ? (
            <span className="flex items-center gap-1.5 text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-md">
              <span className="relative flex h-2 w-2"><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
              Read-Only Mode
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
              <span className="relative flex h-2 w-2">
                <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"></motion.span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live & Receiving Guests
            </span>
          )}
          &middot; {property?.entitlement?.plan === "premium" ? "Premium Plan" : "Free Plan"}
        </p>
      </div>

      <div className="mb-16 animate-in fade-in slide-in-from-bottom-3 duration-[400ms]">
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className={`p-8 md:p-12 flex flex-col items-center justify-center text-center border-2 ${intelligentAction.border} ${intelligentAction.bg}`}>
          {intelligentAction.icon}
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2 max-w-lg">{intelligentAction.title}</h2>
          <p className="text-gray-600 mb-8 max-w-md">{intelligentAction.desc}</p>
          {intelligentAction.btnText && (
            <Button size="lg" onClick={intelligentAction.action} className="px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.98]">
              {intelligentAction.btnText}
            </Button>
          )}
        </Card>
        </motion.div>
      </div>

      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-[500ms]">
        <h2 className="text-xl font-bold text-[var(--ph-title-color)] mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card hoverable className="p-6 cursor-pointer group flex flex-col items-center justify-center text-center gap-3" onClick={() => navigate('/manager/menu')}>
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:-translate-y-1 hover:shadow-lg active:scale-95 group-active:scale-95 transition-transform">
              <Utensils size={24} />
            </div>
            <span className="font-bold text-gray-900">Menu Studio</span>
          </Card>
          <Card hoverable className="p-6 cursor-pointer group flex flex-col items-center justify-center text-center gap-3" onClick={() => navigate('/manager/publishing')}>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:-translate-y-1 hover:shadow-lg active:scale-95 group-active:scale-95 transition-transform">
              <QrCode size={24} />
            </div>
            <span className="font-bold text-gray-900">Publishing Center</span>
          </Card>
          <Card hoverable className="p-6 cursor-pointer group flex flex-col items-center justify-center text-center gap-3" onClick={() => navigate('/manager/restaurant')}>
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:-translate-y-1 hover:shadow-lg active:scale-95 group-active:scale-95 transition-transform">
              <AlertCircle size={24} />
            </div>
            <span className="font-bold text-gray-900">Restaurant Profile</span>
          </Card>
          <Card hoverable className="p-6 cursor-pointer group flex flex-col items-center justify-center text-center gap-3" onClick={() => navigate('/manager/billing')}>
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:-translate-y-1 hover:shadow-lg active:scale-95 group-active:scale-95 transition-transform">
              <CreditCard size={24} />
            </div>
            <span className="font-bold text-gray-900">Growth Plan</span>
          </Card>
        </div>
      </div>

      <div className="mb-16 animate-in fade-in slide-in-from-bottom-5 duration-[600ms]">
        <h2 className="text-xl font-bold text-[var(--ph-title-color)] mb-6">Recent Activity</h2>
        <Card className="p-6 md:p-8">
          <div className="space-y-8">
            <div className="flex gap-4 relative">
              <div className="absolute top-8 bottom-[-2rem] left-[11px] w-0.5 bg-gray-100"></div>
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 z-10">
                <CheckCircle2 size={14} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Workspace Created</h3>
                <p className="text-sm text-gray-500">You created your ScanVista workspace.</p>
              </div>
            </div>
            
            <div className="flex gap-4 relative">
              <div className="absolute top-8 bottom-[-2rem] left-[11px] w-0.5 bg-gray-100"></div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${isBrandSetup ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                {isBrandSetup ? <CheckCircle2 size={14} className="text-emerald-600" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
              </div>
              <div>
                <h3 className={`font-bold ${isBrandSetup ? 'text-gray-900' : 'text-gray-400'}`}>Brand Identity Configured</h3>
                <p className="text-sm text-gray-500">{isBrandSetup ? 'Restaurant name and location saved.' : 'Pending configuration.'}</p>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="absolute top-8 bottom-[-2rem] left-[11px] w-0.5 bg-gray-100 hidden"></div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${isMenuSetup ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                {isMenuSetup ? <CheckCircle2 size={14} className="text-emerald-600" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
              </div>
              <div>
                <h3 className={`font-bold ${isMenuSetup ? 'text-gray-900' : 'text-gray-400'}`}>Digital Menu Published</h3>
                <p className="text-sm text-gray-500">{isMenuSetup ? `${dishes?.length} dishes available for guests.` : 'Pending menu creation.'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      </ManagerLayout>
  );
}
