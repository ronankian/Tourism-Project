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
    const testQuery = await getDocs(collection(db, NEWS_COLLECTION));
    return { success: true, count: testQuery.size };
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return { success: false, error: error.message, code: error.code };
  }
};

// Add a new news post
export const addNewsPost = async (embedUrl, title = '', description = '') => {
  try {
    const newsData = {
      embedUrl,
      title,
      description,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, NEWS_COLLECTION), newsData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding news post:', error);
    throw error;
  }
};

// Remove a news post
export const removeNewsPost = async (postId) => {
  try {
    await deleteDoc(doc(db, NEWS_COLLECTION, postId));
    return { success: true };
  } catch (error) {
    console.error('Error removing news post:', error);
    throw error;
  }
};

// Get all news posts
export const getNewsPosts = async () => {
  try {
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
      
      return posts;
    } catch (orderError) {
      // If ordering fails (e.g., no createdAt field), try without ordering
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
