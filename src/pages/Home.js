import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { advisoryService } from '../services/advisoryService';
import WebFont from 'webfontloader';
import TextTicker from '../components/TextTicker';

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [advisories, setAdvisories] = useState([]);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const heroImages = [
    '/images/hero/casa-full.webp',
    '/images/hero/convention.webp',
    '/images/hero/aguinaldo.webp',
    '/images/hero/last.webp',
    '/images/hero/sculpture.webp',
    '/images/hero/rtyu.webp',
    '/images/hero/heritage-memorial.webp',
    '/images/hero/revolution-assembly.webp'
  ];

  useEffect(() => {
    // Load web fonts before starting animations
    WebFont.load({
      google: {
        families: ['Inter', 'Poppins', 'Anton']
      },
      active: () => {
        setFontsLoaded(true);
        setIsVisible(true);
      },
      inactive: () => {
        // Fallback if fonts fail to load
        setFontsLoaded(true);
        setIsVisible(true);
      }
    });

    // Scroll to hero section on page load
    const scrollToHero = () => {
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        heroSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(scrollToHero, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [fontsLoaded, heroImages.length]);



  useEffect(() => {
    loadAdvisories();
    
    // Preload hero images to prevent stuttering during transitions
    heroImages.forEach((imageSrc) => {
      const img = new Image();
      img.src = imageSrc;
    });

    // Check if device is mobile for performance optimization
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadAdvisories = async () => {
    try {
      const activeAdvisories = await advisoryService.getActiveAdvisories();
      setAdvisories(activeAdvisories);
    } catch (error) {
      console.error('Error loading advisories:', error);
    }
  };

  const nextFeature = () => {
    setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeatureIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  // Touch/swipe functions for mobile
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextFeature();
    }
    if (isRightSwipe) {
      prevFeature();
    }
  };

  const quickFacts = [
    { number: '17th', text: 'Century Originally Built', icon: '🏛️' },
    { number: '1,125', text: 'Hectares Original Estate', icon: '🌾' },
    { number: '1897', text: 'Revolutionary Assembly', icon: '⚔️' },
    { number: '4', text: 'Hectares Casa Grounds', icon: '🏰' }
  ];

  const features = [
    {
      title: 'Historical Significance',
      description: 'Where Philippine revolutionaries elected their leaders',
      image: '/images/hero/convention.jpg',
      color: 'from-amber-500 to-orange-500'
    },
    {
      title: 'Heritage Remnants',
      description: 'Discover adobe foundations, aged walls, and original stone steps that echo the past.',
      image: '/images/hero/last.jpg',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Historical Atmosphere',
      description: 'Reflect upon the place where the Tejeros Convention took place, marked, commemorated, and despite modern additions, still charged with historical energy.',
      image: '/images/hero/sculpture.jpg',
      color: 'from-red-500 to-pink-500'
    },
    {
      title: 'Photogenic Backdrop',
      description: 'Frame the interplay of old and new, from archival ruins to modern architecture, in a visually compelling setting.',
      image: '/images/hero/heritage-memorial.png',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Events/Advisories Section */}
      <section className="relative overflow-hidden" style={{ height: '100px', backgroundColor: '#5d9c59' }}>
        {fontsLoaded && (
          <div style={{ 
            height: '100px', 
            display: 'flex', 
            alignItems: 'center',
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}>
            <TextTicker 
              speed={isMobile ? 30 : 40} 
              loop={true} 
              bounce={false}
              style={{ 
                height: '270px', 
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            >
              {/* Single set of advisories - let the library handle duplication */}
              {advisories && advisories.length > 0 ? (
                advisories.map((advisory, index) => (
                  <React.Fragment key={advisory.id}>
                    <span style={{
                      color: 'white',
                      fontSize: 'clamp(18px, 3.5vw, 32px)',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      marginRight: '40px'
                    }}>
                      {advisory.message}
                    </span>
                    {index < advisories.length - 1 && (
                      <>
                        <img 
                          src="/images/rtc.png" 
                          alt="RTC Logo" 
                          style={{
                            height: '50px',
                            width: 'auto',
                            marginRight: '10px',
                            verticalAlign: 'middle'
                          }}
                        />
                        <img 
                          src="/images/jlr.png" 
                          alt="JLR Logo" 
                          style={{
                            height: '50px',
                            width: 'auto',
                            marginRight: '10px',
                            verticalAlign: 'middle'
                          }}
                        />
                        <img 
                          src="/images/pbr.png" 
                          alt="PBR Logo" 
                          style={{
                            height: '50px',
                            width: 'auto',
                            marginRight: '40px',
                            verticalAlign: 'middle'
                          }}
                        />
                      </>
                    )}
                    {/* Add responsive spacer after the oldest (last) post */}
                    {index === advisories.length - 1 && (
                      <div style={{
                        display: 'inline-block',
                        width: '100vw',
                        minWidth: '600px',
                        marginRight: '40px'
                      }}></div>
                    )}
                  </React.Fragment>
                ))
              ) : (
                // Fallback content if no advisories
                <span style={{
                  color: 'white',
                  fontSize: 'clamp(18px, 3.5vw, 32px)',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}>
                  Welcome to Casa Hacienda de Tejeros
                </span>
              )}
            </TextTicker>
          </div>
        )}
        <div className="relative z-10 container-custom text-center h-full flex items-center justify-center">
          {/* Content can be added here later for admin editing */}
        </div>
      </section>

      {/* Dynamic Hero Section */}
      <section className="hero-section relative h-screen overflow-hidden" style={{ willChange: 'transform' }}>
        {/* Background Image Carousel */}
        {heroImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentImageIndex === index ? 1 : 0,
              scale: currentImageIndex === index ? 1 : 1.05
            }}
            transition={{ 
              duration: 1,
              ease: "easeInOut"
            }}
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
          <div className="text-center text-white max-w-3xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-6 drop-shadow-2xl tracking-wider font-barbara">
                CASA HACIENDA
              </h1>
              <h2 className="text-4xl md:text-6xl font-medium mb-8 drop-shadow-2xl text-amber-300 tracking-wide font-barbara">
                de Tejeros
              </h2>
              <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
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
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 lg:mb-12"
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
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col justify-center">
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
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 lg:mb-12"
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
            {/* Timeline Line - Hidden on mobile, visible on desktop */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-green-200 h-full"></div>
            
            <div className="space-y-8 md:space-y-12">
              {[
                {
                  year: '17th Century',
                  title: 'Original Construction',
                  description: 'Built by Augustinian Recollects as the grandest estate in the country',
                  image: '/images/history/17th.jpg'
                },
                {
                  year: '1897',
                  title: 'Revolutionary Assembly',
                  description: 'Hosted the assembly where new revolutionary leaders were elected',
                  image: '/images/history/revolution-assembly.png'
                },
                {
                  year: 'Present',
                  title: 'Heritage Memorial',
                  description: 'Reconstructed by Philippine Army to honor its historical significance',
                  image: '/images/history/heritage-memorial.png'
                }
              ].map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Mobile: Stack vertically, Desktop: Side by side */}
                  <div className="w-full md:w-1/2 px-4 md:px-8 mb-6 md:mb-0">
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                      <div className="text-xl md:text-2xl font-bold text-green-600 mb-2 md:mb-3">{event.year}</div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{event.title}</h3>
                      <p className="text-gray-700 leading-relaxed text-base md:text-lg">{event.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot - Hidden on mobile, visible on desktop */}
                  <div className="hidden md:block relative z-10">
                    <div className="w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  
                  <div className="w-full md:w-1/2 px-4 md:px-8">
                    <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-48 md:h-64 object-cover"
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
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 lg:mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Visit Casa Hacienda?
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Experience the perfect blend of history, culture, and natural beauty
            </p>
          </motion.div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:block">
              <button
                onClick={prevFeature}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Previous feature"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextFeature}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                aria-label="Next feature"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

                         {/* Carousel Content */}
             <div className="overflow-hidden">
               <motion.div
                 key={currentFeatureIndex}
                 initial={{ opacity: 0, x: 100 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -100 }}
                 transition={{ duration: 0.5 }}
                 className="max-w-4xl mx-auto"
                 onTouchStart={onTouchStart}
                 onTouchMove={onTouchMove}
                 onTouchEnd={onTouchEnd}
               >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500">
                  <div className="md:flex">
                    {/* Image Section */}
                    <div className="md:w-1/2">
                      <div className="relative h-64 md:h-full">
                        <img 
                          src={features[currentFeatureIndex].image} 
                          alt={features[currentFeatureIndex].title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                      <div className="mb-6">
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold text-white mb-4 bg-gradient-to-r ${features[currentFeatureIndex].color}`}>
                          Feature {currentFeatureIndex + 1} of {features.length}
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                          {features[currentFeatureIndex].title}
                        </h3>
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                          {features[currentFeatureIndex].description}
                        </p>
                      </div>
                      
                      {/* Mobile Swipe Indicator */}
                      <div className="md:hidden flex justify-center mt-6">
                        <div className="flex space-x-2">
                          {features.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentFeatureIndex ? 'bg-green-600 w-6' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Desktop Dots Indicator */}
            <div className="hidden md:flex justify-center mt-8 space-x-3">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeatureIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentFeatureIndex ? 'bg-green-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-amber-600 to-orange-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience History?
            </h2>
            <p className="text-xl text-amber-100 mb-12 max-w-3xl mx-auto leading-relaxed">
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
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 lg:mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Our Leaders
            </h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Dedicated officials committed to preserving and promoting our cultural heritage
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
