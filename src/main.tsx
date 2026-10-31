import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for Android PWA / WebAPK install and offline sync
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New update ready');
  },
  onOfflineReady() {
    console.log('[PWA] App is ready for offline and installed mobile usage');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
