import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

class PasswordService {
  constructor() {
    this.adminPasswordDoc = 'admin_passwords';
    this.collection = 'system_settings';
  }

  // Hash a password using bcrypt
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare a password with its hash
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Initialize admin password (run once to set up initial password)
  async initializeAdminPassword(initialPassword) {
    try {
      const hashedPassword = await this.hashPassword(initialPassword);
      const passwordData = {
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        isInitialized: true
      };

      await setDoc(doc(db, this.collection, this.adminPasswordDoc), passwordData);
      return true;
    } catch (error) {
      console.error('Error initializing admin password:', error);
      throw new Error('Failed to initialize admin password');
    }
  }

  // Get admin password hash from database
  async getAdminPasswordHash() {
    try {
      const docRef = doc(db, this.collection, this.adminPasswordDoc);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // If no password exists, initialize with default password
        const defaultPassword = "Casahacienda1897";
        await this.initializeAdminPassword(defaultPassword);
        return await this.getAdminPasswordHash();
      }
    } catch (error) {
      console.error('Error getting admin password:', error);
      throw new Error('Failed to retrieve admin password');
    }
  }

  // Verify admin password
  async verifyAdminPassword(password) {
    try {
      const passwordData = await this.getAdminPasswordHash();
      return await this.comparePassword(password, passwordData.password);
    } catch (error) {
      console.error('Error verifying admin password:', error);
      return false;
    }
  }

  // Change admin password
  async changeAdminPassword(oldPassword, newPassword) {
    try {
      // First verify the old password
      const isOldPasswordCorrect = await this.verifyAdminPassword(oldPassword);
      if (!isOldPasswordCorrect) {
        throw new Error('Current password is incorrect');
      }

      // Hash the new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update the password in database
      const docRef = doc(db, this.collection, this.adminPasswordDoc);
      await updateDoc(docRef, {
        password: hashedNewPassword,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error changing admin password:', error);
      throw error;
    }
  }

  // Check if password system is initialized
  async isPasswordSystemInitialized() {
    try {
      const docRef = doc(db, this.collection, this.adminPasswordDoc);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() && docSnap.data().isInitialized;
    } catch (error) {
      console.error('Error checking password system initialization:', error);
      return false;
    }
  }
}

export const passwordService = new PasswordService();
