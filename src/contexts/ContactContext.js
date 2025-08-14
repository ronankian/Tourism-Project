import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookingSettingsService } from '../services/bookingSettingsService';

const ContactContext = createContext();

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};

export const ContactProvider = ({ children }) => {
  const [contactInfo, setContactInfo] = useState({
    businessName: 'Casa Hacienda',
    email: 'tourismoffice886@gmail.com',
    phone: '(046) 886-9707',
    address: 'Casa Hacienda de Tejeros, Rosario, Cavite',
    officeHours: {
      weekdays: 'Monday - Friday: 8:00 AM - 5:00 PM',
      weekends: 'Saturday - Sunday: By appointment only',
      holidays: 'Holidays: By appointment only'
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });
  const [loading, setLoading] = useState(true);

  // Load contact information on component mount
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        setLoading(true);
        const info = await bookingSettingsService.getContactInformation();
        setContactInfo(info);
      } catch (error) {
        console.error('Error loading contact information:', error);
        // Keep default values if loading fails
      } finally {
        setLoading(false);
      }
    };

    loadContactInfo();
  }, []);

  // Function to refresh contact info (called after admin updates)
  const refreshContactInfo = async () => {
    try {
      const info = await bookingSettingsService.getContactInformation();
      setContactInfo(info);
    } catch (error) {
      console.error('Error refreshing contact information:', error);
    }
  };

  const value = {
    contactInfo,
    loading,
    refreshContactInfo
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};
