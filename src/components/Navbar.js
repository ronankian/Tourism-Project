import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdminAuthenticated } = useAuth();

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-center items-center py-4 relative">
          {/* Centered Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-[#df2e38]'
                    : 'text-gray-700 hover:text-[#df2e38]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden absolute right-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-[#df2e38]"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-[#df2e38]'
                      : 'text-gray-700 hover:text-[#df2e38]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 