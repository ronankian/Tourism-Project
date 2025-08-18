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
          // Get default password from environment variable or use a secure fallback
          const defaultPassword = process.env.REACT_APP_DEFAULT_ADMIN_PASSWORD;
          
          if (!defaultPassword) {
            console.error('Default admin password not configured. Please set REACT_APP_DEFAULT_ADMIN_PASSWORD environment variable.');
            // Don't initialize with a hardcoded password - let admin set it manually
            setIsLoading(false);
            return;
          }
          
          // Initialize with environment variable password
          await passwordService.initializeAdminPassword(defaultPassword);
          // Remove the console.log that exposed the password initialization
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