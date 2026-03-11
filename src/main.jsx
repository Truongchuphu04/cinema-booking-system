import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

// Global image error handler to prevent placeholder.com requests
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG' && e.target.src.includes('via.placeholder.com')) {
    console.warn('🖼️ Replacing via.placeholder.com with local SVG:', e.target.src);
    e.target.src = '/placeholder-poster.svg';
  }
}, true);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
