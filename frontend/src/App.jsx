// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// User Components
import Register from './components/user/Register';
import LogIn from './components/user/LogIn';
import Dashboard from './components/user/Dashboard';
import ForgotPassword from './components/user/ForgotPassword';

// Customer Components
import CustomersList from './components/customer/CustomersList';
import AddCustomer from './components/customer/AddCustomer';
import UpdateCustomer from './components/customer/UpdateCustomer';

// Master Components
import CategoryPage from './components/master/pages/CategoryPage';
import PackSizePage from './components/master/pages/PackSizePage';
import VolumeUnitPage from './components/master/pages/VolumeUnitPage';

// Test Component
import Test from './Test';

const App = () => {
  return (
    <div>
      <Routes>
        {/* Redirect root to register */}
        <Route path="/" element={<Navigate to="/register" replace />} />
        {/* User Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        {/* Customer Routes */}
        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        <Route path="/customers/update/:customerId" element={<UpdateCustomer />} />
        
        {/* Add these routes in your Routes component */}
        <Route path="/master/categories" element={<CategoryPage />} />
        <Route path="/master/pack-sizes" element={<PackSizePage />} />
        <Route path="/master/volume-units" element={<VolumeUnitPage />} />

        {/* Test Route */}
        <Route path="/test" element={<Test />} />
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
