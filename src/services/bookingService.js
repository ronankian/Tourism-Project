import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export const bookingService = {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      const booking = {
        ...bookingData,
        status: bookingData.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: bookingData.emailVerified === true ? true : false
      };

      const docRef = await addDoc(collection(db, 'bookings'), booking);
      
      return { success: true, bookingId: docRef.id };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Verify booking email
  async verifyBookingEmail(bookingId, verificationToken) {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        emailVerified: true,
        verifiedAt: serverTimestamp(),
        status: 'verified'
      });

      // Send confirmation email
      await this.sendBookingConfirmationEmail(bookingId);
      
      return true;
    } catch (error) {
      console.error('Error verifying booking:', error);
      throw error;
    }
  },

  // Get all bookings (for admin)
  async getAllBookings() {
    try {
      const q = query(
        collection(db, 'bookings'), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw error;
    }
  },

  // Get bookings by status
  async getBookingsByStatus(status) {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting bookings by status:', error);
      throw error;
    }
  },

  // Update booking status (admin function)
  async updateBookingStatus(bookingId, status, adminNotes = '') {
    try {
      const updateData = {
        status: status,
        updatedAt: serverTimestamp(),
        adminNotes: adminNotes
      };

      // Add status-specific timestamps
      if (status === 'approved') {
        updateData.approvedAt = serverTimestamp();
      } else if (status === 'rejected') {
        updateData.rejectedAt = serverTimestamp();
      } else if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
      }

      await updateDoc(doc(db, 'bookings', bookingId), updateData);

      // Send status update email
      await this.sendStatusUpdateEmail(bookingId, status);
      
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Send booking confirmation email
  async sendBookingConfirmationEmail(bookingId) {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      const booking = bookingDoc.data();
      
      // This will trigger the Firebase Extension to send email
      await updateDoc(doc(db, 'emails', `confirmation-${bookingId}`), {
        to: booking.email,
        message: {
          subject: 'Booking Confirmation - Casa Hacienda de Tejeros',
          html: `
            <h2>Booking Confirmation</h2>
            <p>Dear ${booking.name},</p>
            <p>Thank you for your booking with Casa Hacienda de Tejeros Tourism Office!</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Package: ${booking.packageName}</li>
              <li>Date: ${booking.date}</li>
              <li>Guests: ${booking.guests}</li>
              <li>Status: Verified</li>
            </ul>
            <p>Your booking is now being reviewed by our team. You will receive an approval email within 24 hours.</p>
            <p>Best regards,<br>Casa Hacienda de Tejeros Tourism Office</p>
          `
        }
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  },

  // Send status update email
  async sendStatusUpdateEmail(bookingId, status) {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      const booking = bookingDoc.data();
      
      let subject = '';
      let message = '';
      
      switch (status) {
        case 'approved':
          subject = 'Booking Approved - Casa Hacienda de Tejeros';
          message = `
            <h2>Booking Approved!</h2>
            <p>Dear ${booking.name},</p>
            <p>Great news! Your booking has been approved.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
              <li>Package: ${booking.packageName}</li>
              <li>Date: ${booking.date}</li>
              <li>Guests: ${booking.guests}</li>
            </ul>
            <p>Please arrive 15 minutes before your scheduled time.</p>
            <p>For any questions, contact us at (046) 886-9707</p>
            <p>Best regards,<br>Casa Hacienda de Tejeros Tourism Office</p>
          `;
          break;
          
        case 'rejected':
          subject = 'Booking Update - Casa Hacienda de Tejeros';
          message = `
            <h2>Booking Update</h2>
            <p>Dear ${booking.name},</p>
            <p>We regret to inform you that your booking could not be approved at this time.</p>
            <p>Reason: ${booking.adminNotes || 'No specific reason provided'}</p>
            <p>Please contact us at (046) 886-9707 for assistance.</p>
            <p>Best regards,<br>Casa Hacienda de Tejeros Tourism Office</p>
          `;
          break;
          
        case 'completed':
          subject = 'Tour Completed - Casa Hacienda de Tejeros';
          message = `
            <h2>Tour Completed</h2>
            <p>Dear ${booking.name},</p>
            <p>Thank you for choosing Casa Hacienda de Tejeros Tourism Office!</p>
            <p>We hope you enjoyed your tour. Please share your experience with us.</p>
            <p>Best regards,<br>Casa Hacienda de Tejeros Tourism Office</p>
          `;
          break;
      }
      
      // This will trigger the Firebase Extension to send email
      await updateDoc(doc(db, 'emails', `status-${bookingId}`), {
        to: booking.email,
        message: {
          subject: subject,
          html: message
        }
      });
    } catch (error) {
      console.error('Error sending status update email:', error);
    }
  }
};
