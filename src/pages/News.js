import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, RefreshCw, Newspaper, Calendar, Clock } from 'lucide-react';

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
      {/* Enhanced News Header */}
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
          <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">News & Updates</h1>
          <p className="text-xl max-w-3xl mx-auto drop-shadow-lg">
            Stay updated with the latest news, events, and announcements from Casa Hacienda de Tejeros
          </p>
        </div>
      </section>

      {/* News Feed Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading latest news...</p>
            </div>
          )}

          {/* Facebook Posts */}
          {!loading && (
            <div className="max-w-6xl mx-auto">
              {/* Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 justify-items-center">
                <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0thsHtZMk6NpqwPzUJhhUSq1RCmLMEEqRRUzhSPSvjTSvCXvk9sx5pR4kAtqBCF66l%26id%3D61575235395467&show_text=true&width=500" width="500" height="533" style={{border:'none',overflow:'hidden'}} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>

                <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid02pnGneybFwReEjPsTKKR81kvoJ9sJXXpJmjH6UktfoHgFLQBErkNhbPRcGUhgk9ecl%26id%3D61575235395467&show_text=true&width=500" width="500" height="533" style={{border:'none',overflow:'hidden'}} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 justify-items-center">
                <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0aoPWoPapE2J9FnDa82FVe1KpiZE8odTSYatxGXve9z6PYdxugMcfaC5yXzks981al%26id%3D61575235395467&show_text=true&width=500" width="500" height="645" style={{border:'none',overflow:'hidden'}} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>

                <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0Y3HbcH9DEdV1JySCknVh6VqiU6ZE2B47owB35T9oEs4wXrAiEeQECz2JEC9cnaxVl%26id%3D61575235395467&show_text=true&width=500" width="500" height="645" style={{border:'none',overflow:'hidden'}} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 justify-items-center">
                <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0cfj2YSHFAk2gudLdCtRsjcutsoKk1vJPEwVBPsR9WeeQmLJJPV6GrK4TcTYC6jZHl%26id%3D61575235395467&show_text=true&width=500" width="500" height="533" style={{border:'none',overflow:'hidden'}} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>

                <iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3Dpfbid0BC7VCLiYLAZa1JwjydpJoMgSPUPwPWBX5msz62yLweVoyXr7jP3vF9ZkjjsT9zMKl%26id%3D61575235395467&show_text=true&width=500" width="500" height="767" style={{border:'none',overflow:'hidden'}} scrolling="no" frameBorder="0" allowFullScreen={true} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Refresh Section */}
      <section className="py-12 bg-white">
        <div className="container-custom text-center">
          <div className="rounded-lg p-8 shadow-md max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Click refresh to load the latest posts and updates from our Facebook page.
            </p>
            <button
              onClick={refreshNews}
              disabled={loading}
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh News'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
