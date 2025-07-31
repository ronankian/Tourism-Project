import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
  
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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
      if (!email) {
        toast.error('Please enter a valid email address.');
        return false;
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
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
      
      if (userData.email && userData.email.trim()) {
        // Register with email
        userCredential = await createUserWithEmailAndPassword(auth, userData.email.trim(), userData.password);
        firebaseUser = userCredential.user;
        
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
          role: 'traveler',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          createdAt: new Date().toISOString(),
          emailVerified: false
        });

        // Send verification email using Firebase's built-in method with custom action settings
        const actionCodeSettings = {
          url: `${window.location.origin}/firebase-action`,
          handleCodeInApp: true
        };
        
        await sendEmailVerification(firebaseUser, actionCodeSettings);

        toast.success('Account created successfully! Please check your email to verify your account.');
        return { success: true };
      } else {
        toast.error('Please enter a valid email address.');
        return { success: false };
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password must be at least 6 characters long.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
      }
      
      toast.error(errorMessage);
      return { success: false };
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

  const updateUserProfile = async (userData) => {
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

  // Resend email verification using Firebase native method
  const resendEmailVerification = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('No user logged in');
        return false;
      }

      if (currentUser.emailVerified) {
        toast.success('Email is already verified!');
        return true;
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/firebase-action`,
        handleCodeInApp: true
      };
      
      await sendEmailVerification(currentUser, actionCodeSettings);
      toast.success('Verification email sent! Please check your inbox.');
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
      return false;
    }
  };

  // Check if email is verified and update user data
  const checkEmailVerification = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return false;
      }

      // Reload user to get latest email verification status
      await currentUser.reload();
      
      if (currentUser.emailVerified) {
        // Update Firestore user document
        await updateDoc(doc(db, 'users', currentUser.uid), {
          emailVerified: true,
          verifiedAt: serverTimestamp()
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  };

  const sendPasswordReset = async (email) => {
    try {
              // Use Firebase's built-in password reset email with custom action settings
        const actionCodeSettings = {
          url: `${window.location.origin}/firebase-action`,
          handleCodeInApp: true
        };
        
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        toast.success('Password reset email sent! Please check your inbox.');
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
      }
      
      toast.error(errorMessage);
      return false;
    }
  };



  // Delete user account function
  const deleteUserAccount = async (password) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error('No user logged in');
        return false;
      }

      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user data from Firestore
      await setDoc(doc(db, 'users', currentUser.uid), {}, { merge: true });

      // Delete verification codes if any
      if (currentUser.email) {
        await setDoc(doc(db, 'verification_codes', currentUser.email), {}, { merge: true });
        await setDoc(doc(db, 'reset_codes', currentUser.email), {}, { merge: true });
      }

      // Delete the user account from Firebase Auth
      await deleteUser(currentUser);

      toast.success('Account deleted successfully');
      navigate('/');
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      let errorMessage = 'Failed to delete account. Please try again.';
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please log in again before deleting your account.';
          break;
        case 'auth/user-mismatch':
          errorMessage = 'User mismatch. Please try again.';
          break;
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile: updateUserProfile,
    resendEmailVerification,
    checkEmailVerification,
    sendPasswordReset,
    deleteUserAccount,
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