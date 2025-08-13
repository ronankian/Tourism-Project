import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Book Now', href: '/booking' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img src="/images/rtc.png" alt="Casa Hacienda de Tejeros" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Casa Hacienda de Tejeros</h3>
                <p className="text-sm text-gray-400">Rosario, Cavite</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover the beauty, culture, and heritage of Casa Hacienda de Tejeros in Rosario, Cavite. 
              Experience authentic Filipino hospitality and explore our amazing destinations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/destinations" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Tour Packages
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Local Guides
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Transportation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Accommodation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-[#5d9c59]">📍</span>
                <div>
                  <p className="text-sm text-gray-400">Casa Hacienda de Tejeros</p>
                  <p className="text-sm text-gray-400">Rosario, Cavite</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[#5d9c59]">📞</span>
                <p className="text-sm text-gray-400">+63 46 123 4567</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-[#5d9c59]">✉️</span>
                <p className="text-sm text-gray-400">tourism@rosario.gov.ph</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Casa Hacienda de Tejeros. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 