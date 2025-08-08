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
  fetchSignInMethodsForEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
  
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
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
  const [emailVerificationTimer, setEmailVerificationTimer] = useState(false);
  const [passwordResetTimer, setPasswordResetTimer] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
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

  const login = async (email, password, showToast = true) => {
    try {
      console.log('Login attempt with email:', email);
      
      if (!email) {
        const errorMsg = 'Please enter a valid email address.';
        if (showToast) toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      if (!password) {
        const errorMsg = 'Please enter your password.';
        if (showToast) toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      
      if (showToast) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Invalid account. No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please check your password and try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials. Please check your email and password.';
          break;
        default:
          errorMessage = 'Login failed. Please check your credentials and try again.';
          break;
      }
      
      console.log('Login error message:', errorMessage);
      if (showToast) {
        toast.error(errorMessage);
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData, showToast = true) => {
    try {
      // Validate password length on server side as well
      if (!userData.password || userData.password.length < 8) {
        const errorMsg = 'Password must be at least 8 characters long';
        if (showToast) toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
      
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

        // Start the 60-second timer for the initial verification email
        setEmailVerificationTimer(true);
        setTimeout(() => {
          setEmailVerificationTimer(false);
        }, 60000);

        if (showToast) {
          toast.success('Account created successfully! Please check your email to verify your account.');
        }
        return { success: true };
      } else {
        const errorMsg = 'Please enter a valid email address.';
        if (showToast) toast.error(errorMsg);
        return { success: false, error: errorMsg };
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
          errorMessage = 'Password is too weak. Please choose a stronger password with at least 8 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Registration failed. Please check your information and try again.';
          break;
      }
      
      if (showToast) {
        toast.error(errorMessage);
      }
      return { success: false, error: errorMessage };
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

  // Admin passkey-only authentication (no username/email)
  const adminLoginWithPasskey = (passkey) => {
    const VALID_PASSKEY = 'Casahacienda1897';
    if (passkey !== VALID_PASSKEY) {
      toast.error('Invalid passkey');
      return false;
    }
    // Optionally sign into Firebase using admin email so Firestore can be accessed
    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
    if (adminEmail) {
      signInWithEmailAndPassword(auth, adminEmail, passkey)
        .then(() => {
          setAdminAuthenticated(true);
          toast.success('Admin access granted');
        })
        .catch(() => {
          // If Firebase sign-in fails, still set local admin state so UI can route,
          // but Firestore operations requiring auth may be blocked by security rules.
          setAdminAuthenticated(true);
          toast.success('Admin access granted');
        });
    } else {
      setAdminAuthenticated(true);
      toast.success('Admin access granted');
    }
    return true;
  };

  const adminLogout = () => {
    setAdminAuthenticated(false);
    toast.success('Admin access removed');
    navigate('/');
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
      
      // Start the 60-second timer
      setEmailVerificationTimer(true);
      setTimeout(() => {
        setEmailVerificationTimer(false);
      }, 60000);
      
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
      console.log('Starting password reset for email:', email);
      
      // Check Firestore users collection directly (where your actual user data is stored)
      console.log('Checking Firestore users collection for email:', email);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      console.log('Firestore query completed. Found documents:', querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.log('Email not found in Firestore users database');
        return false; // Email not registered
      }
      
      // Check if the email is verified
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log('User data found:', {
        email: userData.email,
        emailVerified: userData.emailVerified,
        firstName: userData.firstName
      });
      
      if (!userData.emailVerified) {
        console.log('Email exists but not verified');
        return false; // Email not verified = not registered
      }
      
      console.log('Email exists and is verified in Firestore, checking Firebase Auth...');
      
      // Verify user also exists in Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      console.log('Firebase Auth check - Sign-in methods:', signInMethods);
      console.log('Sign-in methods type:', typeof signInMethods);
      console.log('Sign-in methods length:', signInMethods.length);
      
      if (signInMethods.length === 0) {
        console.log('fetchSignInMethodsForEmail returned empty array');
        console.log('This might be due to:');
        console.log('1. User email not verified in Firebase Auth');
        console.log('2. User account disabled');
        console.log('3. Firebase security settings');
        
        // Let's try sending the reset email anyway and see what happens
        console.log('Attempting to send reset email despite empty sign-in methods...');
      } else {
        console.log('User has sign-in methods, proceeding normally');
      }
      
      console.log('Proceeding to send password reset email...');
      
      // User exists in both systems, proceed with sending reset email
      const actionCodeSettings = {
        url: `${window.location.origin}/firebase-action`,
        handleCodeInApp: true
      };
      
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log('Password reset email sent successfully');
      toast.success('Password reset email sent! Please check your inbox.');
      
      // Start the 60-second timer
      setPasswordResetTimer(true);
      setTimeout(() => {
        setPasswordResetTimer(false);
      }, 60000);
      
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          console.log('User not found - returning false for UI handling');
          return false; // This will trigger "Email Not Registered" UI
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          console.log('Unknown error, treating as generic failure');
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
        default:
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
    adminLoginWithPasskey,
    adminLogout,
    updateProfile: updateUserProfile,
    resendEmailVerification,
    checkEmailVerification,
    sendPasswordReset,
    deleteUserAccount,
    emailVerificationTimer,
    passwordResetTimer,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator',
    isAdminAuthenticated: adminAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 