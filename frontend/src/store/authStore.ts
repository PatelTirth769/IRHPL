import toast from 'react-hot-toast';
import { create } from 'zustand';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  firebaseUser: null,
  error: null,

  initializeAuthListener: () => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({ isLoading: true });
        try {
          // 1. Ensure user doc exists in Firestore (merge: true so we don't overwrite)
          const userRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userRef, {
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            plan: 'free',
            // Only set these if they don't exist
            calculatorUses: 0,
            savedStates: 0,
            lastLoginAt: serverTimestamp(),
            createdAt: serverTimestamp() // merge will keep original if exists
          }, { merge: true });

          // We also need to fix createdAt so we don't overwrite it if it exists.
          // Better yet, check if it exists first.
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists() || !docSnap.data().createdAt) {
             await setDoc(userRef, { createdAt: serverTimestamp() }, { merge: true });
          }

          // 2. Get the current user profile from our backend
          const response = await api.get('/auth/me');
          set({
            firebaseUser,
            user: response.data.data.user || firebaseUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error("Auth init error:", error);
          set({
            firebaseUser,
            user: firebaseUser,
            isAuthenticated: true,
            isLoading: false
          });
        }
      } else {
        set({
          firebaseUser: null,
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });
  },

  getToken: async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  },

  logout: async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('emailForSignIn');
      set({ user: null, firebaseUser: null, isAuthenticated: false, isLoading: false });
      
      toast.success('Logged out successfully');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err) {
      console.error('Logout error', err);
    }
  },
  
  // To manually trigger loading state when needed
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
