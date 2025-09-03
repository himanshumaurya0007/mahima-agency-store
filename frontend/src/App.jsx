import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./components/user/SignUp";

const App = () => {
  return (
    <div className="flex min-h-screen w-screen flex-col justify-between bg-gray-50">
      <Routes>
        {/* Redirect root → /signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />

        {/* Sign Up page */}
        <Route path="/signup" element={<SignUp />} />

        {/* Future: Login, Dashboard, etc. */}
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </div>
  );
};

export default App;
