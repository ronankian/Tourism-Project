import React from 'react';
import { Link } from 'react-router-dom';
import { useContact } from '../contexts/ContactContext';

const Footer = () => {
  const { contactInfo } = useContact();
  
  return (
    <footer className="bg-[#5d9c59] text-white py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-4 md:space-y-6">
          {/* First row - Logos */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-8">
            <img src="/images/rtc.png" alt="RTC Logo" className="h-12 sm:h-16 md:h-20 w-auto object-contain" />
            <img src="/images/jlr.png" alt="JLR Logo" className="h-12 sm:h-16 md:h-20 w-auto object-contain" />
            <img src="/images/pbr.png" alt="PBR Logo" className="h-12 sm:h-16 md:h-20 w-auto object-contain" />
          </div>

          {/* Second row - Official Website Title */}
          <div>
            <h3 className="text-sm sm:text-base md:text-lg font-semibold px-2">
              The Official Website of the {contactInfo?.businessName || 'Casa Hacienda De Tejeros'}
            </h3>
          </div>

          {/* Third row - Privacy Policy */}
          <div>
            <Link 
              to="/privacy-policy" 
              className="text-white hover:text-gray-200 transition-colors duration-200 no-underline text-sm sm:text-base"
            >
              Privacy Policy
            </Link>
          </div>

          {/* Fourth row - Credits */}
          <div>
            <p className="text-xs sm:text-sm">© 2025</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 