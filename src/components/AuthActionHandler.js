import { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { applyActionCode, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

const AuthActionHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  useEffect(() => {
    const handleAuthAction = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');
      
      // Check if this is an email verification link (for handleCodeInApp)
      if (isSignInWithEmailLink(auth, window.location.href)) {
        navigate('/email-verification-success');
        return;
      }
      
      if (!mode || !oobCode) {
        return;
      }
      
      try {
        switch (mode) {
          case 'verifyEmail':
            // Apply the email verification code
            await applyActionCode(auth, oobCode);
            navigate('/email-verification-success');
            break;
            
          case 'resetPassword':
            // Redirect to new password page with the reset code
            navigate(`/new-password?mode=${mode}&oobCode=${oobCode}`);
            break;
            
          case 'recoverEmail':
            // Handle email recovery (if needed in the future)
            toast.info('Email recovery is not implemented yet.');
            navigate('/');
            break;
            
          default:
            toast.error('Unknown authentication action.');
            navigate('/');
            break;
        }
      } catch (error) {
        console.error('Error handling auth action:', error);
        
        let errorMessage = 'Authentication action failed.';
        switch (error.code) {
          case 'auth/invalid-action-code':
            errorMessage = 'Invalid or expired link.';
            break;
          case 'auth/expired-action-code':
            errorMessage = 'This link has expired.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found.';
            break;
        }
        
        toast.error(errorMessage);
        
        if (mode === 'verifyEmail') {
          navigate('/verification');
        } else if (mode === 'resetPassword') {
          navigate('/reset-password');
        } else {
          navigate('/');
        }
      }
    };
    
    handleAuthAction();
  }, [searchParams, navigate]);
  
  return null; // This component doesn't render anything
};

export default AuthActionHandler;