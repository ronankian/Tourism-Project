import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';

const ADVISORY_COLLECTION = 'advisories';

export const advisoryService = {
  // Add new advisory
  async addAdvisory(advisoryData) {
    try {
      const docRef = await addDoc(collection(db, ADVISORY_COLLECTION), {
        ...advisoryData,
        createdAt: serverTimestamp(),
        isActive: true
      });
      return { id: docRef.id, ...advisoryData };
    } catch (error) {
      console.error('Error adding advisory:', error);
      throw error;
    }
  },

  // Get all advisories
  async getAdvisories() {
    try {
      const q = query(collection(db, ADVISORY_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const advisories = [];
      querySnapshot.forEach((doc) => {
        advisories.push({ id: doc.id, ...doc.data() });
      });
      return advisories;
    } catch (error) {
      console.error('Error getting advisories:', error);
      // Return empty array if collection doesn't exist or other errors
      return [];
    }
  },

  // Get active advisories only
  async getActiveAdvisories() {
    try {
      const q = query(collection(db, ADVISORY_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const advisories = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isActive) {
          advisories.push({ id: doc.id, ...data });
        }
      });
      return advisories;
    } catch (error) {
      console.error('Error getting active advisories:', error);
      // Return empty array if collection doesn't exist or other errors
      return [];
    }
  },

  // Update advisory
  async updateAdvisory(id, advisoryData) {
    try {
      const advisoryRef = doc(db, ADVISORY_COLLECTION, id);
      await updateDoc(advisoryRef, {
        ...advisoryData,
        updatedAt: serverTimestamp()
      });
      return { id, ...advisoryData };
    } catch (error) {
      console.error('Error updating advisory:', error);
      throw error;
    }
  },

  // Delete advisory
  async deleteAdvisory(id) {
    try {
      const advisoryRef = doc(db, ADVISORY_COLLECTION, id);
      await deleteDoc(advisoryRef);
      return id;
    } catch (error) {
      console.error('Error deleting advisory:', error);
      throw error;
    }
  },

  // Toggle advisory active status
  async toggleAdvisoryStatus(id, isActive) {
    try {
      const advisoryRef = doc(db, ADVISORY_COLLECTION, id);
      await updateDoc(advisoryRef, {
        isActive,
        updatedAt: serverTimestamp()
      });
      return { id, isActive };
    } catch (error) {
      console.error('Error toggling advisory status:', error);
      throw error;
    }
  }
};
