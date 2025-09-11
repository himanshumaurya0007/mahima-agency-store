import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Register from "./components/user/Register";
import LogIn from "./components/user/LogIn";
import Dashboard from "./components/user/Dashboard"; // Add this import
import ForgetPassword from "./components/user/ForgotPassword";

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
    </div>
  );
};

export default App;
