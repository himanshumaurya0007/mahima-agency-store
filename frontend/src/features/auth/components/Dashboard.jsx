import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== AUTH PROTECTION =====
  useEffect(() => {

    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const userData = authService.getUserData();
    if (userData) {
      console.log('Dashboard: User authenticated:', userData.username);
      setUser(userData);
    } else {
      console.log('Dashboard: No user data found, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    setLoading(false);
  }, [navigate]);

  // ===== HANDLERS =====
  const handleLogout = async () => {
    console.log('Dashboard: Logout initiated');
    try {
      await authService.logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Dashboard: Logout error:', error);
      authService.clearAuthData();
      navigate('/login', { replace: true });
    }
  };

  const handleViewCustomers = () => {
    navigate('/customers');
  };

  const handleAddCustomer = () => {
    navigate('/customers/add');
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="bg-cream flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-coffee text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ===== NO USER DATA =====
  if (!user) {
    return null;
  }

  // ===== MAIN RENDER =====
  return (
    <div className="bg-cream min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="card mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="font-alpino text-5xl font-bold mb-4 text-black">Welcome to Dashboard</h1>
            <p className="text-xl text-coffee font-medium">
              Login Successful! Welcome to Mahima Agencies
            </p>
          </div>

          {/* User Information Card */}
          <div className="bg-vanilla border-peach mb-6 rounded-lg border-2 p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">User Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-coffee font-semibold">First Name</p>
                <p className="text-lg font-medium text-black capitalize">{user.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-coffee font-semibold">Last Name</p>
                <p className="text-lg font-medium text-black capitalize">{user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-coffee font-semibold">Email</p>
                <p className="text-lg font-medium text-black">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-coffee font-semibold">Username</p>
                <p className="text-lg font-medium text-black">{user.username}</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-center">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                ✓
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Authentication Successful</h3>
                <p className="text-green-600">
                  Your login was completed successfully. Ready for customer management!
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleViewCustomers}
              className="btn-primary h-12 px-8 text-base"
            >
              View All Customers
            </button>

            <button
              onClick={handleAddCustomer}
              className="btn-outline h-12 px-8 text-base"
            >
              Add New Customer
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold h-12 px-8 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
