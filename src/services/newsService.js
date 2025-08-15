import { 
  collection, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  orderBy, 
  query,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const NEWS_COLLECTION = 'news_posts';

// Test Firestore connection
export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    console.log('Database instance:', db);
    console.log('Collection path:', NEWS_COLLECTION);
    
    const testQuery = await getDocs(collection(db, NEWS_COLLECTION));
    console.log('Connection test successful, document count:', testQuery.size);
    return { success: true, count: testQuery.size };
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

// Add a new news post
export const addNewsPost = async (embedUrl, title = '', description = '') => {
  try {
    console.log('Adding news post with data:', { embedUrl, title, description });
    
    const newsData = {
      embedUrl,
      title,
      description,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('News data to save:', newsData);
    const docRef = await addDoc(collection(db, NEWS_COLLECTION), newsData);
    console.log('News post added successfully with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding news post:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Remove a news post
export const removeNewsPost = async (postId) => {
  try {
    console.log('Removing news post with ID:', postId);
    await deleteDoc(doc(db, NEWS_COLLECTION, postId));
    console.log('News post removed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error removing news post:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Get all news posts
export const getNewsPosts = async () => {
  try {
    console.log('Fetching news posts...');
    
    // First try with ordering by createdAt
    try {
      const q = query(collection(db, NEWS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('News posts fetched successfully:', posts.length);
      return posts;
    } catch (orderError) {
      // If ordering fails (e.g., no createdAt field), try without ordering
      console.warn('Ordering by createdAt failed, trying without order:', orderError);
      const querySnapshot = await getDocs(collection(db, NEWS_COLLECTION));
      
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort manually by createdAt if available, otherwise by document ID
      posts.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toDate ? b.createdAt.toDate() - a.createdAt.toDate() : 0;
        }
        return b.id.localeCompare(a.id);
      });
      
      console.log('News posts fetched successfully (without ordering):', posts.length);
      return posts;
    }
  } catch (error) {
    console.error('Error getting news posts:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};
