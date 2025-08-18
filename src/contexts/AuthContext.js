import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { passwordService } from '../services/passwordService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if password system is initialized on component mount
  useEffect(() => {
    const initializePasswordSystem = async () => {
      try {
        const isInitialized = await passwordService.isPasswordSystemInitialized();
        if (!isInitialized) {
          // Initialize with default password if not already done
          await passwordService.initializeAdminPassword("Casahacienda1897");
          console.log('Password system initialized with default password');
        }
      } catch (error) {
        console.error('Error initializing password system:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePasswordSystem();
  }, []);

  // Admin authentication with database-stored password
  const adminLoginWithPasskey = async (passkey) => {
    try {
      const isValid = await passwordService.verifyAdminPassword(passkey);
      
      if (isValid) {
        setAdminAuthenticated(true);
        toast.success('Admin access granted');
        return true;
      } else {
        setAdminAuthenticated(false);
        toast.error('Invalid passkey');
        return false;
      }
    } catch (error) {
      console.error('Error during admin login:', error);
      setAdminAuthenticated(false);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const adminLogout = () => {
    setAdminAuthenticated(false);
    toast.success('Admin access removed');
    navigate('/');
  };

  const value = {
    isAdminAuthenticated: adminAuthenticated,
    adminLoginWithPasskey,
    adminLogout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};