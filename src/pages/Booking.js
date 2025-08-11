import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Mail } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

const Booking = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: 1,
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
    purpose: '',
    otherPurpose: '',
    organizationType: '',
    schoolName: '',
    course: '',
    organizationName: ''
  });

  const packages = [
    {
      id: 1,
      name: 'Small Group Tour',
      description: 'Perfect for individuals, couples, families, or small gatherings looking for a more personal experience.',
      price: 'Free',
      duration: 'Morning: 8:00 AM - 12:00 PM Afternoon: 1:00 PM - 5:00 PM',
      maxGuests: 20,
      showPerPerson: false
    },
    {
      id: 2,
      name: 'Organization & Institutional Tour',
      description: 'Designed for schools, offices, and cultural organizations hosting heritage-related visits or functions.',
      price: 'Free',
      duration: 'Morning: 8:00 AM - 12:00 PM Afternoon: 1:00 PM - 5:00 PM',
      hasNoLimit: true,
      showPerPerson: false,
      prerequisites: [
        'Letter of Permission',
        'Authorization from School Officials et. al.',
        'Confirm and set intended visit schedule'
      ]
    }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [agreedToProtocols, setAgreedToProtocols] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPackage) {
      toast.error('Please select a tour package');
      return;
    }
    if (!agreedToProtocols) {
      toast.error('Please agree to the Casa Hacienda protocols');
      return;
    }
    if (!bookingData.time) {
      toast.error('Please select a preferred time');
      return;
    }
    if (!bookingData.purpose) {
      toast.error('Please select a purpose of visit');
      return;
    }
    if (bookingData.purpose === 'Other' && !bookingData.otherPurpose.trim()) {
      toast.error('Please specify your purpose of visit');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload attachments if any
      let attachments = [];
      if (attachedFiles.length > 0) {
        const now = Date.now();
        const uploads = attachedFiles.map(async (file, index) => {
          const path = `booking-attachments/${now}-${index}-${file.name}`;
          const ref = storageRef(storage, path);
          await uploadBytes(ref, file);
          const url = await getDownloadURL(ref);
          return {
            name: file.name,
            url,
            size: file.size,
            contentType: file.type || 'application/octet-stream'
          };
        });
        attachments = await Promise.all(uploads);
      }

      // Prepare booking data
      const bookingDataToSubmit = {
        ...bookingData,
        packageName: selectedPackage.name,
        packagePrice: selectedPackage.price,
        packageDuration: selectedPackage.duration,
        totalPrice: selectedPackage.price,
        attachments,
        agreedToProtocols: true,
        effectivePurpose: bookingData.purpose === 'Other' ? bookingData.otherPurpose : bookingData.purpose,
        status: 'verified',
        emailVerified: true
      };
      
      if (selectedPackage.name === 'Organization & Institutional Tour') {
        bookingDataToSubmit.organizationType = bookingData.organizationType;
        if (bookingData.organizationType === 'School') {
          bookingDataToSubmit.schoolName = bookingData.schoolName;
          if (bookingData.course) bookingDataToSubmit.course = bookingData.course;
        } else if (bookingData.organizationType === 'Organization') {
          bookingDataToSubmit.organizationName = bookingData.organizationName;
        }
      }

      // Create booking and send email immediately
      const result = await bookingService.createBooking(bookingDataToSubmit);
      if (result.success) {
        toast.success('Booking submitted successfully! Check your email for confirmation.');
        setShowVerificationMessage(true);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-6">Book Your Tour</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Choose from our carefully curated tour packages and experience the best of Rosario, Cavite
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Tour Packages */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Tour Options</h2>
            
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-lg p-6 shadow-sm border-2 cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 mb-4">{pkg.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{pkg.price}</div>
                    {pkg.showPerPerson && (
                      <div className="text-sm text-gray-500">per person</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-6 h-6 text-gray-500" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    {pkg.hasNoLimit ? (
                      <span>No guest limit</span>
                    ) : (
                      <span>Max {pkg.maxGuests} guests</span>
                    )}
                  </div>
                </div>

                {/* Destinations removed as per request */}

                {pkg.prerequisites && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Prerequisites:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                      {pkg.prerequisites.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Booking Form */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-8 shadow-sm sticky top-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Book Your Tour</h2>
              
              {selectedPackage ? (
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Selected Option:</h3>
                  <p className="text-primary-600 font-medium">{selectedPackage.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedPackage.price}
                    {selectedPackage.showPerPerson ? ' per person' : ''}
                  </p>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">Please select a tour package to continue</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                

                

                {/* Contact info first */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Then date/time/guests */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    id="time"
                    required
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="" disabled>Select a time</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  {selectedPackage?.hasNoLimit ? (
                    <input
                      type="number"
                      id="guests"
                      min={1}
                      required
                      value={bookingData.guests}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setBookingData({
                          ...bookingData,
                          guests: Number.isNaN(value) || value < 1 ? 1 : value
                        });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter number of guests"
                    />
                  ) : (
                    <select
                      id="guests"
                      required
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {[...Array(selectedPackage?.maxGuests || 20)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Organization option details (shown only when Organization & Institutional Tour is selected) */}
                {selectedPackage?.name === 'Organization & Institutional Tour' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">School or Organization</label>
                      <select
                        value={bookingData.organizationType}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            organizationType: e.target.value,
                            // Reset dependent fields when switching type
                            schoolName: '',
                            course: '',
                            organizationName: ''
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="" disabled>Select type</option>
                        <option value="School">School</option>
                        <option value="Organization">Organization</option>
                      </select>
                    </div>

                    {bookingData.organizationType === 'School' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                          <input
                            type="text"
                            value={bookingData.schoolName}
                            onChange={(e) => setBookingData({ ...bookingData, schoolName: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter school name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Course (Optional)</label>
                          <input
                            type="text"
                            value={bookingData.course}
                            onChange={(e) => setBookingData({ ...bookingData, course: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Enter course"
                          />
                        </div>
                      </>
                    )}

                    {bookingData.organizationType === 'Organization' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                        <input
                          type="text"
                          value={bookingData.organizationName}
                          onChange={(e) => setBookingData({ ...bookingData, organizationName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter organization name"
                          required
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Visit
                  </label>
                  <select
                    id="purpose"
                    required
                    value={bookingData.purpose}
                    onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value, otherPurpose: '' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="" disabled>Select a purpose</option>
                    <option value="Event">Event</option>
                    <option value="Field Trip">Field Trip</option>
                    <option value="Interview">Interview</option>
                    <option value="Ocular Visit">Ocular Visit</option>
                    <option value="Vlog/Video">Vlog/Video</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {bookingData.purpose === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please specify
                    </label>
                    <input
                      type="text"
                      value={bookingData.otherPurpose}
                      onChange={(e) => setBookingData({ ...bookingData, otherPurpose: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your purpose"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    id="specialRequests"
                    rows="4"
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Documents (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                    onChange={(e) => setAttachedFiles(Array.from(e.target.files || []))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {attachedFiles.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {attachedFiles.length} file(s) selected
                    </div>
                  )}
                </div>

                {/* Protocols intro emphasis */}
                <div className="p-4 rounded-lg border border-yellow-300 bg-yellow-50 text-gray-800">
                  <h4 className="font-semibold text-gray-900 mb-2">Please read before you agree</h4>
                  <p className="text-sm mb-2">
                    CASA HACIENDA DE TEJEROS is one of the Historical Places in the Country. This is where the First
                    Election was held to establish the Philippine Revolutionary Government. The place where democracy
                    begins for the Philippines.
                  </p>
                  <p className="text-sm mb-2">
                    The original Casa Hacienda did not survive the years of turmoil in the country, so a new structure has
                    been built to commemorate the original Casa Hacienda. That's why it is open to Educational Tours, Visits, Photo Shoots and the like as part of the Revival to
                    promote its Historical Value and Heritage.
                  </p>
                  <p className="text-sm">
                    In this connection, the following Rules and Regulations are stipulated for the compliance and proper
                    guidance.
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowProtocolModal(true)}
                      className="text-primary-700 font-medium hover:underline"
                    >
                      View protocols
                    </button>
                  </div>
                </div>

                {/* Protocol agreement */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    id="protocols"
                    type="checkbox"
                    className="mt-1 h-5 w-5 text-primary-600 border-gray-300 rounded"
                    checked={agreedToProtocols}
                    onChange={(e) => setAgreedToProtocols(e.target.checked)}
                    required
                  />
                  <label htmlFor="protocols" className="text-sm text-gray-700">
                    I agree to the Casa Hacienda de Tejeros protocols.
                  </label>
                </div>

                {selectedPackage && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Option:</span>
                        <span>{selectedPackage.name}</span>
                      </div>
                        <div className="flex justify-between">
                          <span>Date & Time:</span>
                          <span>{bookingData.date || '-'} {bookingData.time ? `• ${bookingData.time}` : ''}</span>
                        </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span>{selectedPackage.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Number of guests:</span>
                        <span>{bookingData.guests}</span>
                      </div>
                      <div className="border-t pt-2 font-medium">
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span>{selectedPackage.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                                 {showVerificationMessage ? (
                   <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                     <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                     <h3 className="text-lg font-semibold text-green-800 mb-2">Booking Confirmed!</h3>
                     <p className="text-green-700 mb-4">
                       Your booking has been submitted successfully! We've sent a confirmation email with details to <strong>{bookingData.email}</strong>.
                     </p>
                     <p className="text-sm text-green-600">
                       If you don't see the email, check your spam folder.
                     </p>
                   </div>
                 ) : (
                  <button
                    type="submit"
                    disabled={!selectedPackage || isSubmitting}
                    className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Book Now'}
                  </button>
                )}
              </form>
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Need help?</span> Contact us at
                  {' '}<a href="tel:+63468869707" className="text-primary-600 hover:underline">(046) 886 9707</a>
                  {' '}or{' '}
                  <a href="mailto:tourismoffice886@gmail.com" className="text-primary-600 hover:underline">tourismoffice886@gmail.com</a>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Protocols Modal */}
      {showProtocolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProtocolModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6">
            <div className="relative mb-4">
              <h3 className="text-xl font-bold text-gray-900 text-center w-full">Casa Hacienda de Tejeros Protocol</h3>
              <button
                type="button"
                onClick={() => setShowProtocolModal(false)}
                className="absolute right-0 top-0 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto">
              <ol className="list-decimal pl-5 space-y-2 mt-4">
                <li>
                  Casa Hacienda is open on Mondays to Fridays at 8 AM - 5 PM. But, can be opened on
                  Saturdays/Sundays/Holidays as per request.
                </li>
                <li>
                  Proper Attire e.g School/Office Uniform, Casual should be observed.
                  <br />
                  No wearing of shorts, sleeveless, sandals, sportswear, slippers are allowed for the visit.
                </li>
                <li>Observe cleanliness and orderliness at all times; No Littering; No Loitering, too.</li>
                <li>Observe proper decorum during the visit.</li>
                <li>There are toilets available; Male/Female; Please use it properly.</li>
                <li>You're not allowed to enter the "TUNNEL" nor touch any items on display.</li>
                <li>
                  Since, CASA HACIENDA is under the on-going renovations, going to the 2nd floor, 3rd floor, Roof top
                  and basement is strictly prohibited.
                </li>
                <li>You can use the vicinity in front of it for Parking purposes.</li>
                <li>
                  Likewise, the Back part of the place where Canas River is located is ALSO prohibited for security
                  reason.
                </li>
                <li>
                  The Information Desk serves as the Inquiries site and Brochure Display Area. Also, the Municipal
                  Publication "Ang Dagat at Panulat-Mayor's Ricaf Corner is there.
                </li>
                <li>
                  The Municipal Tourism Office is located at the Ground Floor where Mr. Ruben R. Quinto, Municipal
                  Tourism Officer performs his tasks and other matters. This is where you will be entertained for
                  reservation and other queries.
                </li>
                <li>
                  For Reservations: Please submit the following
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Letter of Permission(encoded) (two copies) address to Mr. Ruben R. Quinto</li>
                    <li>Authorization from the School Officials et.al.</li>
                    <li>Inform/Set the schedule intended to visit</li>
                  </ul>
                  <p className="mt-2">
                    II. Or Through: email <span className="underline">tourismoffice886@gmail.com</span>, text message/or
                    call at (046) 886 9707
                  </p>
                </li>
                <li>No excuses on nearby towns/proximity regarding the protocol on Reservation.</li>
                <li>
                  Other visitors such as Foreigners, Walk-in coming from Manila or near far places are allowed on the
                  unexpected schedule of visitations for humanitarian reasons
                </li>
                <li>
                  CASA HACIENDA DE TEJEROS is no longer use as venue for parties, practices and unpermitted assemblies.
                  ONLY: Municipal Meetings, Organizations, Schools and others related to History, Heritage, respective
                  function per se. STILL, submit a Letter of Permission for its use/Follow the Protocol.
                </li>
                <li>
                  The façade of the Casa Hacienda de Tejeros (within the vicinity) has benches; also serves as an open
                  park, open to public consumption, but still, please follow the protocol: seek permission inside.
                  Municipal Tourism Office. NOT AVAILABLE FOR PARKING (privately), PLEASE...
                </li>
                <li>
                  CASA HACIENDA DE TEJEROS is closely supervised under the LGU-Rosario, Office of the Mayor and
                  Municipal Tourism Office.
                </li>
              </ol>

              <p className="mt-4">We hope you find the aforementioned items in order.</p>
              <p>Thank You.</p>
              <div className="text-center">
                <p className="font-semibold m-0 leading-tight">RUBEN R. QUINTO</p>
                <p className="m-0 leading-tight">Municipal Tourism Officer</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={() => setShowProtocolModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking; 