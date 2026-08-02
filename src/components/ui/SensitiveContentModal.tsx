import React from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";
import { Button } from "./Button";

interface SensitiveContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: string[];
  isPublishBlock?: boolean;
  onProceedAnyway?: () => void;
}

export function SensitiveContentModal({
  isOpen,
  onClose,
  samples,
  isPublishBlock = true,
  onProceedAnyway
}: SensitiveContentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-red-200 dark:border-red-900 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-medium text-text-primary">
              Sensitive Information Detected
            </h3>
            <p className="text-sm text-text-secondary">
              This content appears to contain credentials, passwords, or secret tokens. Public guest pages should never expose passwords or API keys.
            </p>
          </div>
        </div>

        {samples && samples.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded p-3 text-xs text-red-800 dark:text-red-300 space-y-1 font-mono">
            {samples.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <AlertTriangle size={12} className="shrink-0 text-red-500" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            {isPublishBlock ? "Edit Content" : "Go Back & Edit"}
          </Button>
          {!isPublishBlock && onProceedAnyway && (
            <Button variant="primary" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={onProceedAnyway}>
              Save Draft Anyway
            </Button>
          )}
          {isPublishBlock && (
            <Button disabled className="opacity-50 cursor-not-allowed bg-red-600 text-white">
              Publish Blocked
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
