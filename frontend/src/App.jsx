// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// User
import Register from './features/auth/components/Register'
import Login from './features/auth/components/Login'
import Dashboard from './features/auth/components/Dashboard'
import ForgotPassword from './features/auth/components/ForgotPassword'

// Customer
import CustomersList from './features/customers/components/CustomersList';
import AddCustomer from './features/customers/components/AddCustomer';
import UpdateCustomer from './features/customers/components/UpdateCustomer';

// Test Component
// import Test from './Test';

const App = () => {
  return (
    <div>
      <Routes>
        {/* Redirect root to register */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* User Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password" element={<ForgotPassword />} />

        {/* Customer Routes */}
        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        
        {/* FIXED: Changed :id to :customerId to match UpdateCustomer component */}
        <Route path="/customers/update/:customerId" element={<UpdateCustomer />} />

        {/* Test Route */}
        {/* <Route path="/test" element={<Test />} /> */}

        {/* Catch-all: redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* Toast Notifications */}
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
