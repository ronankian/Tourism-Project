import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';


const About = () => {

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

      {/* Mission & Vision */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-green-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                Our Mission & Vision
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Promoting sustainable tourism while preserving our cultural heritage for generations to come
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
                </div>
                
                <div className="text-gray-700 space-y-5">
                  <p className="text-lg font-semibold text-green-700 border-l-4 border-green-500 pl-4">
                    The Municipal Tourism Office aims to:
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">i</span>
                      <p className="text-gray-800 leading-relaxed">Preserve its historical integrity through authentic cultural counters and informative programs for future generations;</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">ii</span>
                      <p className="text-gray-800 leading-relaxed">Promote Heritage Tourism by designing, engaging, and informative experiences for Tourists and Students;</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">iii</span>
                      <p className="text-gray-800 leading-relaxed">Strengthen community participation in managing and promoting the site as a cultural destination;</p>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">iv</span>
                      <p className="text-gray-800 leading-relaxed">Inspire the patriotism of the Filipinos and support the role of shaping the Philippine history and democracy.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-100 h-full">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Our Vision</h3>
                </div>
                
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-200 text-center">
                  <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-medium">
                    The Municipal Tourism Office envisions becoming a <span className="font-bold text-amber-700">premier heritage destination</span> and a proud community that celebrates its rich traditions through vibrant event such as the <span className="font-bold text-orange-700">Tinapa Festival</span>; by fostering a deeper understanding and appreciation of the historical significance and relevance of <span className="font-bold text-green-700">Casa Hacienda de Tejeros</span>, and preserving the past while shaping a vibrant future.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Municipal Tourism Authority */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                Municipal Tourism Authority
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                The official leadership committed to promoting and preserving the heritage of Rosario, Cavite
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="mb-6">
                <img
                  src="/images/leaders/mayor.png"
                  alt="Mayor Jose Voltaire V. Ricafrente"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-100 shadow-md"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Jose Voltaire V. Ricafrente</h3>
              <p className="text-green-600 font-semibold mb-3 text-lg">Mayor</p>
              <p className="text-gray-600 leading-relaxed">
                Leading the municipality's vision for sustainable heritage tourism and cultural preservation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="mb-6">
                <img
                  src="/images/leaders/vice-mayor.png"
                  alt="Vice Mayor Joanne Michelle B. Gonzales"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-100 shadow-md"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Joanne Michelle B. Gonzales</h3>
              <p className="text-green-600 font-semibold mb-3 text-lg">Vice Mayor</p>
              <p className="text-gray-600 leading-relaxed">
                Supporting tourism initiatives and community engagement for Rosario's cultural development.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="mb-6">
                <img
                  src="/images/leaders/tourism-officer.png"
                  alt="Municipal Tourism Officer Ruben R. Quinto"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-green-100 shadow-md"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ruben R. Quinto</h3>
              <p className="text-green-600 font-semibold mb-3 text-lg">Municipal Tourism Officer</p>
              <p className="text-gray-600 leading-relaxed">
                Managing daily tourism operations and ensuring exceptional visitor experiences at Casa Hacienda de Tejeros.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Casa Hacienda de Tejeros Protocol */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                Casa Hacienda de Tejeros Protocol
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Guidelines and protocols for visiting this historic and culturally significant heritage site
              </p>
            </motion.div>
          </div>
          

          {/* Full Protocol List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="space-y-6 text-gray-700">
                <ol className="list-decimal pl-6 space-y-4 text-sm leading-relaxed">
                  <li>
                    Casa Hacienda is open on Mondays to Fridays at 8 AM - 5 PM. But, can be opened on 
                    Saturdays/Sundays/Holidays as per request.
                  </li>
                  <li>
                    Proper Attire e.g School/Office Uniform, Casual should be observed.
                    <br />
                    <strong>No wearing of shorts, sleeveless, sandals, sportswear, slippers are allowed for the visit.</strong>
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
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Letter of Permission (encoded) (two copies) address to Mr. Ruben R. Quinto</li>
                      <li>Authorization from the School Officials et.al.</li>
                      <li>Inform/Set the schedule intended to visit</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Or Through:</strong> email <span className="text-primary-600 font-medium">tourismoffice886@gmail.com</span>, text message/or 
                      call at <span className="text-primary-600 font-medium">(046) 886 9707</span>
                    </p>
                  </li>
                  <li>No excuses on nearby towns/proximity regarding the protocol on Reservation.</li>
                  <li>
                    Other visitors such as Foreigners, Walk-in coming from Manila or near far places are allowed on the 
                    unexpected schedule of visitations for humanitarian reasons
                  </li>
                  <li>
                    CASA HACIENDA DE TEJEROS is no longer use as venue for parties, practices and unpermitted assemblies. 
                    <strong>ONLY:</strong> Municipal Meetings, Organizations, Schools and others related to History, Heritage, respective 
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

                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-base font-medium text-gray-800 mb-2">We hope you find the aforementioned items in order.</p>
                  <p className="text-base text-gray-700 mb-4">Thank You.</p>
                  <div className="bg-gray-50 rounded-lg p-4 inline-block">
                    <p className="font-bold text-gray-900 text-lg m-0 leading-tight">RUBEN R. QUINTO</p>
                    <p className="text-gray-700 m-0 leading-tight">Municipal Tourism Officer</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Protocol Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Our Commitment to Excellence</h3>
              <p className="text-lg leading-relaxed mb-6">
                These protocols ensure that Casa Hacienda de Tejeros remains a well-preserved, respectful, and educational destination for all visitors. By following these guidelines, you help us maintain the historical integrity and cultural significance of this important heritage site.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booking" className="bg-white text-green-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                  Book Your Visit
                </Link>
                <Link to="/contact" className="border-2 border-white text-white hover:bg-white hover:text-green-600 font-medium py-3 px-6 rounded-lg transition-colors duration-200">
                  Ask Questions
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Policy Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                Privacy & Data Protection
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Your privacy and data security are our top priorities
              </p>
            </motion.div>
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
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                Development Credits
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Proudly developed by OJT trainees of Cavite State University - CCAT Campus
              </p>
            </motion.div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg p-8 shadow-sm text-center"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">OJT Development Team</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Created during our Computer Engineering OJT program to support 
                  tourism promotion in the Municipality of Rosario, Cavite.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Technology: React.js • Firebase • Tailwind CSS</p>
                  <p>Training Period: July-August 2025</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <p className="text-primary-700 font-medium">
                  Thank you to the Municipal Tourism Office of Rosario, Cavite 
                  for this meaningful learning opportunity.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding text-white" style={{ background: 'linear-gradient(135deg, rgba(93, 156, 89, 0.8) 25%, rgba(223, 46, 56, 0.8) 100%)' }}>
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