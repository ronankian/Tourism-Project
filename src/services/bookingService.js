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
      
       // Send confirmation email immediately (no verification needed)
       try {
         await this.sendBookingConfirmationEmail(docRef.id);
       } catch (emailError) {
         console.warn('Failed to send confirmation email:', emailError);
         // Don't fail the booking creation if email fails
       }
       
      return { success: true, bookingId: docRef.id };
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error && error.message === 'duplicate_active_booking') {
        return { success: false, error: 'An existing booking for this email is still active or upcoming.' };
      }
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
      
             // Import required modules for email functionality
       const emailjsModule = await import('@emailjs/browser');
       const pizzip = await import('pizzip');
       const docxtemplater = await import('docxtemplater');
       const { storage } = await import('../firebase');
       const firebaseStorage = await import('firebase/storage');
       const { ref: storageRef, uploadBytes, getDownloadURL } = firebaseStorage;
      
      console.log('Sending booking confirmation email to:', booking.email);
      console.log('Booking details:', {
        name: booking.name,
        packageName: booking.packageName,
        date: booking.date,
        guests: booking.guests
      });
      
      // Generate permission letter if it's an organization tour
      if (booking.packageName === 'Organization & Institutional Tour') {
        try {
          // Generate permission letter DOCX from template
          const blob = await (async () => {
            try {
              const templateResponse = await fetch('/templates/permission-letter.docx');
              if (!templateResponse.ok) {
                throw new Error('Template not found');
              }
                             const arrayBuffer = await templateResponse.arrayBuffer();
               const zip = new pizzip.default(arrayBuffer);
               const doc = new docxtemplater.default(zip, { paragraphLoop: true, linebreaks: true });
              const visitorAffiliation = (booking.organizationType === 'School')
                ? `${booking.schoolName || ''}${booking.course ? ` (${booking.course})` : ''}`
                : (booking.organizationName || booking.organizationType || booking.name || '');
              doc.setData({
                date_today: new Date().toLocaleDateString(),
                visitor_name: booking.name || 'Guest',
                visitor_affiliation: visitorAffiliation,
                email: booking.email,
                phone: booking.phone || '',
                organization_type: booking.organizationType || '',
                school_name: booking.schoolName || '',
                course: booking.course || '',
                organization_name: booking.organizationName || '',
                purpose: booking.effectivePurpose || booking.purpose || '',
                date_requested: booking.date,
                time_requested: booking.time,
                guests: String(booking.guests),
                package_name: booking.packageName
              });
              doc.render();
              return doc.getZip().generate({
                type: 'blob',
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              });
            } catch (templateError) {
              console.error('Template processing failed, creating simple document:', templateError);
              
              // Create a simple text-based document as fallback
              const simpleContent = `PERMISSION LETTER

Date: ${new Date().toLocaleDateString()}

TO WHOM IT MAY CONCERN:

This letter serves as permission for the following visitor to tour Casa Hacienda de Tejeros:

Visitor Information:
- Name: ${booking.name || 'Guest'}
- Affiliation: ${(booking.organizationType === 'School') ? `${booking.schoolName || ''}${booking.course ? ` (${booking.course})` : ''}` : (booking.organizationName || booking.organizationType || booking.name || '')}
- Email: ${booking.email}
- Phone: ${booking.phone || ''}

Organization Details:
- Organization Type: ${booking.organizationType || ''}
- School Name: ${booking.schoolName || ''}
- Course: ${booking.course || ''}
- Organization Name: ${booking.organizationName || ''}

Tour Details:
- Purpose: ${booking.effectivePurpose || booking.purpose || ''}
- Requested Date: ${booking.date}
- Requested Time: ${booking.time}
- Number of Guests: ${booking.guests}
- Package: ${booking.packageName}

This permission letter must be presented upon arrival at Casa Hacienda de Tejeros for verification.

Thank you for choosing to visit our historical site.

Sincerely,
Casa Hacienda de Tejeros Tourism Office
Rosario, Cavite`;

              // Create a simple blob with the text content
              return new Blob([simpleContent], { type: 'text/plain' });
            }
          })();
          
          // Upload the generated document to Firebase Storage to obtain an HTTPS download link
          let httpsDownloadUrl = null;

          try {
            // Determine appropriate file extension based on blob type
            const isDocx = blob.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            const fileExt = isDocx ? 'docx' : 'txt';
            const storagePath = `permission-letters/${bookingId}.${fileExt}`;
            const objectRef = storageRef(storage, storagePath);
            await uploadBytes(objectRef, blob);
            httpsDownloadUrl = await getDownloadURL(objectRef);
          } catch (uploadError) {
            console.warn('Storage upload failed; proceeding without hosted link:', uploadError);
          }

          // Send email via EmailJS with base64 attachment as well (more reliable across clients)
           const base64 = await new Promise((resolve, reject) => {
             const reader = new FileReader();
             reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
             reader.onerror = reject;
             reader.readAsDataURL(blob);
           });

          // If a Google Apps Script mailer URL is configured, send the email with attachment via Gmail (free)
          const gasMailerUrl = process.env.REACT_APP_GAS_EMAIL_WEBAPP_URL;
          if (gasMailerUrl) {
            try {
              const isDocx = blob.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
              const filename = `Permission_Letter_${bookingId}.${isDocx ? 'docx' : 'txt'}`;
              const htmlBody = [
                'Dear ' + (booking.name || 'Guest') + ',<br/><br/>',
                'Please find your permission letter attached to this email.<br/><br/>',
                '<strong>Booking Details:</strong><br/>',
                `Package: ${booking.packageName}<br/>`,
                `Date: ${booking.date}<br/>`,
                `Time: ${booking.time}<br/>`,
                `Guests: ${booking.guests}<br/><br/>`,
                'Best regards,<br/>Casa Hacienda de Tejeros Tourism Office'
              ].join('');

              await fetch(gasMailerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: booking.email,
                  subject: 'Your Booking Permission Letter',
                  html: htmlBody,
                  base64: base64,
                  filename: filename,
                  mimeType: blob.type || 'application/octet-stream'
                })
              });

              console.log('Email sent via Google Apps Script with attachment.');
              return; // Stop here; no need to use EmailJS path
            } catch (gasError) {
              console.warn('GAS mailer failed, falling back to EmailJS:', gasError);
            }
          }

          // Prefer HTTPS Storage URL; fall back to data URL if upload failed (used only if template shows a link)
          const dataUrl = `data:${blob.type};base64,${base64}`;
          const downloadLinkForEmail = httpsDownloadUrl || dataUrl;

            const templateParams = {
              to_email: booking.email,
              to_name: booking.name || 'Guest',
              subject: 'Your Booking Permission Letter',
              message: 'Please download, print, and bring this permission letter for signing at our office. The document is attached to this email.',
              booking_pdf: base64,
              booking_filename: `Permission_Letter_${bookingId}.docx`,
              // If you later enable Firebase Storage, you can include this link in your template.
              // download_link: downloadLinkForEmail
            };
           
           // Send email with attachment
           await emailjsModule.default.send(
             process.env.REACT_APP_EMAILJS_SERVICE_ID,
             process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
             templateParams,
             { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
           );
           
           console.log('Email with permission letter attachment sent successfully!');
           
         } catch (e) {
           console.error('Email with attachment failed, retrying with link only:', e);
           
           // Log detailed error information for debugging
           if (e.name === 'TemplateError') {
             console.error('Template errors:', e.errors);
             console.error('This indicates the Word document template has malformed tags.');
             console.error('Please check the EMAILJS_SETUP.md guide for template fixes.');
           }
           
           if (e.message && e.message.includes('public key is required')) {
             console.error('EmailJS environment variables are missing.');
             console.error('Please create a .env file with REACT_APP_EMAILJS_* variables.');
             console.error('See EMAILJS_SETUP.md for setup instructions.');
           }
           
           try {
             // Fallback: send email without attachment
             const fallbackMessage = 'Please download, print, and bring this permission letter for signing at our office.';
             
              await emailjsModule.default.send(
               process.env.REACT_APP_EMAILJS_SERVICE_ID,
               process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
               {
                 to_email: booking.email,
                 to_name: booking.name || 'Guest',
                 subject: 'Your Booking Permission Letter',
                  message: `${fallbackMessage} If you do not see an attachment, please contact us at (046) 886-9707 or tourismoffice886@gmail.com.`
               },
               { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
             );
             
             console.log('Fallback email sent successfully!');
           } catch (e2) {
             console.error('Fallback email failed:', e2);
             console.error('Both attachment and fallback email failed. Check EmailJS configuration.');
           }
         }
      } else {
                 // For non-organization tours, send simple confirmation email
         await emailjsModule.default.send(
           process.env.REACT_APP_EMAILJS_SERVICE_ID,
           process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
           {
             to_email: booking.email,
             to_name: booking.name || 'Guest',
             subject: 'Booking Confirmation - Casa Hacienda de Tejeros',
             message: `Thank you for your booking with Casa Hacienda de Tejeros Tourism Office!

Booking Details:
- Package: ${booking.packageName}
- Date: ${booking.date}
- Time: ${booking.time}
- Guests: ${booking.guests}
- Status: Verified

Your booking is now being reviewed by our team. You will receive an approval email within 24 hours.

Best regards,
Casa Hacienda de Tejeros Tourism Office`,
             // No additional documents required; no download link needed
           },
           { publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY }
         );
        
        console.log('Simple confirmation email sent successfully!');
      }
      
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
