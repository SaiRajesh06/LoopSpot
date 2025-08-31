// services/authService.js - Simple version for login only
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAz0pm69MGMcJKNCXiEGTIWLMJy9f-5BN0",
    authDomain: "loop-spot-1.firebaseapp.com",
    projectId: "loop-spot-1",
    storageBucket: "loop-spot-1.firebasestorage.app",
    messagingSenderId: "157945890545",
    appId: "1:157945890545:web:fbedfc7331fdca711c4b50",
    measurementId: "G-NHFWV454RQ"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

class SimpleAuthService {
  // Sign up new user
  async signUp(email, password, displayName = '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Optional: Update display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }
  
  // Sign in existing user
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }
  
  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }
  
  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
  
  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export const authService = new SimpleAuthService();
export { auth };