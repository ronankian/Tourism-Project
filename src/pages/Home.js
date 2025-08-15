import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const heroImages = [
    '/images/casa-full.webp',
    '/images/history/527746754_747256348042668_2417010083221788968_n.png',
    '/images/history/530345508_1295530995247593_3724429399101017216_n.png'
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const quickFacts = [
    { number: '17th', text: 'Century Built', icon: '🏛️' },
    { number: '1,125', text: 'Hectares Original Estate', icon: '🌾' },
    { number: '1897', text: 'Revolutionary Assembly', icon: '⚔️' },
    { number: '4', text: 'Hectares Casa Grounds', icon: '🏰' }
  ];

  const features = [
    {
      title: 'Historical Significance',
      description: 'Where Philippine revolutionaries elected their leaders',
      icon: '📜',
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Cultural Heritage',
      description: 'Preserving 17th century architecture and traditions',
      icon: '🏺',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Educational Tours',
      description: 'Interactive learning experiences for all ages',
      icon: '🎓',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Natural Beauty',
      description: 'Scenic grounds with rich historical atmosphere',
      icon: '🌿',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Events/Advisories Section */}
      <section className="relative overflow-hidden" style={{ height: '270px' }}>
        <img 
          src="/images/cavite-tourism-passport-banner.jpg" 
          alt="Cavite Tourism Passport Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 container-custom text-center h-full flex items-center justify-center">
          {/* Content can be added here later for admin editing */}
        </div>
      </section>

      {/* Dynamic Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image Carousel */}
        {heroImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentImageIndex === index ? 1 : 0,
              scale: currentImageIndex === index ? 1 : 1.1
            }}
            transition={{ duration: 1.5 }}
          >
            <img 
              src={image} 
              alt={`Casa Hacienda de Tejeros ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </motion.div>
        ))}

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <h1 className="text-7xl md:text-9xl font-bold mb-6 drop-shadow-2xl tracking-wider font-barbara">
                CASA HACIENDA
              </h1>
              <h2 className="text-5xl md:text-7xl font-medium mb-8 drop-shadow-2xl text-amber-300 tracking-wide font-barbara">
                de Tejeros
              </h2>
              <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
                Step into the pages of Philippine history where revolutionaries shaped our nation's destiny
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/booking" 
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
                  >
                    Book Your Visit Today
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/about" 
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 inline-block"
                  >
                    About Us
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-0 right-0 mx-auto w-fit text-white animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="text-center flex flex-col items-center">
            <p className="text-sm mb-2 font-semibold tracking-wider uppercase text-shadow-lg">Scroll to explore</p>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </section>

      {/* Quick Facts Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Fascinating Facts
            </h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Discover the incredible numbers and milestones that make Casa Hacienda de Tejeros truly special
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {quickFacts.map((fact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {fact.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">
                    {fact.number}
                  </div>
                  <p className="text-gray-700 font-medium">{fact.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive History Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Journey Through Time
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Follow the remarkable timeline of events that shaped Philippine history
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-green-200 h-full"></div>
            
            <div className="space-y-12">
              {[
                {
                  year: '17th Century',
                  title: 'Original Construction',
                  description: 'Built by Augustinian Recollects as the grandest estate in the country',
                  image: '/images/history/527746754_747256348042668_2417010083221788968_n.png'
                },
                {
                  year: '1897',
                  title: 'Revolutionary Assembly',
                  description: 'Hosted the assembly where new revolutionary leaders were elected',
                  image: '/images/history/530345508_1295530995247593_3724429399101017216_n.png'
                },
                {
                  year: 'Present',
                  title: 'Heritage Memorial',
                  description: 'Reconstructed by Philippine Army to honor its historical significance',
                  image: '/images/history/rtyu.png'
                }
              ].map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="w-1/2 px-8">
                    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                      <div className="text-3xl font-bold text-green-600 mb-2">{event.year}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className="w-1/2 px-8">
                    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Visit Casa Hacienda?
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Experience the perfect blend of history, culture, and natural beauty
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Experience History?
            </h2>
            <p className="text-xl md:text-2xl text-amber-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of visitors who have walked through these historic grounds and discovered the stories that shaped our nation
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/booking" 
                  className="bg-white text-amber-600 hover:bg-amber-50 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl inline-block"
                >
                  🎫 Book Your Visit Now
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/contact" 
                  className="border-2 border-white text-white hover:bg-white hover:text-amber-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 inline-block"
                >
                  📞 Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Municipal Leaders Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Leaders
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Dedicated officials committed to preserving and promoting our cultural heritage
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Jose Voltaire V. Ricafrente',
                position: 'Mayor',
                image: '/images/leaders/mayor.png',
                description: 'Leading the municipality\'s vision for sustainable heritage tourism'
              },
              {
                name: 'Joanne Michelle B. Gonzales',
                position: 'Vice Mayor',
                image: '/images/leaders/vice-mayor.png',
                description: 'Supporting tourism initiatives and community engagement'
              },
              {
                name: 'Tourism Officer',
                position: 'Municipal Tourism Office',
                image: '/images/leaders/tourism-officer.png',
                description: 'Preserving and promoting our cultural heritage'
              }
            ].map((leader, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="mb-6">
                  <img
                    src={leader.image}
                    alt={leader.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-100 shadow-md"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{leader.name}</h3>
                <p className="text-green-600 font-semibold mb-3 text-lg">{leader.position}</p>
                <p className="text-gray-600 leading-relaxed">{leader.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 