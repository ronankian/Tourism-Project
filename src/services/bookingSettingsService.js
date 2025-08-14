import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const SETTINGS_DOC_ID = 'booking_configuration';

class BookingSettingsService {
  // Get current booking settings
  async getBookingSettings() {
    try {
      const settingsDoc = await getDoc(doc(db, 'booking_settings', SETTINGS_DOC_ID));
      
      if (settingsDoc.exists()) {
        return settingsDoc.data();
      } else {
        // Return default settings if none exist
        const defaultSettings = {
          smallGroupTourEnabled: true,
          organizationTourEnabled: true,
          specialRequestsEnabled: true,
          attachmentsEnabled: true,
          dailyBookingLimits: {
            smallGroupTour: {
              enabled: false,
              limit: 10
            },
            organizationTour: {
              enabled: false,
              limit: 5
            }
          },
          contactInformation: {
            businessName: 'Casa Hacienda',
            email: 'tourismoffice886@gmail.com',
            phone: '(046) 886-9707',
            officeHours: {
              weekdays: 'Monday - Friday: 8:00 AM - 5:00 PM',
              weekends: 'Saturday - Sunday: By appointment only',
              holidays: 'Holidays: By appointment only'
            },
            address: 'Casa Hacienda de Tejeros, Rosario, Cavite',
            socialMedia: {
              facebook: '',
              instagram: '',
              twitter: ''
            }
          },
          maintenanceMode: {
            enabled: false,
            startTime: null,
            endTime: null,
            message: 'The booking system is temporarily under maintenance. Please try again later.'
          },
          lastUpdated: null,
          updatedBy: 'system'
        };
        
        // Create the default settings document
        await setDoc(doc(db, 'booking_settings', SETTINGS_DOC_ID), {
          ...defaultSettings,
          lastUpdated: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        
        return defaultSettings;
      }
    } catch (error) {
      console.error('Error fetching booking settings:', error);
      throw error;
    }
  }

  // Update booking settings
  async updateBookingSettings(settings, skipAdminCheck = false) {
    try {
      // Client-side admin check (can be bypassed by internal functions with skipAdminCheck)
      if (!skipAdminCheck) {
        // Check if running in browser environment and admin is authenticated
        if (typeof window !== 'undefined') {
          // For now, we'll rely on the fact that only admin dashboard can call this
          // In a production environment, you might want to implement additional checks
        }
      }

      const settingsRef = doc(db, 'booking_settings', SETTINGS_DOC_ID);
      
      // Validation: Ensure at least one tour package is enabled
      if (!settings.smallGroupTourEnabled && !settings.organizationTourEnabled) {
        throw new Error('At least one tour package must remain enabled. Cannot disable both Small Group Tour and Organization Tour.');
      }

      const updateData = {
        ...settings,
        lastUpdated: serverTimestamp()
      };

      await updateDoc(settingsRef, updateData);
      return updateData;
    } catch (error) {
      console.error('Error updating booking settings:', error);
      throw error;
    }
  }

  // Check if current time is within maintenance window
  checkMaintenanceMode(settings) {
    if (!settings || !settings.maintenanceMode || !settings.maintenanceMode.enabled) {
      return { inMaintenance: false };
    }

    const { startTime, endTime } = settings.maintenanceMode;
    
    if (!startTime || !endTime) {
      return { inMaintenance: false };
    }

    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Handle maintenance windows that cross midnight
    if (start <= end) {
      // Same day maintenance window
      const inMaintenance = now >= start && now <= end;
      return {
        inMaintenance,
        message: settings.maintenanceMode.message,
        startTime: start,
        endTime: end
      };
    } else {
      // Maintenance window crosses midnight
      const inMaintenance = now >= start || now <= end;
      return {
        inMaintenance,
        message: settings.maintenanceMode.message,
        startTime: start,
        endTime: end
      };
    }
  }

  // Set maintenance mode with automatic scheduling
  async setMaintenanceMode(enabled, startTime = null, endTime = null, message = null) {
    try {
      const settings = await this.getBookingSettings();
      
      const maintenanceConfig = {
        enabled,
        startTime: startTime ? new Date(startTime).toISOString() : null,
        endTime: endTime ? new Date(endTime).toISOString() : null,
        message: message || settings.maintenanceMode?.message || 'The booking system is temporarily under maintenance. Please try again later.'
      };

      await this.updateBookingSettings({
        ...settings,
        maintenanceMode: maintenanceConfig
      });

      return maintenanceConfig;
    } catch (error) {
      console.error('Error setting maintenance mode:', error);
      throw error;
    }
  }

  // Toggle tour package availability
  async toggleTourPackage(packageType, enabled) {
    try {
      const settings = await this.getBookingSettings();
      
      const newSettings = { ...settings };
      
      if (packageType === 'smallGroup') {
        // Prevent disabling both packages
        if (!enabled && !settings.organizationTourEnabled) {
          throw new Error('Cannot disable Small Group Tour while Organization Tour is already disabled. At least one tour package must remain enabled.');
        }
        newSettings.smallGroupTourEnabled = enabled;
      } else if (packageType === 'organization') {
        // Prevent disabling both packages
        if (!enabled && !settings.smallGroupTourEnabled) {
          throw new Error('Cannot disable Organization Tour while Small Group Tour is already disabled. At least one tour package must remain enabled.');
        }
        newSettings.organizationTourEnabled = enabled;
      } else {
        throw new Error('Invalid package type. Must be "smallGroup" or "organization".');
      }

      await this.updateBookingSettings(newSettings);
      return newSettings;
    } catch (error) {
      console.error('Error toggling tour package:', error);
      throw error;
    }
  }

  // Toggle optional form fields
  async toggleOptionalField(fieldType, enabled) {
    try {
      const settings = await this.getBookingSettings();
      
      const newSettings = { ...settings };
      
      if (fieldType === 'specialRequests') {
        newSettings.specialRequestsEnabled = enabled;
      } else if (fieldType === 'attachments') {
        newSettings.attachmentsEnabled = enabled;
      } else {
        throw new Error('Invalid field type. Must be "specialRequests" or "attachments".');
      }

      await this.updateBookingSettings(newSettings);
      return newSettings;
    } catch (error) {
      console.error('Error toggling optional field:', error);
      throw error;
    }
  }

  // Automatic maintenance mode scheduler
  async checkAndUpdateScheduledMaintenance() {
    try {
      const settings = await this.getBookingSettings();
      
      if (!settings.maintenanceMode || !settings.maintenanceMode.startTime || !settings.maintenanceMode.endTime) {
        return settings; // No scheduled maintenance
      }

      const now = new Date();
      const startTime = new Date(settings.maintenanceMode.startTime);
      const endTime = new Date(settings.maintenanceMode.endTime);

      let maintenanceCheck = this.checkMaintenanceMode(settings);
      let shouldUpdate = false;
      let newMaintenanceState = { ...settings.maintenanceMode };

      // Check if maintenance should start
      if (!settings.maintenanceMode.enabled && now >= startTime && now <= endTime) {
        newMaintenanceState.enabled = true;
        shouldUpdate = true;
      }
      // Check if maintenance should end
      else if (settings.maintenanceMode.enabled && now > endTime) {
        newMaintenanceState.enabled = false;
        shouldUpdate = true;
      }

      // Update if needed
      if (shouldUpdate) {
        const updatedSettings = {
          ...settings,
          maintenanceMode: newMaintenanceState
        };
        
        await this.updateBookingSettings(updatedSettings, true); // Skip admin check for automatic updates
        return updatedSettings;
      }

      return settings;
    } catch (error) {
      console.error('Error in automatic maintenance scheduling:', error);
      throw error;
    }
  }

  // Start the automatic maintenance scheduler (call this on app initialization)
  startMaintenanceScheduler(intervalMinutes = 1) {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    setInterval(async () => {
      try {
        await this.checkAndUpdateScheduledMaintenance();
      } catch (error) {
        console.error('Maintenance scheduler error:', error);
      }
    }, intervalMs);
  }

  // Update daily booking limits
  async updateDailyBookingLimits(tourType, enabled, limit) {
    try {
      const settings = await this.getBookingSettings();
      
      if (!['smallGroupTour', 'organizationTour'].includes(tourType)) {
        throw new Error('Invalid tour type. Must be "smallGroupTour" or "organizationTour".');
      }

      if (enabled && (!limit || limit < 1)) {
        throw new Error('Daily booking limit must be at least 1 when enabled.');
      }

      const newSettings = {
        ...settings,
        dailyBookingLimits: {
          ...settings.dailyBookingLimits,
          [tourType]: {
            enabled,
            limit: enabled ? Math.max(1, parseInt(limit)) : (settings.dailyBookingLimits?.[tourType]?.limit || 10)
          }
        }
      };

      await this.updateBookingSettings(newSettings);
      return newSettings;
    } catch (error) {
      console.error('Error updating daily booking limits:', error);
      throw error;
    }
  }

  // Get today's booking count for a specific tour type
  async getTodayBookingCount(tourType, date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Import here to avoid circular dependency
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const tourName = tourType === 'smallGroupTour' ? 'Small Group Tour' : 'Organization & Institutional Tour';
      
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('packageName', '==', tourName),
        where('date', '==', targetDate),
        where('status', 'in', ['verified', 'approved', 'completed']) // Only count confirmed bookings
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting today\'s booking count:', error);
      return 0;
    }
  }

  // Check if booking is allowed based on daily limits
  async checkDailyBookingLimit(tourType, date = null) {
    try {
      const settings = await this.getBookingSettings();
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // If daily limits are disabled for this tour type, allow booking
      if (!settings.dailyBookingLimits?.[tourType]?.enabled) {
        return {
          allowed: true,
          currentCount: 0,
          limit: null,
          remaining: null
        };
      }

      const limit = settings.dailyBookingLimits[tourType].limit;
      const currentCount = await this.getTodayBookingCount(tourType, targetDate);
      const remaining = Math.max(0, limit - currentCount);
      const allowed = currentCount < limit;

      return {
        allowed,
        currentCount,
        limit,
        remaining
      };
    } catch (error) {
      console.error('Error checking daily booking limit:', error);
      // Allow booking if there's an error checking limits
      return {
        allowed: true,
        currentCount: 0,
        limit: null,
        remaining: null,
        error: true
      };
    }
  }

  // Get booking statistics for admin dashboard
  async getBookingStatistics(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const settings = await this.getBookingSettings();

      const smallGroupStats = await this.checkDailyBookingLimit('smallGroupTour', targetDate);
      const organizationStats = await this.checkDailyBookingLimit('organizationTour', targetDate);

      return {
        date: targetDate,
        smallGroupTour: {
          ...smallGroupStats,
          limitEnabled: settings.dailyBookingLimits?.smallGroupTour?.enabled || false
        },
        organizationTour: {
          ...organizationStats,
          limitEnabled: settings.dailyBookingLimits?.organizationTour?.enabled || false
        }
      };
    } catch (error) {
      console.error('Error getting booking statistics:', error);
      return null;
    }
  }

  // Update contact information
  async updateContactInformation(contactInfo) {
    try {
      const settings = await this.getBookingSettings();
      
      // Validate required fields
      if (!contactInfo.businessName?.trim()) {
        throw new Error('Business name is required.');
      }
      if (!contactInfo.email?.trim()) {
        throw new Error('Email address is required.');
      }
      if (!contactInfo.phone?.trim()) {
        throw new Error('Phone number is required.');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactInfo.email)) {
        throw new Error('Please enter a valid email address.');
      }

      const newSettings = {
        ...settings,
        contactInformation: {
          ...settings.contactInformation,
          ...contactInfo,
          // Ensure office hours structure is maintained
          officeHours: {
            ...settings.contactInformation?.officeHours,
            ...contactInfo.officeHours
          },
          socialMedia: {
            ...settings.contactInformation?.socialMedia,
            ...contactInfo.socialMedia
          }
        }
      };

      await this.updateBookingSettings(newSettings);
      return newSettings;
    } catch (error) {
      console.error('Error updating contact information:', error);
      throw error;
    }
  }

  // Get contact information only
  async getContactInformation() {
    try {
      const settings = await this.getBookingSettings();
      return settings.contactInformation || {
        businessName: 'Casa Hacienda',
        email: 'tourismoffice886@gmail.com',
        phone: '(046) 886-9707',
        officeHours: {
          weekdays: 'Monday - Friday: 8:00 AM - 5:00 PM',
          weekends: 'Saturday - Sunday: By appointment only',
          holidays: 'Holidays: By appointment only'
        },
        address: 'Casa Hacienda de Tejeros, Rosario, Cavite',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      };
    } catch (error) {
      console.error('Error getting contact information:', error);
      // Return default contact info if there's an error
      return {
        businessName: 'Casa Hacienda',
        email: 'tourismoffice886@gmail.com',
        phone: '(046) 886-9707',
        officeHours: {
          weekdays: 'Monday - Friday: 8:00 AM - 5:00 PM',
          weekends: 'Saturday - Sunday: By appointment only',
          holidays: 'Holidays: By appointment only'
        },
        address: 'Casa Hacienda de Tejeros, Rosario, Cavite',
        socialMedia: {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      };
    }
  }
}

export const bookingSettingsService = new BookingSettingsService();
