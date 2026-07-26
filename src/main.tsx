import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global interceptor for session expiration
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) {
    if (window.location.pathname.startsWith('/manager') && window.location.pathname !== '/manager') {
       window.location.href = `/manager?returnTo=${encodeURIComponent(window.location.pathname)}`;
    }
  }
  return response;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
