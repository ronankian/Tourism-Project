import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, MapPin, Check, Mail } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import toast from 'react-hot-toast';

const Booking = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    guests: 1,
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const packages = [
    {
      id: 1,
      name: 'Historical Tour',
      description: 'Explore the rich history of Rosario through its churches and landmarks',
      price: '₱500',
      duration: '3 hours',
      maxGuests: 10,
      includes: ['Professional guide', 'Transportation', 'Entrance fees', 'Refreshments'],
      destinations: ['Rosario Church', 'Historical landmarks', 'Local museum']
    },
    {
      id: 2,
      name: 'Nature Adventure',
      description: 'Discover the natural beauty of Rosario with beach and park visits',
      price: '₱800',
      duration: '4 hours',
      maxGuests: 8,
      includes: ['Professional guide', 'Transportation', 'Beach equipment', 'Lunch'],
      destinations: ['Rosario Beach', 'Rosario Park', 'Scenic viewpoints']
    },
    {
      id: 3,
      name: 'Cultural Experience',
      description: 'Immerse yourself in local culture and traditions',
      price: '₱600',
      duration: '3.5 hours',
      maxGuests: 12,
      includes: ['Local guide', 'Cultural activities', 'Traditional snacks', 'Souvenirs'],
      destinations: ['Local market', 'Cultural center', 'Traditional workshops']
    }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPackage) {
      toast.error('Please select a tour package');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const bookingDataToSubmit = {
        ...bookingData,
        packageName: selectedPackage.name,
        packagePrice: selectedPackage.price,
        packageDuration: selectedPackage.duration,
        totalPrice: selectedPackage.price // You can calculate this based on guests
      };

      const result = await bookingService.createBooking(bookingDataToSubmit);
      
      if (result.success) {
        setShowVerificationMessage(true);
        toast.success('Booking submitted successfully! Please check your email for verification.');
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
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Packages</h2>
            
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
                    <div className="text-sm text-gray-500">per person</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>Max {pkg.maxGuests} guests</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Destinations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {pkg.destinations.map((dest, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
                  <ul className="space-y-1">
                    {pkg.includes.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
                  <h3 className="font-bold text-gray-900 mb-2">Selected Package:</h3>
                  <p className="text-primary-600 font-medium">{selectedPackage.name}</p>
                  <p className="text-sm text-gray-600">{selectedPackage.price} per person</p>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800">Please select a tour package to continue</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <select
                    id="guests"
                    required
                    value={bookingData.guests}
                    onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {[...Array(selectedPackage?.maxGuests || 10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={bookingData.name}
                    onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
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
                    onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
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
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

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

                {selectedPackage && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Package:</span>
                        <span>{selectedPackage.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price per person:</span>
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
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Check Your Email</h3>
                    <p className="text-green-700 mb-4">
                      We've sent a verification email to <strong>{bookingData.email}</strong>. 
                      Please click the verification link to confirm your booking.
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
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking; 