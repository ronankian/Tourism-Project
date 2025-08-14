import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();

  // Admin authentication with passkey
  const adminLoginWithPasskey = (passkey) => {
    const adminPasskey = "Casahacienda1897";
    
    if (passkey === adminPasskey) {
      setAdminAuthenticated(true);
      toast.success('Admin access granted');
      return true;
    } else {
      setAdminAuthenticated(false);
      toast.error('Invalid passkey');
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
    adminLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};