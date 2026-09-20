// Force rebuild: 2025-01-08-v3
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(container);
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Service worker registration failed', error)));
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
