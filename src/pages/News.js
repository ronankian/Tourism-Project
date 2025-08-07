import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const News = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth experience
    const timer = setTimeout(() => {
      setLoading(false);
      }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const refreshNews = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };



    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#5d9c59] to-[#4a7c47] text-white py-20">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center mb-4">
            <Facebook className="w-8 h-8 mr-3" />
            <h1 className="text-5xl font-bold">Latest News</h1>
          </div>
          <p className="text-xl max-w-2xl mx-auto">
            Stay updated with the latest news, events, and announcements from Casa Hacienda de Tejeros Tourism Office
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5d9c59] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading latest news...</p>
          </div>
        )}

        {/* Embedded Facebook Post */}
        {!loading && (
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest from Casa Hacienda de Tejeros</h3>
                <div className="flex justify-center">
                  <iframe 
                    src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid02xJ1y8WE7aa58cDRD5gjWa4P66TezAhXDNoa3dMHbBjyDpnQgozBBjtfbKg4BN8VRl%26id%3D61575235395467&show_text=true&width=500" 
                    width="500" 
                    height="533" 
                    style={{border: 'none', overflow: 'hidden'}} 
                    scrolling="no" 
                    frameBorder="0" 
                    allowFullScreen={true} 
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-12">
          <button
            onClick={refreshNews}
            disabled={loading}
            className="inline-flex items-center bg-[#5d9c59] hover:bg-[#4a7c47] text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh News'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default News;
