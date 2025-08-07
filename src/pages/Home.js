import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'url(/images/casa-full.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to
            <span className="block text-yellow-300">Casa Hacienda de Tejeros</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover the beauty, culture, and heritage of this historic site in Rosario, Cavite. 
            Experience authentic Filipino hospitality and create unforgettable memories.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/destinations" className="bg-white text-[#5d9c59] hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Explore Destinations
            </Link>
            <Link to="/booking" className="border-2 border-white text-white hover:bg-white hover:text-[#5d9c59] font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Casa Hacienda de Tejeros
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the rich culture and beautiful destinations of Rosario, Cavite
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#5d9c59] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <img src="/images/rtc.png" alt="Casa Hacienda de Tejeros" className="w-8 h-8 object-contain" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Historical Sites</h3>
              <p className="text-gray-600">
                Explore our rich history through beautiful churches and landmarks
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#5d9c59] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏖️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Natural Beauty</h3>
              <p className="text-gray-600">
                Discover pristine beaches and scenic landscapes
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#5d9c59] bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Local Cuisine</h3>
              <p className="text-gray-600">
                Taste authentic Filipino dishes and local specialties
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Explore Rosario?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book your tour today and experience the beauty and culture of Rosario, Cavite
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="bg-[#5d9c59] text-white hover:bg-[#4a7c47] font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Book Now
            </Link>
            <Link to="/contact" className="border-2 border-[#5d9c59] text-[#5d9c59] hover:bg-[#5d9c59] hover:text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 