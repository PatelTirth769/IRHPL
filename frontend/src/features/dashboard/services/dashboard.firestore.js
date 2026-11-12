import { db } from '@/config/firebase';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export const listenToUserStats = (uid, callback, errorCallback) => {
  if (!uid) return () => {};
  
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      callback(null);
    }
  }, errorCallback);
};

export const listenToRecentHistory = (uid, callback, errorCallback) => {
  if (!uid) return () => {};
  
  const historyRef = collection(db, 'organizations', uid, 'employees');
  const q = query(historyRef, orderBy('createdAt', 'desc'), limit(5));
  
  return onSnapshot(q, (snapshot) => {
    const history = [];
    snapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });
    callback(history);
  }, errorCallback);
};

export const listenToEmployeeCount = (uid, callback, errorCallback) => {
  if (!uid) return () => {};
  
  const empRef = collection(db, 'organizations', uid, 'employees');
  return onSnapshot(empRef, (snapshot) => {
    callback(snapshot.size);
  }, errorCallback);
};

// Lightweight Presence Tracker
let presenceInterval = null;
export const startPresencePulse = (uid) => {
  if (!uid) return;
  const pulse = async () => {
    try {
      const activeRef = doc(db, 'active_sessions', uid);
      await setDoc(activeRef, { lastSeen: serverTimestamp() }, { merge: true });
    } catch (err) {
      // ignore
    }
  };
  pulse();
  presenceInterval = setInterval(pulse, 60000); // every minute
};

export const stopPresencePulse = () => {
  if (presenceInterval) {
    clearInterval(presenceInterval);
    presenceInterval = null;
  }
};
