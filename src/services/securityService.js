import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'restricted_emails';

export const securityService = {
  async addRestrictedEmail(email, message = '', expiresAtMs = null) {
    const emailLower = String(email || '').trim().toLowerCase();
    if (!emailLower) throw new Error('Email is required');
    const data = {
      email: emailLower,
      emailLower,
      message: message || '',
      expiresAtMs: typeof expiresAtMs === 'number' ? expiresAtMs : null,
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, COLLECTION), data);
  },

  async listRestrictedEmails() {
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async removeRestrictedEmail(id) {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  async isEmailRestricted(email) {
    const emailLower = String(email || '').trim().toLowerCase();
    if (!emailLower) return { restricted: false };
    const q = query(collection(db, COLLECTION), where('emailLower', '==', emailLower));
    const snap = await getDocs(q);
    if (snap.empty) return { restricted: false };
    const now = Date.now();
    for (const d of snap.docs) {
      const data = d.data();
      const expiresAtMs = data.expiresAtMs || null;
      if (!expiresAtMs || now <= expiresAtMs) {
        return { restricted: true, message: data.message || 'This email address is restricted by the administrator.' };
      }
    }
    return { restricted: false };
  },

  async pruneExpiredRestrictions() {
    const snap = await getDocs(collection(db, COLLECTION));
    const now = Date.now();
    const removals = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data && typeof data.expiresAtMs === 'number' && data.expiresAtMs <= now) {
        removals.push(deleteDoc(doc(db, COLLECTION, d.id)));
      }
    });
    if (removals.length > 0) {
      await Promise.allSettled(removals);
    }
  }
};


