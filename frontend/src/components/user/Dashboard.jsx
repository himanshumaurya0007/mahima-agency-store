import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ ENHANCED PROTECTION WITH LOADING STATE
  useEffect(() => {
    console.log('🏠 Dashboard: Component mounted, checking authentication...');
    
    // Check authentication on component mount
    if (!authService.isAuthenticated()) {
      console.log('❌ Dashboard: Not authenticated, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    // If authenticated, get user data
    const userData = authService.getUserData();
    if (userData) {
      console.log('✅ Dashboard: User authenticated:', userData.username);
      setUser(userData);
    } else {
      console.log('❌ Dashboard: No user data found, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = async () => {
    console.log('🚪 Dashboard: Logout initiated');
    try {
      await authService.logout();
      // ✅ USE replace: true to prevent back navigation to dashboard
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('🚨 Dashboard: Logout error:', error);
      // Force logout even if API fails
      authService.clearAuthData();
      navigate('/login', { replace: true });
    }
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="bg-cream flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-coffee">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user data, don't render (will redirect in useEffect)
  if (!user) {
    return null;
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="card mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-hero mb-4 text-black">Welcome to Dashboard</h1>
            <p className="text-section text-coffee">Login Successful! Welcome to Mahima Agencies</p>
          </div>

          <div className="bg-vanilla border-peach mb-6 rounded-lg border p-6">
            <h2 className="text-card-title mb-4 text-black">User Information</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-caption text-coffee">First Name</p>
                <p className="text-body font-medium text-black capitalize">{user.firstName}</p>
              </div>
              <div>
                <p className="text-caption text-coffee">Last Name</p>
                <p className="text-body font-medium text-black capitalize">{user.lastName}</p>
              </div>
              <div>
                <p className="text-caption text-coffee">Email</p>
                <p className="text-body font-medium text-black">{user.email}</p>
              </div>
              <div>
                <p className="text-caption text-coffee">Username</p>
                <p className="text-body font-medium text-black">{user.username}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">✓</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Authentication Successful</h3>
                  <p className="text-green-600">Your login was completed successfully. Ready for customer management!</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
