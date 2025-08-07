import React, { useEffect } from 'react';

const Destinations = () => {
  useEffect(() => {
    // Redirect to the official Cavite Tourism website
    window.location.href = 'https://tourism.cavite.gov.ph';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5d9c59] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Cavite Tourism</h2>
        <p className="text-gray-600">You are being redirected to the official Cavite Tourism website...</p>
        <p className="text-sm text-gray-500 mt-2">
          If you are not redirected automatically,{' '}
          <a 
            href="https://tourism.cavite.gov.ph" 
            className="text-[#5d9c59] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Destinations; 