import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';


// Helper: get static Google Drive link to default permission letter template
const getDefaultPermissionLetterLink = () => {
  // Replace this with your actual Google Drive link to a default permission letter template
  // Make sure the file is set to "Anyone with the link can view"
  return process.env.REACT_APP_DEFAULT_PERMISSION_LETTER_LINK || 'https://drive.google.com/file/d/YOUR_DEFAULT_TEMPLATE_FILE_ID/view?usp=sharing';
};

export const bookingService = {
  // Check if an email already has any upcoming (active) booking
  async hasActiveBooking(email) {
    if (!email) return false;
    const now = Date.now();
    const qDup = query(
      collection(db, 'bookings'),
      where('email', '==', email),
      where('visitDateTimeEpoch', '>=', now)
    );
    const dupSnap = await getDocs(qDup);
    return !dupSnap.empty;
  },

  // Create a new booking
  async createBooking(bookingData) {
    try {
      // Normalize and add a sortable visit timestamp for duplicate checks
      let visitDateTimeEpoch = null;
      if (bookingData.date && bookingData.time) {
        // Expecting time like "08:00 AM"; convert to 24h
        const [timePart, ampm] = bookingData.time.split(' ');
        let [hh, mm] = timePart.split(':').map(Number);
        if (ampm === 'PM' && hh !== 12) hh += 12;
        if (ampm === 'AM' && hh === 12) hh = 0;
        const iso = `${bookingData.date}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
        visitDateTimeEpoch = Date.parse(iso);
      }

      // Prevent duplicate active bookings for same email until visit passes
      if (bookingData.email && visitDateTimeEpoch) {
        const now = Date.now();
        const qDup = query(
          collection(db, 'bookings'),
          where('email', '==', bookingData.email),
          where('visitDateTimeEpoch', '>=', now)
        );
        const dupSnap = await getDocs(qDup);
        if (!dupSnap.empty) {
          throw new Error('duplicate_active_booking');
        }
      }

      const booking = {
        ...bookingData,
        status: bookingData.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: bookingData.emailVerified === true ? true : false,
        visitDateTimeEpoch: visitDateTimeEpoch
      };

      const docRef = await addDoc(collection(db, 'bookings'), booking);
      
      // If email verification is required, send verification email
      if (!booking.emailVerified && booking.status === 'pending_email_verification') {
        try {
          await this.sendBookingVerificationEmail(docRef.id);
        } catch (emailError) {
          console.warn('Failed to send verification email:', emailError);
          // Don't fail the booking creation if email fails
        }
      } else {
        // Send confirmation email immediately (for already verified or test mode)
        try {
          await this.sendBookingConfirmationEmail(docRef.id);
        } catch (emailError) {
          console.warn('Failed to send confirmation email:', emailError);
          // Don't fail the booking creation if email fails
        }
      }
       
      return { success: true, bookingId: docRef.id };
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error && error.message === 'duplicate_active_booking') {
        return { success: false, error: 'duplicate_active_booking', message: 'This email address is already associated with a booking that is currently being processed. Please wait for your current booking to be completed or contact us if you need to make changes to your existing booking.' };
      }
      throw error;
    }
  },

  // Verify booking email
  async verifyBookingEmail(bookingId, verificationToken) {
    try {
      // Get the booking to verify the token
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingDoc.data();
      
      // Simple token verification (you may want to implement a more secure system)
      const expectedToken = btoa(booking.email + bookingId);
      if (verificationToken !== expectedToken) {
        throw new Error('Invalid verification token');
      }
      
      // Check if already verified
      if (booking.emailVerified) {
        return true; // Already verified, no need to update
      }
      
      // Update booking status
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
      return false;
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

  // Send booking email verification
  async sendBookingVerificationEmail(bookingId) {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      const booking = bookingDoc.data();
      
      // Create verification link - you may want to implement a proper token system
      const verificationLink = `${window.location.origin}/verify-booking?id=${bookingId}&token=${btoa(booking.email + bookingId)}`;
      
      const templateParams = {
        to_email: booking.email,
        to_name: booking.name || 'Guest',
        subject: 'Verify Your Booking Email - Casa Hacienda de Tejeros',
        message: `
          Dear ${booking.name || 'Guest'},
          
          Thank you for your booking with Casa Hacienda de Tejeros!
          
          To complete your booking, please verify your email address by clicking the link below:
          
          ${verificationLink}
          
          Booking Details:
          - Package: ${booking.packageName}
          - Date: ${booking.date}
          - Time: ${booking.time}
          - Guests: ${booking.guests}
          
          This link will expire in 24 hours. If you did not make this booking, please ignore this email.
          
          Best regards,
          Casa Hacienda de Tejeros Tourism Office
        `
      };

      // Import EmailJS dynamically
      const emailjs = await import('@emailjs/browser');
      
      await emailjs.default.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
      );
      console.log('Booking verification email sent successfully!');
      
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  },

  // Send booking confirmation email
  async sendBookingConfirmationEmail(bookingId) {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      const booking = bookingDoc.data();
      
      // Get the static link to the default permission letter template
      const permissionLetterLink = getDefaultPermissionLetterLink();

      const templateParams = {
        to_email: booking.email,
        to_name: booking.name || 'Guest',
        booking_id: bookingId,
        booking_date: booking.date,
        booking_time: booking.time,
        number_of_people: booking.guests,
        contact_number: booking.phone || '',
        email_address: booking.email,
        special_requests: booking.adminNotes || '',
        booking_pdf: permissionLetterLink, // Static link to default template
        booking_filename: 'Permission_Letter_Template.docx'
      };

      // Import EmailJS dynamically
      const emailjs = await import('@emailjs/browser');
      
      await emailjs.default.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
      );
      console.log('Email with permission letter template link sent successfully!');
      
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
        default:
          // Unknown status; no email
          return;
      }
      
      // For now, just log the email that would be sent
      console.log(`Status update email would be sent to ${booking.email}:`, { subject, message });
      
      /* Firebase Extensions email (commented out for now):
      await updateDoc(doc(db, 'emails', `status-${bookingId}`), {
        to: booking.email,
        message: {
          subject: subject,
          html: message
        }
      });
      */
    } catch (error) {
      console.error('Error sending status update email:', error);
    }
  }
};
