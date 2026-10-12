import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-serif-display/400.css';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
if (import.meta.env.PROD) {
  document.documentElement.dataset.offlineState =
    'serviceWorker' in navigator ? 'loading' : 'unsupported';
  if ('serviceWorker' in navigator) {
    const prepareOffline = () =>
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          navigator.serviceWorker.ready.then(() => {
            document.documentElement.dataset.offlineState = 'ready';
          });
        })
        .catch((error) => {
          document.documentElement.dataset.offlineState = 'error';
          console.warn('Offline cache registration failed', error);
        });
    if (document.readyState === 'complete') prepareOffline();
    else window.addEventListener('load', prepareOffline, { once: true });
  }
}
