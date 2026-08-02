import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseDraftRecoveryOptions<T> {
  key: string;
  serverData: T | null;
  onSaveToServer?: (data: T) => Promise<void>;
  debounceMs?: number;
}

export function useDraftRecovery<T>({
  key,
  serverData,
  onSaveToServer,
  debounceMs = 5000
}: UseDraftRecoveryOptions<T>) {
  const [draft, setDraft] = useState<T | null>(null);
  const [hasUnsavedDraft, setHasUnsavedDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestDraftRef = useRef<T | null>(null);

  const storageKey = `scanvista_draft_${key}`;
  const timestampKey = `scanvista_draft_time_${key}`;

  // Check for existing local draft on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const storedTime = localStorage.getItem(timestampKey);
      if (stored && storedTime) {
        const parsed = JSON.parse(stored);
        setHasUnsavedDraft(true);
        // Compare with serverData if available
        toast.info("Unsaved draft found from a previous session", {
          action: {
            label: "Restore Draft",
            onClick: () => {
              setDraft(parsed);
              toast.success("Draft restored!");
            }
          },
          duration: 8000
        });
      }
    } catch (e) {
      console.warn("Failed to check local draft recovery:", e);
    }
  }, [key]);

  // Update latest ref
  useEffect(() => {
    latestDraftRef.current = draft;
  }, [draft]);

  // Auto-save to localStorage with debouncing (5-10s)
  const updateDraft = useCallback((newData: T | ((prev: T | null) => T)) => {
    setDraft((prev) => {
      const resolved = typeof newData === 'function' ? (newData as any)(prev) : newData;
      latestDraftRef.current = resolved;

      // Save to localStorage immediately as draft snapshot
      try {
        localStorage.setItem(storageKey, JSON.stringify(resolved));
        localStorage.setItem(timestampKey, new Date().toISOString());
        setHasUnsavedDraft(true);
      } catch (e) {
        console.warn("Draft local caching failed:", e);
      }

      // Debounce server autosave
      if (onSaveToServer) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(async () => {
          try {
            setIsSaving(true);
            await onSaveToServer(resolved);
            // Clear draft storage after successful server persist
            localStorage.removeItem(storageKey);
            localStorage.removeItem(timestampKey);
            setHasUnsavedDraft(false);
          } catch (err) {
            console.warn("Debounced auto-save failed:", err);
          } finally {
            setIsSaving(false);
          }
        }, debounceMs);
      }

      return resolved;
    });
  }, [storageKey, timestampKey, onSaveToServer, debounceMs]);

  // Save on blur & Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (latestDraftRef.current && onSaveToServer) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(latestDraftRef.current));
          localStorage.setItem(timestampKey, new Date().toISOString());
        } catch (e) {
          // ignore on exit
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [storageKey, timestampKey, onSaveToServer]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(timestampKey);
    setHasUnsavedDraft(false);
  }, [storageKey, timestampKey]);

  return {
    draft,
    setDraft,
    updateDraft,
    hasUnsavedDraft,
    clearDraft,
    isSaving
  };
}
