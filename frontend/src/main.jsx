import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

const RESET_KEY = 'yeahmusic-reset-v1';
if (!localStorage.getItem(RESET_KEY)) {
  localStorage.removeItem('yeahmusic-storage');
  indexedDB.deleteDatabase('yeahmusic-media');
  localStorage.setItem(RESET_KEY, 'done');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
