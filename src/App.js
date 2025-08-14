import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ContactProvider } from './contexts/ContactContext';
import { bookingSettingsService } from './services/bookingSettingsService';
import Header from './components/Header';
import WebsiteBanner from './components/WebsiteBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Booking from './pages/Booking';
import News from './pages/News';
import AdminLogin from './pages/AdminLogin';
import { useAuth } from './contexts/AuthContext';
import FirebaseActionRedirect from './pages/FirebaseActionRedirect';
import AdminDashboard from './components/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import VerifyBooking from './pages/VerifyBooking';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  // Initialize automatic maintenance scheduler
  useEffect(() => {
    // Start the maintenance scheduler that runs every minute
    bookingSettingsService.startMaintenanceScheduler(1);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ContactProvider>
          <Routes>
          {/* Admin access route - passkey-only */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/verify-booking" element={<VerifyBooking />} />
          <Route path="/__/auth/action" element={<FirebaseActionRedirect />} />
          <Route path="/firebase-action" element={<FirebaseActionRedirect />} />
          
          {/* Main website routes - with navbar/footer */}
          <Route path="/" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                <Home />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/destinations" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                <Destinations />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/destinations/:id" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                <DestinationDetail />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/news" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                <News />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/booking" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                <Booking />
              </main>
              <Footer />
            </div>
          } />

          <Route path="/admin" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                {/* Admin route is guarded inside AdminDashboardWrapper */}
                <AdminDashboardWrapper />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/about" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                <About />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/contact" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                <Contact />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/privacy-policy" element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <WebsiteBanner />
              <Navbar />
              <main>
                <PrivacyPolicy />
              </main>
              <Footer />
            </div>
          } />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        </ContactProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 

// Route guard wrapper for admin path that redirects to passkey login

function AdminDashboardWrapper() {
  const { isAdminAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin-login', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  if (!isAdminAuthenticated) return null;
  return <AdminDashboard />;
}