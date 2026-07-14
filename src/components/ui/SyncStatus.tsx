import React, { useState, useEffect } from 'react';
import { SyncState } from '../../lib/sync';

export function SyncStatus() {
  const [state, setState] = useState<SyncState>('idle');

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleSync = (e: CustomEvent<SyncState>) => {
      setState(e.detail);
      
      if (e.detail === 'synced') {
        // Automatically revert to idle after a few seconds of showing "synced"
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setState('idle');
        }, 3000);
      }
    };

    window.addEventListener('scanvista-sync', handleSync as EventListener);
    return () => {
      window.removeEventListener('scanvista-sync', handleSync as EventListener);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm font-medium transition-all duration-300">
      {state === 'idle' && (
        <span className="flex items-center gap-1.5 text-gray-500 animate-in fade-in duration-500">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse"></span>
          </span>
          Everything synced
        </span>
      )}
      
      {state === 'saving' && (
        <span className="flex items-center gap-1.5 text-gray-500 animate-in fade-in duration-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
          </span>
          Saving...
        </span>
      )}

      {state === 'synced' && (
        <span className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in zoom-in-[0.98] duration-300">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Everything synced just now
        </span>
      )}
    </div>
  );
}
