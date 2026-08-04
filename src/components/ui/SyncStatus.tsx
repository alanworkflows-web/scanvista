import React, { useState, useEffect } from 'react';
import { SyncState } from '../../lib/sync';
import { useManagerProperty } from '../../hooks/useManagerProperty';

export function SyncStatus() {
  const [state, setState] = useState<SyncState>('idle');
  const { status } = useManagerProperty();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleSync = (e: CustomEvent<SyncState>) => {
      setState(e.detail);
      
      if (e.detail === 'synced') {
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

  if (state === 'saving') {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-text-muted transition-all duration-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span>Saving...</span>
      </div>
    );
  }

  if (state === 'synced') {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 transition-all duration-300">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>Saved</span>
      </div>
    );
  }

  const isPublishedLive = status?.publishState === 'PUBLISHED';
  const isPending = status?.publishState === 'PUBLISHED_PENDING_CHANGES';

  return (
    <div className="flex items-center gap-2 text-xs font-medium transition-all duration-300">
      <span className="relative flex h-2 w-2">
        <span className={`relative inline-flex rounded-full h-2 w-2 ${isPublishedLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
      </span>
      <span className={isPublishedLive ? 'text-emerald-700' : 'text-amber-800'}>
        {status?.badgeLabel || (isPublishedLive ? 'Published' : isPending ? 'Draft Changes Pending' : 'Draft')}
      </span>
    </div>
  );
}
