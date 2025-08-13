import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
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

      {/* History Section */}
      <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Casa Hacienda de Tejeros
            </h1>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-8"></div>
            <h2 className="text-3xl md:text-4xl font-semibold text-amber-700 mb-8">
              The History
            </h2>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Historical Text */}
            <div className="space-y-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-justify">
                  Casa Hacienda de Tejeros was originally built in the 17th century. The hacienda and its surrounding lands were formerly owned by the Augustinian Recollects. The estate was once the largest and grandest estate in the country. It once covered as much as 1,125 hectares with the casa occupying 4 hectares of it.
                </p>
                
                <p className="text-gray-700 leading-relaxed text-justify">
                  Casa Hacienda de Tejeros played an important role in 1897 when it hosted the assembly where the new leaders of the revolution were elected. These officials were President Emilio Aguinaldo, Vice President Mariano Trias, Captain General Artemio Ricarte, Director of War Emiliano Riego de Dios, and Director of Interior Andres Bonifacio.
                </p>
                
                <p className="text-gray-700 leading-relaxed text-justify">
                  Casa Hacienda de Tejeros was actively used during the Spanish colonial period. After the death of Dr. José P. Rizal, Josephine Bracken went to the Casa with some of Rizal's siblings. At the time, his family were in hiding because Rizal's name was under close watch by Spanish authorities. To avoid being recognized, Josephine even hid her identity by wearing a wig. Despite the risks, she helped care for the sick, continuing the spirit of service that she and Rizal once shared.
                </p>
                
                <p className="text-gray-700 leading-relaxed text-justify">
                  Due to the years of turmoil in the Philippines, the original Casa Hacienda no longer stands. In its memory, a new structure has been built by the Philippine army to honor its heritage.
                </p>
              </div>
              
              {/* Call to Action */}
              <div className="bg-amber-100 p-8 rounded-lg shadow-lg mt-8">
                <h3 className="text-2xl font-bold text-amber-800 mb-4">Experience This Historic Legacy</h3>
                <p className="text-amber-700 mb-6">
                  Step into history and discover the rich heritage of Casa Hacienda de Tejeros. Walk through the grounds where Philippine history was shaped and experience the stories that define our nation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/booking" 
                    className="bg-amber-600 text-white hover:bg-amber-700 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-center"
                  >
                    Book Your Visit
                  </Link>
                  <Link 
                    to="/destinations" 
                    className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src="/images/history/527746754_747256348042668_2417010083221788968_n.png" 
                    alt="Casa Hacienda de Tejeros Historical View" 
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white text-sm font-medium">Historical Heritage Site</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src="/images/history/530345508_1295530995247593_3724429399101017216_n.png" 
                    alt="Casa Hacienda de Tejeros Architecture" 
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white text-sm font-medium">Reconstructed Memorial</p>
                  </div>
                </div>
                
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <img 
                    src="/images/history/rtyu.png" 
                    alt="Casa Hacienda de Tejeros Grounds" 
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <p className="text-white text-sm font-medium">Historic Grounds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 