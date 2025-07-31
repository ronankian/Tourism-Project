import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthActionHandler from './components/AuthActionHandler';
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Register from './pages/Register';
import Verification from './pages/Verification';
import EmailVerificationSuccess from './pages/EmailVerificationSuccess';
import PasswordReset from './pages/PasswordReset';
import NewPassword from './pages/NewPassword';
import PasswordResetSuccess from './pages/PasswordResetSuccess';
import FirebaseActionRedirect from './pages/FirebaseActionRedirect';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthActionHandler />
        <Routes>
          {/* Authentication routes - without navbar/footer */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/email-verification-success" element={<EmailVerificationSuccess />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
          <Route path="/__/auth/action" element={<FirebaseActionRedirect />} />
          <Route path="/firebase-action" element={<FirebaseActionRedirect />} />
          
          {/* Main website routes - with navbar/footer */}
          <Route path="/" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Home />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/destinations" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Destinations />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/destinations/:id" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <DestinationDetail />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/booking" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Booking />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/dashboard" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Dashboard />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/about" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <About />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/contact" element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main>
                <Contact />
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 