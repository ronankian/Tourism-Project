import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: userData?.firstName || firebaseUser.displayName?.split(' ')[0] || 'User',
            lastName: userData?.lastName || firebaseUser.displayName?.split(' ')[1] || '',
            displayName: firebaseUser.displayName || userData?.fullName || 'User',
            role: userData?.role || 'traveler',
            avatar: userData?.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
            lastName: firebaseUser.displayName?.split(' ')[1] || '',
            displayName: firebaseUser.displayName || 'User',
            role: 'traveler',
            avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          });
        }
      } else {
        setUser(null);
    }
    setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, phone, password) => {
    try {
      let userCredential;
      
      if (email) {
        // Login with email
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else if (phone) {
        // For phone login, we need to find the user by phone number first
        // This is a simplified approach - in production you might want to use phone auth
        toast.error('Phone login not implemented yet. Please use email.');
        return false;
      } else {
        toast.error('Please enter a valid email or phone number.');
        return false;
      }
      
      toast.success('Welcome back!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      let userCredential;
      let firebaseUser;
      
      if (userData.email) {
        // Register with email
        userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        firebaseUser = userCredential.user;
      } else if (userData.phone) {
        // For phone registration, we need to implement phone auth
        toast.error('Phone registration not implemented yet. Please use email.');
        return false;
      } else {
        toast.error('Please enter a valid email or phone number.');
        return false;
      }

      // Update display name
      const fullName = `${userData.firstName} ${userData.lastName}`;
      await updateProfile(firebaseUser, {
        displayName: fullName
      });

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: fullName,
        email: userData.email,
        phone: userData.phone,
        role: 'traveler',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        createdAt: new Date().toISOString()
      });

      toast.success('Account created successfully!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    toast.success('Logged out successfully');
    navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out. Please try again.');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('No user logged in');
        return;
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: userData.name
      });

      // Update Firestore user data
      await setDoc(doc(db, 'users', currentUser.uid), {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'traveler',
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        updatedAt: new Date().toISOString()
      }, { merge: true });

    toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error updating profile. Please try again.');
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 