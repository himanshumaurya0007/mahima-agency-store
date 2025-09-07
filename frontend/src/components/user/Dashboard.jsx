import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage to confirm login success
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="card max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-hero text-black mb-4">Welcome to Dashboard</h1>
            <p className="text-section text-coffee">
              🎉 Login Successful! Welcome to Mahima Agencies
            </p>
          </div>

          {user && (
            <div className="bg-vanilla rounded-lg p-6 mb-6 border border-peach">
              <h2 className="text-card-title text-black mb-4">User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-caption text-coffee">First Name:</p>
                  <p className="text-body text-black font-medium capitalize">
                    {user.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-coffee">Last Name:</p>
                  <p className="text-body text-black font-medium capitalize">
                    {user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-coffee">Email:</p>
                  <p className="text-body text-black font-medium">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-coffee">Username:</p>
                  <p className="text-body text-black font-medium">
                    {user.username}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center">
                <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    Authentication Successful
                  </h3>
                  <p className="text-green-600">
                    Your login was completed successfully. No console errors!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/signin';
              }}
              className="btn-secondary px-6 py-3 rounded-lg font-medium"
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
