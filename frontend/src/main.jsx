import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        className: 'custom-toast',
        duration: 4000,
        style: {
          background: '#fff',
          color: '#111827',
          border: '1px solid #E4E7EF',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#22C55E', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#fff' },
        },
      }}
    />
  </StrictMode>,
);
