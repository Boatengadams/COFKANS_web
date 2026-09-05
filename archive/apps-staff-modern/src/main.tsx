import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { FirebaseAuthProvider } from './app/contexts/FirebaseAuthContext';
import StaffPortal from './app/pages/StaffPortal';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FirebaseAuthProvider>
      <Toaster position="top-right" />
      <StaffPortal />
    </FirebaseAuthProvider>
  </React.StrictMode>,
);
