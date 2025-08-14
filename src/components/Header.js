import React, { useState, useEffect } from 'react';
import { useContact } from '../contexts/ContactContext';

const Header = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { contactInfo } = useContact();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate.replace(' at ', ' | ');
  };

  return (
    <div className="bg-[#5d9c59] text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
        {/* Left side - Contact Information */}
        <div className="flex items-center space-x-6">
          {/* Facebook */}
          <a 
            href="https://www.facebook.com/profile.php?id=61575235395467" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>{contactInfo?.businessName || 'Casa Hacienda'}</span>
          </a>

          {/* Email */}
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>{contactInfo?.email || 'tourismoffice886@gmail.com'}</span>
          </div>

          {/* Phone */}
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>{contactInfo?.phone || '(046) 886-9707'}</span>
          </div>
        </div>

        {/* Right side - Date and Time */}
        <div className="text-sm font-medium">
          {formatDateTime(currentDateTime)}
        </div>
      </div>
    </div>
  );
};

export default Header; 