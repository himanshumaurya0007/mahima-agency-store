import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Register from './components/user/Register';
import LogIn from './components/user/LogIn';
import Dashboard from './components/user/Dashboard'; // Add this import
import ForgetPassword from './components/user/ForgotPassword';

const App = () => {
  return (
    <div>
      <Routes>
        {/* Redirect root → /register */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        {/* Register page */}
        <Route path="/register" element={<Register />} />
        {/* Sign In page */}
        <Route path="/login" element={<LogIn />} />
        {/* Dashboard page - ADD THIS ROUTE */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password" element={<ForgetPassword />} /> {/* Add this route */}
        {/* Catch all other routes - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Toast Notification */}

           <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            fontFamily: 'Supreme, sans-serif',
          },
          success: {
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            },
          },
        }}
      />
    </div>
  );
};

export default App;
