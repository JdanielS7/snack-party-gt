import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Wrapper global de fetch para detectar y registrar errores (404/otros)
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    try {
      const res = await originalFetch(input, init);
      if (!res.ok) {
        const info = `${res.status} ${res.statusText} - ${url}`;
        if (res.status === 404) {
          console.warn(`[API 404] ${info}`);
        } else if (res.status >= 500) {
          console.error(`[API 5xx] ${info}`);
        } else {
          console.error(`[API Error] ${info}`);
        }
        try {
          const cloned = res.clone();
          const text = await cloned.text();
          if (text) {
            console.debug('[API Response Body]', text);
          }
        } catch (_) {
          // Ignorar errores al leer el body
        }
      }
      return res;
    } catch (err) {
      console.error(`[API Network Error] ${url}`, err);
      throw err;
    }
  };

  // Capturar promesas no manejadas (por ejemplo, errores de fetch no capturados)
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
  });

  // Capturar errores globales en runtime
  window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.message, event.error || '');
  });

  // Log rápido del API base en desarrollo
  try {
    if (import.meta && import.meta.env && import.meta.env.MODE === 'development') {
      const api = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      console.info('[Frontend] API base:', api);
    }
  } catch (_) {
    // Ignorar si no existe import.meta
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
