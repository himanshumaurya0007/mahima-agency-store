import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./components/user/SignUp";
import SignIn from "./components/user/SignIn";
import Dashboard from "./components/user/Dashboard"; // Add this import
import ForgetPassword from "./components/user/ForgotPassword";

const App = () => {
  return (
    <div>
      <Routes>
        {/* Redirect root → /signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />

        {/* Sign Up page */}
        <Route path="/signup" element={<SignUp />} />

        {/* Sign In page */}
        <Route path="/login" element={<SignIn />} />

        {/* Dashboard page - ADD THIS ROUTE */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/reset-password" element={<ForgetPassword />} /> {/* Add this route */}

        {/* Catch all other routes - redirect to signup */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </div>
  );
};

export default App;
