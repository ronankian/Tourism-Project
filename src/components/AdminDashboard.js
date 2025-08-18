import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, CheckCircle, XCircle, Eye, Mail, Settings, Power, PowerOff, AlertTriangle, BarChart3, TrendingUp, Phone, MapPin, Globe, Megaphone, LogOut, RefreshCw, Shield, Trash2, Plus, Search, ChevronDown } from 'lucide-react';
import { securityService } from '../services/securityService';
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
  const [rowActionLoading, setRowActionLoading] = useState({});
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'settings', 'advisory'
  const [settingsSection, setSettingsSection] = useState('booking'); // 'booking' | 'contact' | 'security'
  
  // New filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
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

  // Security Settings state
  const [restrictedList, setRestrictedList] = useState([]);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [restrictForm, setRestrictForm] = useState({ email: '', message: '', expiresAt: '' });
  const minExpiryValue = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    loadBookings();
    loadBookingSettings();
    loadAdvisories();
    loadRestricted();
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

  // Security handlers
  const loadRestricted = async () => {
    try {
      setSecurityLoading(true);
      // Auto-prune expired restrictions on load
      await securityService.pruneExpiredRestrictions();
      const items = await securityService.listRestrictedEmails();
      setRestrictedList(items);
    } catch (e) {
      console.error('Error loading restricted emails:', e);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleAddRestricted = async () => {
    try {
      const email = restrictForm.email.trim();
      if (!email) {
        toast.error('Enter an email to restrict');
        return;
      }
      let expiresAtMs = null;
      if (restrictForm.expiresAt) {
        const ms = Date.parse(restrictForm.expiresAt);
        if (Number.isNaN(ms)) {
          toast.error('Invalid expiry date and time');
          return;
        }
        if (ms <= Date.now()) {
          toast.error('Expiry must be in the future');
          return;
        }
        expiresAtMs = ms;
      }
      await securityService.addRestrictedEmail(email, restrictForm.message || '', expiresAtMs);
      toast.success('Email restricted successfully');
      setRestrictForm({ email: '', message: '', expiresAt: '' });
      loadRestricted();
    } catch (e) {
      console.error('Error adding restricted email:', e);
      toast.error('Failed to add restricted email');
    }
  };

  const handleRemoveRestricted = async (id) => {
    try {
      await securityService.removeRestrictedEmail(id);
      toast.success('Restriction removed');
      loadRestricted();
    } catch (e) {
      console.error('Error removing restricted email:', e);
      toast.error('Failed to remove restriction');
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      setRowActionLoading(prev => ({ ...prev, [bookingId]: true }));
      await bookingService.updateBookingStatus(bookingId, status, adminNotes);
      toast.success(`Booking ${status} successfully`);
      setShowModal(false);
      setSelectedBooking(null);
      setAdminNotes('');
      await loadBookings(); // Reload bookings
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    } finally {
      setRowActionLoading(prev => ({ ...prev, [bookingId]: false }));
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

  // Helpers
  const formatTimestamp = (ts) => {
    try {
      if (!ts) return '—';
      if (typeof ts?.toDate === 'function') {
        return ts.toDate().toLocaleString();
      }
      if (typeof ts === 'number') {
        return new Date(ts).toLocaleString();
      }
      const parsed = Date.parse(ts);
      if (!Number.isNaN(parsed)) return new Date(parsed).toLocaleString();
      return String(ts);
    } catch (_e) {
      return '—';
    }
  };

  // Enhanced filtering logic
  const visibleStatuses = new Set(['verified', 'approved', 'rejected', 'completed']);
  const filteredBase = bookings.filter(b => visibleStatuses.has(String(b.status || '').toLowerCase()));
  
  // Apply search filter
  const searchFiltered = searchTerm.trim() === '' ? filteredBase : filteredBase.filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.name?.toLowerCase().includes(searchLower) ||
      booking.email?.toLowerCase().includes(searchLower) ||
      booking.phone?.toLowerCase().includes(searchLower) ||
      booking.bookingCode?.toLowerCase().includes(searchLower) ||
      booking.id?.toLowerCase().includes(searchLower) ||
      booking.packageName?.toLowerCase().includes(searchLower) ||
      booking.specialRequests?.toLowerCase().includes(searchLower)
    );
  });
  
  // Apply date filter
  const dateFiltered = dateFilter === '' ? searchFiltered : searchFiltered.filter(booking => {
    const bookingDate = new Date(booking.date);
    const filterDate = new Date(dateFilter);
    return bookingDate.toDateString() === filterDate.toDateString();
  });
  
  // Apply status filter
  const statusFiltered = statusFilter === 'all' 
    ? dateFiltered
    : dateFiltered.filter(booking => booking.status === statusFilter);
  
  // Pagination
  const totalRecords = statusFiltered.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedBookings = statusFiltered.slice(startIndex, endIndex);
  
  // Update current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, statusFilter, recordsPerPage]);
  
  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown')) {
        setShowStatusDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

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
      value: statusFiltered.length, 
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      label: 'Verified', 
      value: statusFiltered.filter(b => b.status === 'verified').length, 
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600'
    },
    { 
      label: 'Approved', 
      value: statusFiltered.filter(b => b.status === 'approved').length, 
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    },
    { 
      label: 'Completed', 
      value: statusFiltered.filter(b => b.status === 'completed').length, 
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
                onClick={() => setActiveTab('settings')}
                className={`py-3 md:py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === 'settings'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Settings className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Settings</span>
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
            {/* Enhanced Filters */}
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm mb-6">
              <div className="space-y-4">
                {/* Mobile Layout: 2 columns per row */}
                <div className="grid grid-cols-2 gap-4 lg:hidden">
                  {/* First Row: Search Bar and Date Filter */}
                  <div className="col-span-2 sm:col-span-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search bookings by name, email, phone, booking ID, or tour option..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                    />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                    />
                    {dateFilter && (
                      <button
                        onClick={() => setDateFilter('')}
                        className="text-gray-500 hover:text-gray-700"
                        title="Clear date filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* Second Row: Status Dropdown and Refresh Button */}
                  <div className="col-span-1 relative status-dropdown">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    >
                      <span className="truncate">
                        {statusFilter === 'all' && 'All Bookings'}
                        {statusFilter === 'verified' && 'Verified'}
                        {statusFilter === 'approved' && 'Approved'}
                        {statusFilter === 'completed' && 'Completed'}
                        {statusFilter === 'rejected' && 'Rejected'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showStatusDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          {[
                            { value: 'all', label: 'All Bookings' },
                            { value: 'verified', label: 'Verified' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'rejected', label: 'Rejected' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setStatusFilter(option.value);
                                setShowStatusDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                statusFilter === option.value ? 'bg-[#5d9c59] text-white' : 'text-gray-700'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={loadBookings}
                      disabled={loading}
                      className="flex items-center justify-center w-full px-3 py-2 rounded-lg font-medium transition-colors text-sm bg-[#5d9c59] text-white hover:bg-[#4a7c47] disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {/* Desktop Layout: Original layout */}
                <div className="hidden lg:flex flex-col lg:flex-row gap-4">
                  {/* Left side: Search, Date, and Status filters */}
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search Bar */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search bookings by name, email, phone, booking ID, or tour option..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                      />
                    </div>
                    
                    {/* Date Filter */}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                      />
                      {dateFilter && (
                        <button
                          onClick={() => setDateFilter('')}
                          className="text-gray-500 hover:text-gray-700"
                          title="Clear date filter"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {/* Status Dropdown */}
                    <div className="relative status-dropdown">
                      <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                      >
                        <span>
                          {statusFilter === 'all' && 'All Bookings'}
                          {statusFilter === 'verified' && 'Verified'}
                          {statusFilter === 'approved' && 'Approved'}
                          {statusFilter === 'completed' && 'Completed'}
                          {statusFilter === 'rejected' && 'Rejected'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showStatusDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                          <div className="py-1">
                            {[
                              { value: 'all', label: 'All Bookings' },
                              { value: 'verified', label: 'Verified' },
                              { value: 'approved', label: 'Approved' },
                              { value: 'completed', label: 'Completed' },
                              { value: 'rejected', label: 'Rejected' }
                            ].map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setStatusFilter(option.value);
                                  setShowStatusDropdown(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                  statusFilter === option.value ? 'bg-[#5d9c59] text-white' : 'text-gray-700'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Clear All Filters */}
                    {(searchTerm || dateFilter || statusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setDateFilter('');
                          setStatusFilter('all');
                        }}
                        className="px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  
                  {/* Right side: Refresh Button */}
                  <button
                    onClick={loadBookings}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base bg-[#5d9c59] text-white hover:bg-[#4a7c47] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                
                {/* Active Filters Display */}
                {(searchTerm || dateFilter || statusFilter !== 'all') && (
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="text-gray-600">Active filters:</span>
                    {searchTerm && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Search: "{searchTerm}"
                      </span>
                    )}
                    {dateFilter && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                        Date: {new Date(dateFilter).toLocaleDateString()}
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                      </span>
                    )}
                  </div>
                )}
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
              ) : statusFiltered.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600">No bookings found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visitor
                        </th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tour Option
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
                      {paginatedBookings.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 font-mono">
                            {booking.bookingCode || booking.id}
                          </td>
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
                                    disabled={!!rowActionLoading[booking.id]}
                                    className={`text-green-600 hover:text-green-800 ${rowActionLoading[booking.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowModal(true);
                                    }}
                                    disabled={!!rowActionLoading[booking.id]}
                                    className={`text-red-600 hover:text-red-800 ${rowActionLoading[booking.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                      <div className="flex items-center justify-between">
                        {/* Records per page and info */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700">Show</span>
                            <select
                              value={recordsPerPage}
                              onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent"
                            >
                              <option value={10}>10</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-700">records per page.</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} of {totalRecords} records.
                          </div>
                        </div>
                        
                        {/* Pagination buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${
                                  currentPage === pageNum 
                                    ? 'bg-[#5d9c59] text-white border-[#5d9c59]' 
                                    : 'text-gray-700'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Settings Panel (sections) */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Section buttons */}
            <div className="bg-white rounded-lg p-2 shadow-sm flex space-x-2">
              <button
                onClick={()=>setSettingsSection('booking')}
                title="Booking Settings"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${settingsSection==='booking'?'bg-[#5d9c59] text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Users className="w-4 h-4 md:hidden" />
                <span className="hidden md:inline">Booking Settings</span>
              </button>
              <button
                onClick={()=>setSettingsSection('contact')}
                title="Contact Settings"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${settingsSection==='contact'?'bg-[#5d9c59] text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Phone className="w-4 h-4 md:hidden" />
                <span className="hidden md:inline">Contact Settings</span>
              </button>
              <button
                onClick={()=>setSettingsSection('security')}
                title="Security Settings"
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 ${settingsSection==='security'?'bg-[#5d9c59] text-white':'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Shield className="w-4 h-4 md:hidden" />
                <span className="hidden md:inline">Security Settings</span>
              </button>
            </div>

            {settingsSection === 'booking' && (settingsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5d9c59] mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading settings...</p>
              </div>
            ) : bookingSettings ? (
              <>
                {/* Booking Settings */}
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
            ))}

            {settingsSection === 'contact' && (
          <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-[#5d9c59]" />
                    Contact Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                        <input type="text" value={contactInfo.businessName} onChange={(e)=>handleContactInfoChange('businessName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" placeholder="Casa Hacienda" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input type="email" value={contactInfo.email} onChange={(e)=>handleContactInfoChange('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" placeholder="tourismoffice886@gmail.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input type="tel" value={contactInfo.phone} onChange={(e)=>handleContactInfoChange('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" placeholder="(046) 886-9707" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input type="text" value={contactInfo.address} onChange={(e)=>handleContactInfoChange('address', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" placeholder="Casa Hacienda de Tejeros, Rosario, Cavite" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-600" />Office Hours</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Weekdays</label>
                          <input type="text" value={contactInfo.officeHours?.weekdays || ''} onChange={(e)=>handleContactInfoChange('officeHours.weekdays', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" placeholder="Monday - Friday: 8:00 AM - 5:00 PM" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Weekends</label>
                            <input type="text" value={contactInfo.officeHours?.weekends || ''} onChange={(e)=>handleContactInfoChange('officeHours.weekends', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" placeholder="Saturday - Sunday: By appointment only" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Holidays</label>
                            <input type="text" value={contactInfo.officeHours?.holidays || ''} onChange={(e)=>handleContactInfoChange('officeHours.holidays', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" placeholder="Holidays: By appointment only" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button onClick={handleUpdateContactInfo} className="px-6 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium">Save Contact Information</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsSection === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center"><Shield className="w-5 h-5 mr-2 text-[#5d9c59]" />Security Settings</h3>
                  <div className="space-y-4 mb-8">
                    <h4 className="text-sm font-semibold text-gray-900">Change Admin Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="password" placeholder="Current Password" value={passwordForm.oldPassword} onChange={(e)=>setPasswordForm(p=>({...p,oldPassword:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                      <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e)=>setPasswordForm(p=>({...p,newPassword:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                      <input type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(e)=>setPasswordForm(p=>({...p,confirmPassword:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                    </div>
                    <button onClick={handlePasswordChange} disabled={passwordLoading || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmPassword} className="px-6 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{passwordLoading ? 'Changing Password...' : 'Change Password'}</button>
                        </div>
                        
                        <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Restricted Emails</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input type="email" placeholder="Email to restrict" value={restrictForm.email} onChange={(e)=>setRestrictForm({...restrictForm,email:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                      <input type="datetime-local" placeholder="Expiry (optional)" value={restrictForm.expiresAt} min={minExpiryValue} onChange={(e)=>setRestrictForm({...restrictForm,expiresAt:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                      <input type="text" placeholder="Message (optional)" value={restrictForm.message} onChange={(e)=>setRestrictForm({...restrictForm,message:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                        </div>
                    <button onClick={handleAddRestricted} className="inline-flex items-center px-4 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium"><Plus className="w-4 h-4 mr-2"/>Add Restriction</button>
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">Active Restrictions</div>
                      <div className="divide-y">
                        {securityLoading ? (
                          <div className="p-3 text-sm text-gray-600">Loading...</div>
                        ) : restrictedList.length === 0 ? (
                          <div className="p-3 text-sm text-gray-600">No restricted emails.</div>
                        ) : (
                          restrictedList.map(item => (
                            <div key={item.id} className="p-3 flex items-center justify-between text-sm">
                        <div>
                                <div className="font-medium text-gray-900">{item.email}</div>
                                <div className="text-gray-600">{item.message || '—'} {item.expiresAtMs ? `• Expires: ${new Date(item.expiresAtMs).toLocaleString()}` : '• Permanent'}</div>
                        </div>
                              <button onClick={()=>handleRemoveRestricted(item.id)} className="text-red-600 hover:text-red-800" title="Remove"><Trash2 className="w-4 h-4"/></button>
                      </div>
                          ))
                        )}
                    </div>
                    </div>
                      </div>
                    </div>
                  </div>
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

        {/* Security Settings Section within Settings handled above */}
        {false && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-[#5d9c59]" />
                Security Settings
              </h3>
              {/* Change Password */}
              <div className="space-y-4 mb-8">
                <h4 className="text-sm font-semibold text-gray-900">Change Admin Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="password" placeholder="Current Password" value={passwordForm.oldPassword} onChange={(e)=>setPasswordForm(p=>({...p,oldPassword:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                  <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e)=>setPasswordForm(p=>({...p,newPassword:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                  <input type="password" placeholder="Confirm New Password" value={passwordForm.confirmPassword} onChange={(e)=>setPasswordForm(p=>({...p,confirmPassword:e.target.value}))} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                </div>
                <button onClick={handlePasswordChange} disabled={passwordLoading || !passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmPassword} className="px-6 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">{passwordLoading ? 'Changing Password...' : 'Change Password'}</button>
              </div>

              {/* Restricted Emails */}
                <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Restricted Emails</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input type="email" placeholder="Email to restrict" value={restrictForm.email} onChange={(e)=>setRestrictForm({...restrictForm,email:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                  <input type="datetime-local" placeholder="Expiry (optional)" value={restrictForm.expiresAt} min={minExpiryValue} onChange={(e)=>setRestrictForm({...restrictForm,expiresAt:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                  <input type="text" placeholder="Message (optional)" value={restrictForm.message} onChange={(e)=>setRestrictForm({...restrictForm,message:e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent" />
                </div>
                <button onClick={handleAddRestricted} className="inline-flex items-center px-4 py-2 bg-[#5d9c59] text-white rounded-lg hover:bg-[#4a7c47] transition-colors font-medium"><Plus className="w-4 h-4 mr-2"/>Add Restriction</button>

                <div className="mt-4 border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">Active Restrictions</div>
                  <div className="divide-y">
                    {securityLoading ? (
                      <div className="p-3 text-sm text-gray-600">Loading...</div>
                    ) : restrictedList.length === 0 ? (
                      <div className="p-3 text-sm text-gray-600">No restricted emails.</div>
                    ) : (
                      restrictedList.map(item => (
                        <div key={item.id} className="p-3 flex items-center justify-between text-sm">
                <div>
                            <div className="font-medium text-gray-900">{item.email}</div>
                            <div className="text-gray-600">
                              {item.message || '—'} {item.expiresAtMs ? `• Expires: ${new Date(item.expiresAtMs).toLocaleString()}` : '• Permanent'}
                            </div>
                          </div>
                          <button onClick={()=>handleRemoveRestricted(item.id)} className="text-red-600 hover:text-red-800" title="Remove"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      ))
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for booking details and actions */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 flex flex-col">
            <h3 className="text-base font-semibold mb-2">Booking Details</h3>

            {/* Compact content */}
              <div>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Booking ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedBooking.bookingCode || selectedBooking.id}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Visitor Name</label>
                <p className="text-sm text-gray-900">{selectedBooking.name}</p>
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-600">Email</label>
                <p className="text-sm text-gray-900">{selectedBooking.email}</p>
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-600">Preferred Schedule</label>
                  <p className="text-sm text-gray-900">{selectedBooking.date}{selectedBooking.time ? ` • ${selectedBooking.time}` : ''}</p>
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-600">Tour Option</label>
                  <p className="text-sm text-gray-900">{selectedBooking.packageName}</p>
              </div>
              <div>
                  <label className="block text-xs font-medium text-gray-600">Special Requests</label>
                <p className="text-sm text-gray-900">{selectedBooking.specialRequests || 'None'}</p>
              </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Created/Verified At</label>
                  <p className="text-sm text-gray-900">{formatTimestamp(selectedBooking.verifiedAt || selectedBooking.createdAt)}</p>
            </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Last Updated</label>
                  <p className="text-sm text-gray-900">{formatTimestamp(selectedBooking.updatedAt)}</p>
                </div>
            {selectedBooking.status === 'verified' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Admin Notes (for rejection)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5d9c59] focus:border-transparent text-sm"
                      rows="2"
                  placeholder="Reason for rejection (optional)"
                />
              </div>
            )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                Close
              </button>
              {selectedBooking.status === 'verified' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'approved')}
                    disabled={!!rowActionLoading[selectedBooking.id]}
                    className={`flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm ${rowActionLoading[selectedBooking.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected')}
                    disabled={!!rowActionLoading[selectedBooking.id]}
                    className={`flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm ${rowActionLoading[selectedBooking.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
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
