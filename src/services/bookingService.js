import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp, addDoc, orderBy, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';


// Helper: get static Google Drive link to default permission letter template
const getDefaultPermissionLetterLink = () => {
  // Replace this with your actual Google Drive link to a default permission letter template
  // Make sure the file is set to "Anyone with the link can view"
  return process.env.REACT_APP_DEFAULT_PERMISSION_LETTER_LINK || 'https://drive.google.com/file/d/YOUR_DEFAULT_TEMPLATE_FILE_ID/view?usp=sharing';
};

// Helper: read env and strip inline comments/extra spaces
function getEnvTrimmed(name, fallback) {
  try {
    const raw = process.env[name];
    if (!raw || typeof raw !== 'string') return fallback;
    // remove anything after a '#', and trim whitespace
    const cleaned = raw.split('#')[0].trim();
    return cleaned || fallback;
  } catch (_e) {
    return fallback;
  }
}

// Helper: generate a cryptographically strong random token (raw) and its SHA-256 hash (hex)
async function generateVerificationToken() {
  const bytes = new Uint8Array(32);
  (typeof window !== 'undefined' ? window.crypto : crypto).getRandomValues(bytes);
  const rawToken = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const enc = new TextEncoder();
  const hashBuf = await (typeof window !== 'undefined' ? window.crypto.subtle : crypto.subtle).digest('SHA-256', enc.encode(rawToken));
  const tokenHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return { rawToken, tokenHash };
}

// Helper: format expiry for display (Asia/Manila)
function formatExpiryDisplay(expiresAtMs) {
  try {
    return new Date(expiresAtMs).toLocaleString('en-PH', {
      timeZone: 'Asia/Manila', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (_e) {
    return '24 hours';
  }
}

// Helper: compute SHA-256 hex of an input string
async function sha256Hex(input) {
  const enc = new TextEncoder();
  const hashBuf = await (typeof window !== 'undefined' ? window.crypto.subtle : crypto.subtle).digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper: generate human-friendly booking code (BL-YYYY-XXXXXX) and ensure uniqueness
async function generateUniqueBookingCode() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const num = Math.floor(Math.random() * 1000000);
    const six = String(num).padStart(6, '0');
    const code = `BL-${year}-${six}`;
    const existing = await getDocs(query(collection(db, 'bookings'), where('bookingCode', '==', code)));
    if (existing.empty) {
      return code;
    }
  }
  // Fallback with timestamp to avoid collision
  const fallback = `BL-${year}-${String(Date.now()).slice(-6)}`;
  return fallback;
}

export const bookingService = {
  // Check if an email already has any upcoming (active) booking
  async hasActiveBooking(email) {
    if (!email) return false;
    const now = Date.now();
    // Fetch by email only to avoid composite index requirements
    const qByEmail = query(
      collection(db, 'bookings'),
      where('email', '==', email)
    );
    const snap = await getDocs(qByEmail);
    if (snap.empty) return false;
    const consideredStatuses = new Set(['verified', 'approved', 'completed']);
    for (const d of snap.docs) {
      const data = d.data();
      const visitEpoch = data.visitDateTimeEpoch || 0;
      const status = String(data.status || '').toLowerCase();
      if (visitEpoch >= now && consideredStatuses.has(status)) {
        return true;
      }
    }
    return false;
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
        // Avoid composite index: check by email, then filter in memory
        const qByEmail = query(
          collection(db, 'bookings'),
          where('email', '==', bookingData.email)
        );
        const snap = await getDocs(qByEmail);
        if (!snap.empty) {
          const consideredStatuses = new Set(['verified', 'approved', 'completed']);
          for (const d of snap.docs) {
            const data = d.data();
            const visitEpoch = data.visitDateTimeEpoch || 0;
            const status = String(data.status || '').toLowerCase();
            if (visitEpoch >= now && consideredStatuses.has(status)) {
              throw new Error('duplicate_active_booking');
            }
          }
        }
      }

      // Generate a human-friendly booking code (not used as doc ID to avoid URL issues with special chars)
      const bookingCode = await generateUniqueBookingCode();

      const booking = {
        ...bookingData,
        status: bookingData.status || 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: bookingData.emailVerified === true ? true : false,
        visitDateTimeEpoch: visitDateTimeEpoch,
        bookingCode
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
      }
      // REMOVED: Don't send confirmation email here to prevent duplicates
      // The confirmation email will be sent from FirebaseActionRedirect.js after email verification

      // Send admin notification for new booking
      try {
        await this.sendAdminBookingNotification(docRef.id);
      } catch (adminEmailError) {
        console.warn('Failed to send admin notification:', adminEmailError);
        // Don't fail the booking creation if admin email fails
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
      
      // Prefer secure token flow if present
      if (booking.verificationTokenHash) {
        if (!verificationToken) {
          throw new Error('Missing verification token');
        }
        const incomingHash = await sha256Hex(verificationToken);
        if (incomingHash !== booking.verificationTokenHash) {
          throw new Error('Invalid verification token');
        }
        // Expiry check
        if (booking.verificationExpiresAt) {
          const nowMs = Date.now();
          const expMs = typeof booking.verificationExpiresAt === 'number'
            ? booking.verificationExpiresAt
            : Date.parse(booking.verificationExpiresAt);
          if (!Number.isNaN(expMs) && nowMs > expMs) {
            throw new Error('Verification token expired');
          }
        }

        // Already verified?
        if (booking.emailVerified) {
          return true;
        }

        // Mark verified and clear token info
        await updateDoc(doc(db, 'bookings', bookingId), {
          emailVerified: true,
          verifiedAt: serverTimestamp(),
          status: 'verified',
          verificationTokenHash: null,
          verificationExpiresAt: null
        });

        // Send confirmation email
        await this.sendBookingConfirmationEmail(bookingId);
        return true;
      }

      // Fallback legacy token (btoa of email + bookingId)
      const expectedToken = btoa(booking.email + bookingId);
      if (verificationToken !== expectedToken) {
        throw new Error('Invalid verification token');
      }

      if (booking.emailVerified) {
        return true;
      }

      await updateDoc(doc(db, 'bookings', bookingId), {
        emailVerified: true,
        verifiedAt: serverTimestamp(),
        status: 'verified'
      });

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
      const bookingRef = doc(db, 'bookings', bookingId);
      let didChange = false;

      await runTransaction(db, async (tx) => {
        const snap = await tx.get(bookingRef);
        if (!snap.exists()) {
          throw new Error('Booking not found');
        }

        const current = snap.data();
        const currentStatus = String(current.status || '').toLowerCase();
        if (currentStatus === status) {
          didChange = false; // no-op; avoids duplicate emails
          return;
        }

        const updateData = {
          status: status,
          updatedAt: serverTimestamp(),
          adminNotes: adminNotes
        };

        if (status === 'approved') {
          updateData.approvedAt = serverTimestamp();
        } else if (status === 'rejected') {
          updateData.rejectedAt = serverTimestamp();
        } else if (status === 'completed') {
          updateData.completedAt = serverTimestamp();
        }

        tx.update(bookingRef, updateData);
        didChange = true;
      });

      if (didChange) {
        await this.sendStatusUpdateEmail(bookingId, status);
      }

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
      
      // Generate secure single-use token and set expiry (24h)
      const { rawToken, tokenHash } = await generateVerificationToken();
      const expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;
      await updateDoc(doc(db, 'bookings', bookingId), {
        verificationTokenHash: tokenHash,
        verificationExpiresAt: expiresAtMs
      });

      // Build link and template params
      const verificationLink = `${window.location.origin}/verify-booking?id=${bookingId}&token=${rawToken}`;
      const verificationExpires = formatExpiryDisplay(expiresAtMs);

      const permissionLetterLink = getDefaultPermissionLetterLink();
      const templateParams = {
        to_email: booking.email,
        to_name: booking.name || 'Guest',
        email: booking.email, // for Reply To: {{email}}
        reply_to: booking.email,
        from_name: 'Casa Hacienda de Tejeros',
        verification_link: verificationLink,
        verification_expires: verificationExpires,
        booking_id: booking.bookingCode || bookingId,
        booking_date: booking.date,
        booking_time: booking.time,
        number_of_people: booking.guests,
        contact_number: booking.phone || '',
        email_address: booking.email,
        booking_pdf: permissionLetterLink,
        booking_filename: 'Permission_Letter_Template.docx',
        special_requests: booking.adminNotes || '',
        subject: 'Verify Your Booking Email - Casa Hacienda de Tejeros'
      };

      // Import EmailJS dynamically
      const emailjs = await import('@emailjs/browser');
      const templateId = getEnvTrimmed('REACT_APP_EMAILJS_USER_BOOKING_TEMPLATE_ID', 'template_8yzllnv');
      // Optional: basic validation
      if (!templateId || !/^template_/i.test(templateId)) {
        console.warn('EmailJS template ID seems invalid. Falling back to default template_8yzllnv. Got:', templateId);
      }
      await emailjs.default.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        'template_8yzllnv',
        templateParams,
        { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
      );
      
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
        booking_id: booking.bookingCode || bookingId,
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
        'template_8yzllnv',
        templateParams,
        { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
      );
      
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  },

  // Send status update email
  async sendStatusUpdateEmail(bookingId, status) {
    let templateParams = null;
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      const booking = bookingDoc.data();
      
      let statusMessage = '';
      
      switch (status) {
        case 'approved':
          statusMessage = 'CONGRATULATIONS! Your visit has been confirmed. Please follow all our site protocols and guidelines during your visit.';
          break;
          
        case 'rejected':
          // Prefer the admin-provided notes; fallback to a default message
          statusMessage = (booking.adminNotes && booking.adminNotes.trim().length > 0)
            ? booking.adminNotes.trim()
            : 'Unfortunately, we cannot accommodate your visit request at this time.';
          break;
          
        case 'completed':
          statusMessage = 'Thank you for choosing Casa Hacienda de Tejeros Tourism Office! We hope you enjoyed your tour. Please share your experience with us.';
          break;
        default:
          // Unknown status; no email
          return;
      }

      // Use the correct template structure for template_9wog0ug
      const templateParams = {
        to_email: booking.email,
        to_name: booking.name || 'Guest',
        email: booking.email, // For Reply To field
        status: status.toUpperCase(),
        from_name: booking.name,
        from_email: booking.email,
        booking_id: booking.bookingCode || bookingId,
        destination: 'Casa Hacienda de Tejeros',
        visit_date: booking.date,
        visit_time: booking.time,
        visitor_count: booking.guests,
        status_message: statusMessage,
        update_date: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Manila'
        })
      };

      // Import EmailJS dynamically
      const emailjs = await import('@emailjs/browser');
      

      
      await emailjs.default.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_wgx7m5q',
        'template_9wog0ug',
        templateParams,
        { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 's7q183h_v5_g0Gu3X' }
      );
      
    } catch (error) {
      console.error('Error sending status update email:', error);
      console.error('Email data that failed:', templateParams);
    }
  },

  // Send admin notification for new booking
  async sendAdminBookingNotification(bookingId) {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      const booking = bookingDoc.data();
      
      const emailData = {
        notification_type: 'booking confirmation request',
        from_name: booking.name,
        from_email: booking.email,
        phone_number: booking.phone || 'N/A',
        booking_id: bookingId,
        destination: 'Casa Hacienda de Tejeros',
        visit_date: booking.date,
        visit_time: booking.time,
        visitor_count: booking.guests,
        message: booking.specialRequests || 'No special requests',
        submit_date: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Manila'
        })
      };

      // Import EmailJS dynamically
      const emailjs = await import('@emailjs/browser');
      
      await emailjs.default.send(
        process.env.REACT_APP_EMAILJS_ADMIN_SERVICE_ID,
        'template_7al1inq',
        emailData,
        { publicKey: process.env.REACT_APP_EMAILJS_ADMIN_PUBLIC_KEY }
      );
      
    } catch (error) {
      console.error('Error sending admin booking notification:', error);
    }
  }
};
