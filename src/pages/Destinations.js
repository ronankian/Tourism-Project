import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Destinations = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectFailed, setRedirectFailed] = useState(false);

  useEffect(() => {
    // Start redirect after a short delay to show the image
    const timer = setTimeout(() => {
      setIsRedirecting(true);
      // Try to redirect to official tourism website
      try {
        const newWindow = window.open('https://tourism.cavite.gov.ph/', '_blank');
        if (!newWindow) {
          setRedirectFailed(true);
        }
      } catch (error) {
        setRedirectFailed(true);
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Full-width Cavite Passport Image Header */}
      <section className="relative w-full overflow-hidden">
        <img 
          src="/images/cavite-tourism-passport-banner.jpg" 
          alt="Cavite Tourism Passport Banner" 
          className="w-full h-auto object-contain"
        />
      </section>

      {/* Loading/Redirecting Section with White Background */}
      {isRedirecting && (
        <section className="bg-white min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-gray-800 max-w-md mx-auto px-4"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
            <h2 className="text-3xl font-bold mb-4">Redirecting...</h2>
            <p className="text-lg mb-6">Taking you to the official Cavite Tourism website</p>
            
            {redirectFailed && (
              <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  If the redirect didn't work automatically, please click the link below:
                </p>
                <a 
                  href="https://tourism.cavite.gov.ph/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white hover:bg-green-700 font-bold py-3 px-6 rounded-lg transition-all duration-300 inline-block"
                >
                  Visit Official Cavite Tourism Website
                </a>
              </div>
            )}
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default Destinations; 