import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, CheckCircle, XCircle, Eye, Mail, Settings, Power, PowerOff, AlertTriangle, BarChart3, TrendingUp, Phone, MapPin, Globe, Megaphone, LogOut, RefreshCw } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { bookingSettingsService } from '../services/bookingSettingsService';
import { advisoryService } from '../services/advisoryService';
import { passwordService } from '../services/passwordService';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useContact } from '../contexts/ContactContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'settings', 'contact', 'advisory', or 'password'
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Advisory state
  const [advisories, setAdvisories] = useState([]);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);
  const [editingAdvisory, setEditingAdvisory] = useState(null);
  const [advisoryForm, setAdvisoryForm] = useState({
    message: '',
    isActive: true
  });
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [advisoryToDelete, setAdvisoryToDelete] = useState(null);
  
  // Booking settings state
  const [bookingSettings, setBookingSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [maintenanceStartTime, setMaintenanceStartTime] = useState('');
  const [maintenanceEndTime, setMaintenanceEndTime] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  
  // Daily booking limits state
  const [bookingStatistics, setBookingStatistics] = useState(null);
  const [smallGroupLimit, setSmallGroupLimit] = useState(10);
  const [organizationLimit, setOrganizationLimit] = useState(5);
  
  // Contact information state
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
  
  const { adminLogout } = useAuth();
  const { refreshContactInfo } = useContact();
  const navigate = useNavigate();

  useEffect(() => {
    loadBookings();
    loadBookingSettings();
    loadAdvisories();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const allBookings = await bookingService.getAllBookings();
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadBookingSettings = async () => {
    try {
      setSettingsLoading(true);
      const settings = await bookingSettingsService.getBookingSettings();
      setBookingSettings(settings);
      
      // Initialize maintenance time fields if settings exist
      if (settings.maintenanceMode) {
        setMaintenanceMessage(settings.maintenanceMode.message || '');
        if (settings.maintenanceMode.startTime) {
          setMaintenanceStartTime(new Date(settings.maintenanceMode.startTime).toISOString().slice(0, 16));
        }
        if (settings.maintenanceMode.endTime) {
          setMaintenanceEndTime(new Date(settings.maintenanceMode.endTime).toISOString().slice(0, 16));
        }
      }

      // Initialize daily booking limits
      if (settings.dailyBookingLimits) {
        setSmallGroupLimit(settings.dailyBookingLimits.smallGroupTour?.limit || 10);
        setOrganizationLimit(settings.dailyBookingLimits.organizationTour?.limit || 5);
      }

      // Load booking statistics
      const stats = await bookingSettingsService.getBookingStatistics();
      setBookingStatistics(stats);

      // Initialize contact information
      if (settings.contactInformation) {
        setContactInfo(settings.contactInformation);
      }
    } catch (error) {
      console.error('Error loading booking settings:', error);
      toast.error('Failed to load booking settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadAdvisories = async () => {
    try {
      setAdvisoryLoading(true);
      const advisories = await advisoryService.getAdvisories();
      setAdvisories(advisories);
    } catch (error) {
      console.error('Error loading advisories:', error);
      toast.error('Failed to load advisories');
    } finally {
      setAdvisoryLoading(false);
    }
  };

  const handleAddAdvisory = async () => {
    try {
      if (!advisoryForm.message.trim()) {
        toast.error('Please enter an advisory message');
        return;
      }

      if (editingAdvisory) {
        await advisoryService.updateAdvisory(editingAdvisory.id, advisoryForm);
        toast.success('Advisory updated successfully');
      } else {
        await advisoryService.addAdvisory(advisoryForm);
        toast.success('Advisory added successfully');
      }

      setShowAdvisoryModal(false);
      setEditingAdvisory(null);
      setAdvisoryForm({ message: '', isActive: true });
      loadAdvisories();
    } catch (error) {
      console.error('Error saving advisory:', error);
      toast.error('Failed to save advisory');
    }
  };

  const handleToggleAdvisoryStatus = async (id) => {
    try {
      const advisory = advisories.find(a => a.id === id);
      const newStatus = !advisory.isActive;
      await advisoryService.toggleAdvisoryStatus(id, newStatus);
      toast.success(`Advisory ${newStatus ? 'activated' : 'deactivated'} successfully`);
      loadAdvisories();
    } catch (error) {
      console.error('Error toggling advisory status:', error);
      toast.error('Failed to update advisory status');
    }
  };

  const handleDeleteAdvisory = async (id) => {
    setAdvisoryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteAdvisory = async () => {
    if (!advisoryToDelete) return;
    try {
      await advisoryService.deleteAdvisory(advisoryToDelete);
      toast.success('Advisory deleted successfully');
      setShowDeleteModal(false);
      setAdvisoryToDelete(null);
      loadAdvisories();
    } catch (error) {
      console.error('Error deleting advisory:', error);
      toast.error('Failed to delete advisory');
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status, adminNotes);
      toast.success(`Booking ${status} successfully`);
      setShowModal(false);
      setSelectedBooking(null);
      setAdminNotes('');
      loadBookings(); // Reload bookings
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  // Booking settings handlers
  const handleToggleTourPackage = async (packageType, enabled) => {
    try {
      const updatedSettings = await bookingSettingsService.toggleTourPackage(packageType, enabled);
      setBookingSettings(updatedSettings);
      toast.success(`${packageType === 'smallGroup' ? 'Small Group Tour' : 'Organization Tour'} ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling tour package:', error);
      toast.error(error.message || 'Failed to update tour package settings');
    }
  };

  const handleToggleOptionalField = async (fieldType, enabled) => {
    try {
      const updatedSettings = await bookingSettingsService.toggleOptionalField(fieldType, enabled);
      setBookingSettings(updatedSettings);
      const fieldName = fieldType === 'specialRequests' ? 'Special Requests' : 'File Attachments';
      toast.success(`${fieldName} field ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling optional field:', error);
      toast.error(error.message || 'Failed to update optional field settings');
    }
  };

  const handleMaintenanceModeToggle = async () => {
    try {
      const newMaintenanceState = !bookingSettings.maintenanceMode.enabled;
      
      if (newMaintenanceState && (!maintenanceStartTime || !maintenanceEndTime)) {
        toast.error('Please set start and end times for maintenance mode');
        return;
      }

      const updatedSettings = await bookingSettingsService.setMaintenanceMode(
        newMaintenanceState,
        newMaintenanceState ? maintenanceStartTime : null,
        newMaintenanceState ? maintenanceEndTime : null,
        maintenanceMessage || 'The booking system is temporarily under maintenance. Please try again later.'
      );

      setBookingSettings({
        ...bookingSettings,
        maintenanceMode: updatedSettings
      });

      toast.success(`Maintenance mode ${newMaintenanceState ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error(error.message || 'Failed to update maintenance mode');
    }
  };

  // Daily booking limits handlers
  const handleToggleDailyLimit = async (tourType, enabled) => {
    try {
      const limit = tourType === 'smallGroupTour' ? smallGroupLimit : organizationLimit;
      const updatedSettings = await bookingSettingsService.updateDailyBookingLimits(tourType, enabled, limit);
      setBookingSettings(updatedSettings);
      
      // Refresh statistics
      const stats = await bookingSettingsService.getBookingStatistics();
      setBookingStatistics(stats);
      
      const tourName = tourType === 'smallGroupTour' ? 'Small Group Tour' : 'Organization Tour';
      toast.success(`Daily booking limit for ${tourName} ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error toggling daily booking limit:', error);
      toast.error(error.message || 'Failed to update daily booking limit');
    }
  };

  const handleUpdateDailyLimit = async (tourType, newLimit) => {
    try {
      const enabled = tourType === 'smallGroupTour' 
        ? bookingSettings?.dailyBookingLimits?.smallGroupTour?.enabled 
        : bookingSettings?.dailyBookingLimits?.organizationTour?.enabled;
      
      if (enabled) {
        const updatedSettings = await bookingSettingsService.updateDailyBookingLimits(tourType, enabled, newLimit);
        setBookingSettings(updatedSettings);
        
        // Refresh statistics
        const stats = await bookingSettingsService.getBookingStatistics();
        setBookingStatistics(stats);
        
        const tourName = tourType === 'smallGroupTour' ? 'Small Group Tour' : 'Organization Tour';
        toast.success(`Daily booking limit for ${tourName} updated to ${newLimit}`);
      }
      
      // Update local state regardless
      if (tourType === 'smallGroupTour') {
        setSmallGroupLimit(newLimit);
      } else {
        setOrganizationLimit(newLimit);
      }
    } catch (error) {
      console.error('Error updating daily booking limit:', error);
      toast.error(error.message || 'Failed to update daily booking limit');
    }
  };

  // Password change handler
  const handlePasswordChange = async () => {
    try {
      setPasswordLoading(true);
      
      // Validation
      if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters long');
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('New password and confirm password do not match');
        return;
      }

      // Use the password service to change the password
      await passwordService.changeAdminPassword(passwordForm.oldPassword, passwordForm.newPassword);
      
      toast.success('Password changed successfully! You can now use the new password to log in.');
      
      // Reset form
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Contact information handlers
  const handleUpdateContactInfo = async () => {
    try {
      const updatedSettings = await bookingSettingsService.updateContactInformation(contactInfo);
      setBookingSettings(updatedSettings);
      
      // Refresh contact info across the website
      await refreshContactInfo();
      
      toast.success('Contact information updated successfully');
    } catch (error) {
      console.error('Error updating contact information:', error);
      toast.error(error.message || 'Failed to update contact information');
    }
  };

  const handleContactInfoChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested fields like officeHours.weekdays
      const [parent, child] = field.split('.');
      setContactInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setContactInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === selectedStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const stats = [
    { 
      label: 'Total Bookings', 
      value: bookings.length, 
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      label: 'Pending', 
      value: bookings.filter(b => b.status === 'pending').length, 
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600'
    },
    { 
      label: 'Approved', 
      value: bookings.filter(b => b.status === 'approved').length, 
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    },
    { 
      label: 'Completed', 
      value: bookings.filter(b => b.status === 'completed').length, 
      icon: Users,
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#5d9c59] to-[#4a7c47] text-white py-8 md:py-12">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-white/80 text-sm md:text-base">Manage bookings and configure settings</p>
            </div>
                          <button
              onClick={() => {
                adminLogout();
              }}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline text-sm md:text-base font-medium">Logout</span>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-white/20">
            <nav className="flex flex-wrap space-x-2 md:space-x-8">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === 'bookings'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Bookings</span>
                  <span className="sm:hidden">Book</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === 'settings'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Settings className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Booking Settings</span>
                  <span className="sm:hidden">Settings</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === 'contact'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Contact Settings</span>
                  <span className="sm:hidden">Contact</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('advisory')}
                className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === 'advisory'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Megaphone className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Advisory Messages</span>
                  <span className="sm:hidden">Advisory</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === 'password'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Power className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Change Password</span>
                  <span className="sm:hidden">Password</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </section>

      <div className="container-custom py-6 md:py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'bookings' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm mb-6">
              <div className="flex flex-wrap gap-2 md:gap-4 justify-between items-center">
                <div className="flex flex-wrap gap-2 md:gap-4">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      selectedStatus === 'all' 
                        ? 'bg-[#5d9c59] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Bookings
                  </button>
                  <button
                    onClick={() => setSelectedStatus('pending')}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      selectedStatus === 'pending' 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setSelectedStatus('verified')}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      selectedStatus === 'verified' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Verified
                  </button>
                  <button
                    onClick={() => setSelectedStatus('approved')}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base ${
                      selectedStatus === 'approved' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Approved
                  </button>
                </div>
                
                {/* Refresh Button */}
                <button
                  onClick={loadBookings}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base bg-[#5d9c59] text-white hover:bg-[#4a7c47] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'bookings' && (
          <>
            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow-sm">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5d9c59] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No bookings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Package
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                              <div className="text-xs md:text-sm text-gray-500">{booking.email}</div>
                              <div className="text-xs md:text-sm text-gray-500">{booking.phone}</div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.packageName}</div>
                              <div className="text-xs md:text-sm text-gray-500">{booking.guests} guests</div>
                              <div className="text-xs md:text-sm text-gray-500">{booking.packagePrice}</div>
                            </div>
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                            {booking.date}
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1">{booking.status}</span>
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1 md:space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowModal(true);
                                }}
                                className="text-[#5d9c59] hover:text-[#4a7c47]"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {booking.status === 'verified' && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(booking.id, 'approved')}
                                    className="text-green-600 hover:text-green-800"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowModal(true);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {booking.status === 'approved' && (
                                <button
                                  onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Mark as Completed"
                                >
                                  <Mail className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Settings Panel */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {settingsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5d9c59] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading settings...</p>
              </div>
            ) : bookingSettings ? (
              <>
                {/* Tour Package Controls */}
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-[#5d9c59]" />
                    Tour Package Availability
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                      <div>
                        <h4 className="font-medium text-gray-900">Small Group Tour</h4>
                        <p className="text-sm text-gray-600">For individuals, couples, families, or small gatherings (max 20 guests)</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${bookingSettings.smallGroupTourEnabled ? 'text-green-600' : 'text-red-600'}`}>
                          {bookingSettings.smallGroupTourEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => handleToggleTourPackage('smallGroup', !bookingSettings.smallGroupTourEnabled)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5d9c59] focus:ring-offset-2 ${
                            bookingSettings.smallGroupTourEnabled ? 'bg-[#5d9c59]' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              bookingSettings.smallGroupTourEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                      <div>
                        <h4 className="font-medium text-gray-900">Organization & Institutional Tour</h4>
                        <p className="text-sm text-gray-600">For schools, offices, and cultural organizations (no guest limit)</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${bookingSettings.organizationTourEnabled ? 'text-green-600' : 'text-red-600'}`}>
                          {bookingSettings.organizationTourEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => handleToggleTourPackage('organization', !bookingSettings.organizationTourEnabled)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5d9c59] focus:ring-offset-2 ${
                            bookingSettings.organizationTourEnabled ? 'bg-[#5d9c59]' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              bookingSettings.organizationTourEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {(!bookingSettings.smallGroupTourEnabled || !bookingSettings.organizationTourEnabled) && (
                      <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Important Notice</p>
                          <p className="text-sm text-amber-700">
                            At least one tour package must remain enabled. You cannot disable both packages simultaneously.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Form Fields Controls */}
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-[#5d9c59]" />
                    Optional Form Fields
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                      <div>
                        <h4 className="font-medium text-gray-900">Special Requests Field</h4>
                        <p className="text-sm text-gray-600">Allow customers to add special requirements or requests</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${bookingSettings.specialRequestsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                          {bookingSettings.specialRequestsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => handleToggleOptionalField('specialRequests', !bookingSettings.specialRequestsEnabled)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5d9c59] focus:ring-offset-2 ${
                            bookingSettings.specialRequestsEnabled ? 'bg-[#5d9c59]' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              bookingSettings.specialRequestsEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                      <div>
                        <h4 className="font-medium text-gray-900">File Attachments</h4>
                        <p className="text-sm text-gray-600">Allow customers to upload documents and files</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${bookingSettings.attachmentsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                          {bookingSettings.attachmentsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => handleToggleOptionalField('attachments', !bookingSettings.attachmentsEnabled)}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5d9c59] focus:ring-offset-2 ${
                            bookingSettings.attachmentsEnabled ? 'bg-[#5d9c59]' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              bookingSettings.attachmentsEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Booking Limits Controls */}
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-[#5d9c59]" />
                    Daily Booking Limits
                  </h3>
                  
                  {/* Today's Statistics */}
                  {bookingStatistics && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
                        Today's Booking Statistics ({new Date().toLocaleDateString()})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-600">Small Group Tour</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {bookingStatistics.smallGroupTour.currentCount}
                            {bookingStatistics.smallGroupTour.limitEnabled && (
                              <span className="text-sm text-gray-500">
                                /{bookingStatistics.smallGroupTour.limit}
                              </span>
                            )}
                          </div>
                          {bookingStatistics.smallGroupTour.limitEnabled && (
                            <div className="text-sm text-gray-600">
                              {bookingStatistics.smallGroupTour.remaining} slots remaining
                            </div>
                          )}
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="text-sm text-gray-600">Organization Tour</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {bookingStatistics.organizationTour.currentCount}
                            {bookingStatistics.organizationTour.limitEnabled && (
                              <span className="text-sm text-gray-500">
                                /{bookingStatistics.organizationTour.limit}
                              </span>
                            )}
                          </div>
                          {bookingStatistics.organizationTour.limitEnabled && (
                            <div className="text-sm text-gray-600">
                              {bookingStatistics.organizationTour.remaining} slots remaining
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Small Group Tour Limit */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                        <div>
                          <h4 className="font-medium text-gray-900">Small Group Tour Daily Limit</h4>
                          <p className="text-sm text-gray-600">Limit the number of small group bookings per day</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm font-medium ${
                            bookingSettings?.dailyBookingLimits?.smallGroupTour?.enabled ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {bookingSettings?.dailyBookingLimits?.smallGroupTour?.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <button
                            onClick={() => handleToggleDailyLimit('smallGroupTour', !bookingSettings?.dailyBookingLimits?.smallGroupTour?.enabled)}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5d9c59] focus:ring-offset-2 ${
                              bookingSettings?.dailyBookingLimits?.smallGroupTour?.enabled ? 'bg-[#5d9c59]' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                bookingSettings?.dailyBookingLimits?.smallGroupTour?.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">
                          Maximum bookings per day:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={smallGroupLimit}
                          onChange={(e) => setSmallGroupLimit(Math.max(1, parseInt(e.target.value) || 1))}
                          onBlur={() => handleUpdateDailyLimit('smallGroupTour', smallGroupLimit)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Organization Tour Limit */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                        <div>
                          <h4 className="font-medium text-gray-900">Organization Tour Daily Limit</h4>
                          <p className="text-sm text-gray-600">Limit the number of organization bookings per day</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm font-medium ${
                            bookingSettings?.dailyBookingLimits?.organizationTour?.enabled ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {bookingSettings?.dailyBookingLimits?.organizationTour?.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <button
                            onClick={() => handleToggleDailyLimit('organizationTour', !bookingSettings?.dailyBookingLimits?.organizationTour?.enabled)}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5d9c59] focus:ring-offset-2 ${
                              bookingSettings?.dailyBookingLimits?.organizationTour?.enabled ? 'bg-[#5d9c59]' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                bookingSettings?.dailyBookingLimits?.organizationTour?.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-700">
                          Maximum bookings per day:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={organizationLimit}
                          onChange={(e) => setOrganizationLimit(Math.max(1, parseInt(e.target.value) || 1))}
                          onBlur={() => handleUpdateDailyLimit('organizationTour', organizationLimit)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Daily Booking Limits</p>
                        <p className="text-sm text-blue-700">
                          These limits count only verified, approved, and completed bookings. When a limit is reached, users will see a "fully booked" message for that tour type.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Maintenance Mode Controls */}
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Power className="w-5 h-5 mr-2 text-[#5d9c59]" />
                    Maintenance Mode
                  </h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg space-y-3 sm:space-y-0">
                      <div>
                        <h4 className="font-medium text-gray-900">Booking System Maintenance</h4>
                        <p className="text-sm text-gray-600">Temporarily disable the booking system for maintenance</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${bookingSettings.maintenanceMode?.enabled ? 'text-red-600' : 'text-green-600'}`}>
                          {bookingSettings.maintenanceMode?.enabled ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={handleMaintenanceModeToggle}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                            bookingSettings.maintenanceMode?.enabled ? 'bg-red-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              bookingSettings.maintenanceMode?.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Maintenance Schedule */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={maintenanceStartTime}
                          onChange={(e) => setMaintenanceStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={maintenanceEndTime}
                          onChange={(e) => setMaintenanceEndTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maintenance Message
                      </label>
                      <textarea
                        value={maintenanceMessage}
                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                        placeholder="Message to display during maintenance..."
                      />
                    </div>

                    {bookingSettings.maintenanceMode?.enabled && (
                      <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <PowerOff className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Maintenance Mode Active</p>
                          <p className="text-sm text-red-700">
                            The booking system is currently disabled. Visitors will see the maintenance message instead of the booking form.
                          </p>
                          {maintenanceStartTime && maintenanceEndTime && (
                            <p className="text-sm text-red-700 mt-1">
                              Scheduled: {new Date(maintenanceStartTime).toLocaleString()} - {new Date(maintenanceEndTime).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>


              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-600">Failed to load settings</p>
              </div>
            )}
          </div>
        )}

        {/* Contact Settings Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {settingsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5d9c59] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading contact settings...</p>
              </div>
            ) : (
              <>
                {/* Contact Settings */}
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-[#5d9c59]" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={contactInfo.businessName}
                          onChange={(e) => handleContactInfoChange('businessName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                          placeholder="Casa Hacienda"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={contactInfo.email}
                          onChange={(e) => handleContactInfoChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                          placeholder="tourismoffice886@gmail.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={contactInfo.phone}
                          onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                          placeholder="(046) 886-9707"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={contactInfo.address}
                          onChange={(e) => handleContactInfoChange('address', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                          placeholder="Casa Hacienda de Tejeros, Rosario, Cavite"
                        />
                      </div>
                    </div>

                    {/* Office Hours */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-600" />
                        Office Hours
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weekdays
                          </label>
                          <input
                            type="text"
                            value={contactInfo.officeHours?.weekdays || ''}
                            onChange={(e) => handleContactInfoChange('officeHours.weekdays', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                            placeholder="Monday - Friday: 8:00 AM - 5:00 PM"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Weekends
                            </label>
                            <input
                              type="text"
                              value={contactInfo.officeHours?.weekends || ''}
                              onChange={(e) => handleContactInfoChange('officeHours.weekends', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                              placeholder="Saturday - Sunday: By appointment only"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Holidays
                            </label>
                            <input
                              type="text"
                              value={contactInfo.officeHours?.holidays || ''}
                              onChange={(e) => handleContactInfoChange('officeHours.holidays', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                              placeholder="Holidays: By appointment only"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Media (Optional) */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Globe className="w-4 h-4 mr-2 text-gray-600" />
                        Social Media (Optional)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Facebook
                          </label>
                          <input
                            type="url"
                            value={contactInfo.socialMedia?.facebook || ''}
                            onChange={(e) => handleContactInfoChange('socialMedia.facebook', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instagram
                          </label>
                          <input
                            type="url"
                            value={contactInfo.socialMedia?.instagram || ''}
                            onChange={(e) => handleContactInfoChange('socialMedia.instagram', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                            placeholder="https://instagram.com/..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Twitter
                          </label>
                          <input
                            type="url"
                            value={contactInfo.socialMedia?.twitter || ''}
                            onChange={(e) => handleContactInfoChange('socialMedia.twitter', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        onClick={handleUpdateContactInfo}
                        className="px-6 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium"
                      >
                        Save Contact Information
                      </button>
                    </div>

                    <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Contact Information Updates</p>
                        <p className="text-sm text-blue-700">
                          Changes to contact information will be reflected across the website including the header, footer, and contact pages. Make sure all information is accurate before saving.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Advisory Messages Tab */}
        {activeTab === 'advisory' && (
          <div className="space-y-6">
            {advisoryLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5d9c59] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading advisory messages...</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Megaphone className="w-5 h-5 mr-2 text-[#5d9c59]" />
                    Advisory Messages
                  </h3>
                  <div className="space-y-4">
                    {advisories.length === 0 ? (
                      <p className="text-gray-600">No advisory messages found. Add a new one!</p>
                    ) : (
                      advisories.map((advisory, index) => (
                        <div key={advisory.id} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-900 font-medium">{advisory.message}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Status: {advisory.isActive ? 'Active' : 'Inactive'}
                            {advisory.isActive && advisory.endTime && (
                              <>
                                , Expires: {new Date(advisory.endTime).toLocaleDateString()}
                              </>
                            )}
                          </p>
                                                     <div className="flex items-center mt-2 text-gray-600 text-sm">
                             <Clock className="w-4 h-4 mr-1" />
                             Created: {advisory.createdAt ? new Date(advisory.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                           </div>
                          <div className="flex items-center mt-2 text-gray-600 text-sm">
                            <Settings className="w-4 h-4 mr-1" />
                            <button
                              onClick={() => {
                                setEditingAdvisory(advisory);
                                setAdvisoryForm({
                                  message: advisory.message,
                                  isActive: advisory.isActive
                                });
                                setShowAdvisoryModal(true);
                              }}
                              className="text-[#5d9c59] hover:text-[#4a7c47] text-sm"
                            >
                              Edit
                            </button>
                            <span className="mx-1">|</span>
                            <button
                              onClick={() => handleToggleAdvisoryStatus(advisory.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              {advisory.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <span className="mx-1">|</span>
                            <button
                              onClick={() => handleDeleteAdvisory(advisory.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                                 <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                     <Megaphone className="w-5 h-5 mr-2 text-[#5d9c59]" />
                     Add New Advisory Message
                   </h3>
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Advisory Message
                       </label>
                       <textarea
                         value={advisoryForm.message}
                         onChange={(e) => setAdvisoryForm(prev => ({ ...prev, message: e.target.value }))}
                         rows="4"
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                         placeholder="Enter your advisory message here..."
                       />
                     </div>
                     <div className="flex items-center">
                       <input
                         type="checkbox"
                         id="isActive"
                         checked={advisoryForm.isActive}
                         onChange={(e) => setAdvisoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
                         className="mr-2"
                       />
                       <label htmlFor="isActive" className="text-sm text-gray-700">
                         Make this message active
                       </label>
                     </div>
                     <button
                       onClick={() => setShowAdvisoryModal(true)}
                       className="px-6 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium"
                     >
                       Add Advisory
                     </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Password Change Tab */}
        {activeTab === 'password' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Power className="w-5 h-5 mr-2 text-[#5d9c59]" />
                Change Admin Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                    placeholder="Enter your current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                    placeholder="Enter your new password (minimum 8 characters)"
                  />
                  {passwordForm.newPassword && passwordForm.newPassword.length < 8 && (
                    <p className="text-sm text-red-600 mt-1">Password must be at least 8 characters long</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                    placeholder="Confirm your new password"
                  />
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmPassword}
                  className="px-6 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for booking details and actions */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <p className="text-sm text-gray-900">{selectedBooking.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedBooking.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Package</label>
                <p className="text-sm text-gray-900">{selectedBooking.packageName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="text-sm text-gray-900">{selectedBooking.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                <p className="text-sm text-gray-900">{selectedBooking.specialRequests || 'None'}</p>
              </div>
            </div>

            {selectedBooking.status === 'verified' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (for rejection)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                  rows="3"
                  placeholder="Reason for rejection (optional)"
                />
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              {selectedBooking.status === 'verified' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'approved')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected')}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for managing advisory messages */}
      {showAdvisoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAdvisory ? 'Edit Advisory Message' : 'Add New Advisory Message'}
            </h3>
            
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Advisory Message
                </label>
                <textarea
                  value={advisoryForm.message}
                  onChange={(e) => setAdvisoryForm(prev => ({ ...prev, message: e.target.value }))}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                  placeholder="Enter your advisory message here..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={advisoryForm.isActive}
                  onChange={(e) => setAdvisoryForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Make this message active
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Expiration Date (optional)
                </label>
                <input
                  type="datetime-local"
                  value={advisoryForm.endTime || ''}
                  onChange={(e) => setAdvisoryForm(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAdvisoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdvisory}
                className="flex-1 px-4 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium"
              >
                {editingAdvisory ? 'Update Advisory' : 'Add Advisory'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && advisoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete this advisory message? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAdvisory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
