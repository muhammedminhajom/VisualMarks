import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from './Dashboard';
import { ToastProvider } from '../components/Toast';
import '../index.css';

ReactDOM.createRoot(document.getElementById('dashboard-root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  </React.StrictMode>
);