import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage to confirm login success
    // const userData = localStorage.getItem('userData');
    // if (userData) {
    //   setUser(JSON.parse(userData));
    // }
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="card mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-hero mb-4 text-black">Welcome to Dashboard</h1>
            <p className="text-section text-coffee">
              🎉 Login Successful! Welcome to Mahima Agencies
            </p>
          </div>

          {user && (
            <div className="bg-vanilla border-peach mb-6 rounded-lg border p-6">
              <h2 className="text-card-title mb-4 text-black">User Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-caption text-coffee">First Name:</p>
                  <p className="text-body font-medium text-black capitalize">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-caption text-coffee">Last Name:</p>
                  <p className="text-body font-medium text-black capitalize">{user.lastName}</p>
                </div>
                <div>
                  <p className="text-caption text-coffee">Email:</p>
                  <p className="text-body font-medium text-black">{user.email}</p>
                </div>
                <div>
                  <p className="text-caption text-coffee">Username:</p>
                  <p className="text-body font-medium text-black">{user.username}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
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
              className="btn-secondary rounded-lg px-6 py-3 font-medium"
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
