import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Users, Calendar, ArrowLeft } from 'lucide-react';

const DestinationDetail = () => {
  const { id } = useParams();

  // Mock destination data - in real app, this would come from API
  const destination = {
    id: id,
    name: 'Rosario Church',
    description: 'The historic Rosario Church is a beautiful example of Spanish colonial architecture. Built in the 18th century, this church stands as a testament to the rich religious and cultural heritage of Rosario, Cavite. The church features stunning stained glass windows, intricate wood carvings, and a peaceful atmosphere that invites visitors to reflect and appreciate the historical significance of this sacred place.',
    longDescription: `The Rosario Church, officially known as the Parish Church of Our Lady of the Most Holy Rosary, is one of the most significant historical landmarks in Rosario, Cavite. Constructed during the Spanish colonial period, this magnificent church showcases the architectural brilliance of that era.

The church's facade features a combination of Baroque and Neoclassical styles, with its distinctive bell tower and ornate decorations. Inside, visitors are greeted by a spacious nave with high ceilings, beautiful altars, and religious artifacts that have been carefully preserved over the centuries.

The church is not only a place of worship but also serves as a cultural center, hosting various religious and community events throughout the year. Visitors can attend mass, participate in religious ceremonies, or simply take a moment to appreciate the peaceful ambiance and historical significance of this sacred space.`,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
    ],
    rating: 4.8,
    reviews: 124,
    price: 'Free',
    category: 'Historical',
    duration: '1-2 hours',
    capacity: 'Unlimited',
    location: 'Town Center',
    bestTime: 'Morning or Afternoon',
    difficulty: 'Easy',
    highlights: [
      'Historic Spanish colonial architecture',
      'Beautiful stained glass windows',
      'Peaceful and spiritual atmosphere',
      'Rich cultural heritage',
      'Perfect for photography',
      'Accessible for all ages'
    ],
    tips: [
      'Visit during mass times to experience the spiritual atmosphere',
      'Dress modestly as it is a place of worship',
      'Photography is allowed but be respectful',
      'Best visited in the morning for better lighting',
      'Combine with other nearby historical sites'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <Link 
            to="/destinations" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Destinations
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-96">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="container-custom text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                {destination.category}
              </span>
              <h1 className="text-5xl font-bold mb-4">{destination.name}</h1>
              <p className="text-xl max-w-2xl">{destination.description}</p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About {destination.name}</h2>
              <div className="prose max-w-none text-gray-600">
                {destination.longDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </motion.div>

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {destination.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${destination.name} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-lg p-8 shadow-sm"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Visitor Tips</h2>
              <div className="space-y-4">
                {destination.tips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-600 text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-medium">{destination.rating}</span>
                    <span className="text-gray-500">({destination.reviews})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-green-600">{destination.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{destination.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">{destination.capacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Best Time</span>
                  <span className="font-medium">{destination.bestTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Difficulty</span>
                  <span className="font-medium">{destination.difficulty}</span>
                </div>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">{destination.location}</p>
                  <p className="text-gray-600">Rosario, Cavite, Philippines</p>
                </div>
              </div>
            </motion.div>

            {/* Book Now */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-primary rounded-lg p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-4">Ready to Visit?</h3>
              <p className="mb-6">Book your tour to {destination.name} and experience the beauty of Rosario, Cavite.</p>
              <Link to="/booking" className="btn-secondary w-full text-center">
                Book Now
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail; 