import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useContact } from '../contexts/ContactContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdminAuthenticated } = useAuth();
  const { contactInfo } = useContact();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigation = useMemo(() => {
    const base = [
      { name: 'Home', href: '/' },
      { name: 'Tourism', href: '/destinations' },
      { name: 'News', href: '/news' },
      { name: 'About', href: '/about' },
      { name: 'Book Now', href: '/booking' },
    ];
    if (isAdminAuthenticated) {
      base.push({ name: 'Dashboard', href: '/admin' });
    }
    return base;
  }, [isAdminAuthenticated]);

  const isActive = (path) => {
    // Simple exact match for all routes
    return location.pathname === path;
  };

  const handleLogoClick = () => {
    navigate('/');
    setIsOpen(false); // Close sidebar when logo is clicked
  };

  return (
    <>
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-center items-center py-4 relative">
          {/* Centered Desktop Navigation */}
            <div className="hidden min-[801px]:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-[#5d9c59]'
                    : 'text-gray-700 hover:text-[#5d9c59]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

            {/* Mobile RTC Logo - Center (only shows when sidebar toggle is active) */}
            <div className="max-[800px]:block min-[801px]:hidden absolute left-1/2 transform -translate-x-1/2">
              <img 
                src="/images/rtc.png" 
                alt="RTC Logo" 
                className="h-8 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={handleLogoClick}
              />
            </div>

            {/* Mobile menu button - Left side */}
            <div className="max-[800px]:block min-[801px]:hidden absolute left-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-[#5d9c59] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5d9c59]"
                aria-label="Toggle navigation menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
            </button>
          </div>
        </div>
        </div>
      </nav>

      {/* Mobile Sidebar - Full Screen from Left */}
      <div 
        className={`fixed inset-0 bg-white z-[99999] max-[800px]:block min-[801px]:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ isolation: 'isolate' }}
      >
        <div className="flex flex-col h-full">
          {/* Top Section - All elements in one row */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            {/* Left Side - Facebook and Phone */}
            <div className="flex items-center space-x-4">
              {/* Facebook Logo Only */}
              <a 
                href="https://www.facebook.com/profile.php?id=61575235395467" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#5d9c59] hover:text-[#4a7c47] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              {/* Phone Only */}
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span className="text-sm">{contactInfo?.phone || '(046) 886-9707'}</span>
              </div>
            </div>

            {/* Right Side - Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Center Section - RTC Logo */}
          <div className="flex flex-col items-center justify-center px-4 py-4">
            <div className="text-center">
              <img 
                src="/images/rtc.png" 
                alt="RTC Logo" 
                className="max-h-32 max-w-full object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={handleLogoClick}
              />
          </div>
        </div>

          {/* Bottom Section - Navigation Items */}
          <div className="px-4 pb-4">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-[#5d9c59] text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#5d9c59]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            </div>
          </div>
      </div>
    </>
  );
};

export default Navbar; 