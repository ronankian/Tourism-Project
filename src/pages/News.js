import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Facebook, RefreshCw, Newspaper, Calendar, Clock, Plus, Trash2, X, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addNewsPost, removeNewsPost, getNewsPosts, testFirestoreConnection } from '../services/newsService';
import toast from 'react-hot-toast';

const News = () => {
  const [loading, setLoading] = useState(true);
  const [newsPosts, setNewsPosts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [newPost, setNewPost] = useState({
    embedUrl: '',
    title: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);
  const { isAdminAuthenticated } = useAuth();
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize Facebook SDK
    const initFacebookSDK = () => {
      // Create fb-root div if it doesn't exist
      if (!document.getElementById('fb-root')) {
        const fbRoot = document.createElement('div');
        fbRoot.id = 'fb-root';
        document.body.appendChild(fbRoot);
      }

      // Load Facebook SDK if not already loaded
      if (!window.FB) {
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    };

    const initializeNews = async () => {
      try {
        // Initialize Facebook SDK first
        initFacebookSDK();
        
        // Test connection first
        const connectionTest = await testFirestoreConnection();
        if (!connectionTest.success) {
          console.error('Firestore connection failed:', connectionTest.error);
          toast.error('Database connection failed. Using default posts.');
          setNewsPosts([]);
          setLoading(false);
          return;
        }
        
        loadNewsPosts();
      } catch (error) {
        console.error('Initialization error:', error);
        toast.error('Failed to initialize. Using default posts.');
        setNewsPosts([]);
        setLoading(false);
      }
    };

    initializeNews();
  }, []);

  const loadNewsPosts = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const postsPromise = getNewsPosts();
      const posts = await Promise.race([postsPromise, timeoutPromise]);
      
      setNewsPosts(posts);
      
      // Re-parse Facebook embeds after posts are loaded
      setTimeout(() => {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      }, 1000);
    } catch (error) {
      console.error('Error loading news posts:', error);
      if (error.message === 'Request timeout') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('Failed to load news posts');
      }
      // Set empty array to prevent further errors
      setNewsPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshNews = () => {
    loadNewsPosts();
  };

  const loadMorePosts = () => {
    setLoadingMore(true);
    // Simulate a small delay for better UX
    setTimeout(() => {
      setDisplayLimit(prev => prev + 5);
      setLoadingMore(false);
      
      // Re-parse Facebook embeds after loading more posts
      setTimeout(() => {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      }, 100);
    }, 500);
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    
    if (!newPost.embedUrl.trim()) {
      toast.error('Please enter an embed URL');
      return;
    }

    let processedUrl = newPost.embedUrl.trim();

    // Check if the user pasted an iframe code and extract the src URL
    if (processedUrl.includes('<iframe')) {
      const srcMatch = processedUrl.match(/src="([^"]+)"/);
      if (srcMatch) {
        processedUrl = srcMatch[1];
      } else {
        toast.error('Could not extract URL from iframe code. Please paste just the URL or valid iframe code.');
        return;
      }
    }

    // Convert regular Facebook URLs to embed URLs
    if (processedUrl.includes('facebook.com/') && !processedUrl.includes('plugins/post.php')) {
      // Extract the post ID from various Facebook URL formats
      let postId = '';
      let pageId = '61575235395467'; // Default page ID
      
      if (processedUrl.includes('permalink.php')) {
        const storyMatch = processedUrl.match(/story_fbid=([^&]+)/);
        const idMatch = processedUrl.match(/id=([^&]+)/);
        if (storyMatch) postId = storyMatch[1];
        if (idMatch) pageId = idMatch[1];
      } else if (processedUrl.includes('posts/')) {
        const match = processedUrl.match(/posts\/([^/?]+)/);
        if (match) postId = match[1];
      }
      
      if (postId) {
        processedUrl = `https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fpermalink.php%3Fstory_fbid%3D${postId}%26id%3D${pageId}&show_text=true&width=500&height=600`;
      } else {
        toast.error('Could not extract post ID from Facebook URL. Please use a direct post link.');
        return;
      }
    }

    // Validate that it's a Facebook URL
    if (!processedUrl.includes('facebook.com')) {
      toast.error('Please enter a valid Facebook URL or embed code');
      return;
    }

    try {
      setSubmitting(true);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const addPromise = addNewsPost(processedUrl, newPost.title, newPost.description);
      await Promise.race([addPromise, timeoutPromise]);
      
      toast.success('News post added successfully');
      setNewPost({ embedUrl: '', title: '', description: '' });
      setShowAddForm(false);
      loadNewsPosts();
    } catch (error) {
      console.error('Error adding news post:', error);
      if (error.message === 'Request timeout') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('Failed to add news post');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePost = async (postId) => {
    const post = newsPosts.find(p => p.id === postId);
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const removePromise = removeNewsPost(postToDelete.id);
      await Promise.race([removePromise, timeoutPromise]);
      
      toast.success('News post removed successfully');
      loadNewsPosts();
    } catch (error) {
      console.error('Error removing news post:', error);
      if (error.message === 'Request timeout') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('Failed to remove news post');
      }
    } finally {
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Use only custom posts from the database with pagination
  const displayPosts = newsPosts.slice(0, displayLimit);
  const hasMorePosts = newsPosts.length > displayLimit;

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
          
          {/* Admin Controls */}
          {isAdminAuthenticated && (
            <div className="mt-8 space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Post
              </button>
              
              <button
                onClick={async () => {
                  console.log('Testing Firestore connection...');
                  const result = await testFirestoreConnection();
                  console.log('Test result:', result);
                  if (result.success) {
                    toast.success(`Connection successful! Found ${result.count} posts.`);
                  } else {
                    toast.error(`Connection failed: ${result.error}`);
                  }
                }}
                className="inline-flex items-center bg-gray-600 text-white hover:bg-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Test Connection
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Add Post Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New News Post</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Embed URL or iframe code *
                </label>
                <textarea
                  name="embedUrl"
                  value={newPost.embedUrl}
                  onChange={handleInputChange}
                  placeholder="Paste Facebook embed URL or full iframe code here..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the Facebook post URL or embed code. Posts will display as actual Facebook embeds.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  name="title"
                  value={newPost.title}
                  onChange={handleInputChange}
                  placeholder="Post title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={newPost.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the post"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Add Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete News Post
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to remove this post? This action cannot be undone.
                {postToDelete?.title && (
                  <span className="block mt-2 font-medium">
                    "{postToDelete.title}"
                  </span>
                )}
              </p>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* News Feed Section */}
      <section className="py-12 bg-gray-50">
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
              {displayPosts.length > 0 ? (
                <>
                  <div className="space-y-8"> 
                    {displayPosts.map((post, index) => (
                      <div key={post.id || index} className="relative">
                        {isAdminAuthenticated && post.id && (
                          <button
                            onClick={() => handleRemovePost(post.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                            title="Remove post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        {post.title && (
                          <div className="mb-4 text-center">
                            <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                            {post.description && (
                              <p className="text-sm text-gray-600 mt-2">{post.description}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-center">
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div 
                              className="fb-post" 
                              data-href={post.embedUrl.includes('plugins/post.php?href=') 
                                ? decodeURIComponent(post.embedUrl.split('plugins/post.php?href=')[1].split('&')[0])
                                : post.embedUrl
                              }
                              data-width="500"
                              data-show-text="true"
                              style={{ margin: '0 auto' }}
                              onError={(e) => {
                                console.log('Facebook post failed to load, showing fallback');
                                e.target.style.display = 'none';
                                const fallback = e.target.nextSibling;
                                if (fallback) fallback.style.display = 'block';
                              }}
                            />
                            <div 
                              className="hidden bg-white p-6 rounded-lg shadow-sm max-w-lg w-full"
                              style={{ display: 'none' }}
                            >
                              <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">CH</span>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">Casa Hacienda de Tejeros</h4>
                                  <p className="text-sm text-gray-500">Facebook Post</p>
                                </div>
                              </div>
                              
                              {post.title && (
                                <div className="mb-4">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                                  {post.description && (
                                    <p className="text-gray-600">{post.description}</p>
                                  )}
                                </div>
                              )}
                              
                              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                                <p className="text-gray-600 text-sm mb-3">
                                  {post.title ? `📱 ${post.title}` : '📱 This Facebook post contains images, videos, or interactive content'}
                                </p>
                                <a 
                                  href={post.embedUrl.includes('plugins/post.php?href=') 
                                    ? decodeURIComponent(post.embedUrl.split('plugins/post.php?href=')[1].split('&')[0])
                                    : post.embedUrl
                                  } 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                  </svg>
                                  View Full Post on Facebook
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* View More Button */}
                  {hasMorePosts && (
                    <div className="text-center mt-8">
                      <button
                        onClick={loadMorePosts}
                        disabled={loadingMore}
                        className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingMore ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            View More Posts ({newsPosts.length - displayLimit} remaining)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  

                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No News Posts</h3>
                  <p className="text-gray-600">
                    {isAdminAuthenticated 
                      ? "Add your first news post using the button above."
                      : "Check back later for updates."
                    }
                  </p>
                </div>
              )}
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
