import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, Clock, Users } from 'lucide-react';

const Destinations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const destinations = [
    {
      id: 1,
      name: 'Rosario Church',
      description: 'Historic church with beautiful architecture and rich cultural heritage dating back to the Spanish colonial period.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      rating: 4.8,
      reviews: 124,
      price: 'Free',
      category: 'Historical',
      duration: '1-2 hours',
      capacity: 'Unlimited',
      location: 'Town Center'
    },
    {
      id: 2,
      name: 'Rosario Beach',
      description: 'Pristine beach with crystal clear waters and white sand, perfect for swimming and relaxation.',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
      rating: 4.9,
      reviews: 89,
      price: '₱50',
      category: 'Nature',
      duration: '3-4 hours',
      capacity: '100 people',
      location: 'Coastal Area'
    },
    {
      id: 3,
      name: 'Rosario Market',
      description: 'Local market offering fresh produce and authentic Filipino cuisine from local vendors.',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      rating: 4.6,
      reviews: 67,
      price: '₱100',
      category: 'Cultural',
      duration: '2-3 hours',
      capacity: '50 people',
      location: 'Market District'
    },
    {
      id: 4,
      name: 'Rosario Park',
      description: 'Beautiful public park with walking trails, playground, and picnic areas for families.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      rating: 4.7,
      reviews: 156,
      price: 'Free',
      category: 'Nature',
      duration: '2-3 hours',
      capacity: '200 people',
      location: 'Town Center'
    },
    {
      id: 5,
      name: 'Rosario Museum',
      description: 'Local museum showcasing the history, culture, and artifacts of Rosario and Cavite.',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop',
      rating: 4.5,
      reviews: 43,
      price: '₱75',
      category: 'Historical',
      duration: '1-2 hours',
      capacity: '30 people',
      location: 'Cultural District'
    },
    {
      id: 6,
      name: 'Rosario Farm Tour',
      description: 'Educational farm tour where visitors can learn about local agriculture and farming practices.',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
      rating: 4.4,
      reviews: 78,
      price: '₱200',
      category: 'Cultural',
      duration: '3-4 hours',
      capacity: '25 people',
      location: 'Agricultural Area'
    }
  ];

  const categories = ['All', 'Historical', 'Nature', 'Cultural'];

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || destination.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-5xl font-bold mb-6">Explore Destinations</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Discover the amazing tourist spots and attractions in Rosario, Cavite
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {filteredDestinations.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No destinations found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDestinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {destination.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                        {destination.price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {destination.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{destination.rating}</span>
                        <span className="text-gray-500">({destination.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{destination.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{destination.capacity}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{destination.location}</span>
                    </div>
                    
                    <Link
                      to={`/destinations/${destination.id}`}
                      className="btn-primary w-full text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Destinations; 