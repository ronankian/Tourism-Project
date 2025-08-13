import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Calendar, Award } from 'lucide-react';

const About = () => {
  const stats = [
    { number: '50+', label: 'Years of History', icon: Calendar },
    { number: '100K+', label: 'Happy Visitors', icon: Users },
    { number: '20+', label: 'Tourist Spots', icon: MapPin },
    { number: '95%', label: 'Satisfaction Rate', icon: Award }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/casa-full.webp)' }}
        ></div>
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgba(93, 156, 89, 0.8) 25%, rgba(223, 46, 56, 0.8) 100%)'
          }}
        ></div>
        <div className="relative z-10 container-custom text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold mb-6 drop-shadow-lg"
          >
            About Casa Hacienda de Tejeros
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto drop-shadow-lg"
          >
            Discover the rich history, vibrant culture, and natural beauty of this historic hacienda in Rosario, Cavite
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">The History of Casa Hacienda de Tejeros</h2>
              <p className="text-lg text-gray-600 mb-6">
                Casa Hacienda de Tejeros was originally built in the 17th century and was formerly owned by the Augustinian Recollects. 
                The estate was once the largest and grandest estate in the country, covering as much as 1,125 hectares with the casa occupying 4 hectares.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                This historic site played a crucial role in 1897 when it hosted the assembly where the new leaders of the Philippine revolution were elected, 
                including President Emilio Aguinaldo, Vice President Mariano Trias, Captain General Artemio Ricarte, Director of War Emiliano Riego de Dios, 
                and Director of Interior Andres Bonifacio.
              </p>
              <p className="text-lg text-gray-600">
                After Dr. José P. Rizal's death, Josephine Bracken and some of Rizal's siblings took refuge at the Casa. 
                Though the original structure no longer stands due to years of turmoil, a new structure has been built by the Philippine army to honor its heritage.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="/images/history/527746754_747256348042668_2417010083221788968_n.png"
                alt="Casa Hacienda de Tejeros"
                className="rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Mission & Vision</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Promoting sustainable tourism while preserving our cultural heritage
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-primary-50 rounded-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To promote Casa Hacienda de Tejeros as a premier heritage destination by showcasing our rich cultural heritage, 
                historical significance, and warm Filipino hospitality while ensuring sustainable development 
                and community involvement.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-secondary-50 rounded-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become the leading heritage tourism destination in Cavite, known for authentic historical experiences, 
                cultural significance, and exceptional visitor satisfaction, while preserving our heritage 
                for future generations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Tourism Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dedicated professionals committed to providing the best tourism experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Maria Santos',
                role: 'Tourism Officer',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
                description: 'Leading our tourism initiatives with over 10 years of experience.'
              },
              {
                name: 'Juan Dela Cruz',
                role: 'Local Guide',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
                description: 'Expert guide with deep knowledge of Rosario\'s history and culture.'
              },
              {
                name: 'Ana Reyes',
                role: 'Community Coordinator',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
                description: 'Connecting visitors with authentic local experiences and communities.'
              }
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 text-center shadow-sm"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Privacy & Data Protection</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your privacy and data security are our top priorities
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-lg p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Data Collection & Usage</h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  We collect only the necessary information required to process your booking requests and provide tourism services. 
                  This includes your name, email, phone number, and booking preferences.
                </p>
                <p>
                  Your personal information is used solely for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Processing tour bookings and reservations</li>
                  <li>Sending booking confirmations and important updates</li>
                  <li>Providing customer support and assistance</li>
                  <li>Improving our tourism services</li>
                </ul>
                <p>
                  We do not share your personal information with third parties without your explicit consent, 
                  except as required by law or for essential service operations.
                </p>
                <div className="mt-6">
                  <Link 
                    to="/privacy-policy" 
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Read our full Privacy Policy →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Credits Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Website Development Credits</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              This website was developed as an On-the-Job Training (OJT) project
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-8 shadow-sm text-center"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Developed by OJT Trainees</h3>
                <p className="text-lg text-gray-600 mb-6">
                  This tourism website for Casa Hacienda de Tejeros was developed as part of our 
                  On-the-Job Training program. We are proud to contribute to promoting the rich 
                  heritage and tourism potential of Rosario, Cavite.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Development Team</h4>
                <p className="text-gray-600 mb-4">
                  OJT Trainees - Computer Engineering Program
                </p>
                <div className="text-sm text-gray-500">
                  <p>Project Duration: July-August 2025 (OJT Training Period)</p>
                  <p>Technology Stack: React.js, Firebase, Tailwind CSS</p>
                  <p>Submitted as completion requirement for OJT Training</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <p className="text-primary-700 font-medium">
                  Special thanks to the Municipal Tourism Office of Rosario, Cavite 
                  for providing the opportunity to create this project and contribute 
                  to the promotion of local tourism.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding bg-gradient-primary text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Explore Casa Hacienda de Tejeros?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact our team to plan your perfect visit to Casa Hacienda de Tejeros in Rosario, Cavite
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Contact Us
            </Link>
            <Link to="/booking" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg">
              Book a Tour
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 