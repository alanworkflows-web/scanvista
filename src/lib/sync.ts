export type SyncState = 'idle' | 'saving' | 'synced';

export const dispatchSync = (state: SyncState) => {
  window.dispatchEvent(new CustomEvent('scanvista-sync', { detail: state }));
};
