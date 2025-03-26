import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { apiRequest } from "./queryClient";

// Initialize Firebase with environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "DEMO_API_KEY",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000"
};

// We need to have placeholder values for Firebase to initialize without errors
// but we won't actually connect to a real Firebase project with these values
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Custom user type including server data
export interface PrintXUser {
  id?: number;
  email: string;
  username?: string;
  name?: string;
  firebaseUid: string;
}

// Auth functions
export const signInWithGoogle = async (): Promise<PrintXUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Sync with our backend
    const serverUser = await syncUserWithServer(user);
    return serverUser;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return null;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<PrintXUser | null> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Sync with our backend
    const serverUser = await syncUserWithServer(user);
    return serverUser;
  } catch (error) {
    console.error("Error signing in with email:", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, name?: string): Promise<PrintXUser | null> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Sync with our backend
    const serverUser = await syncUserWithServer(user, name);
    return serverUser;
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Function to sync Firebase user with our backend
const syncUserWithServer = async (firebaseUser: User, displayName?: string): Promise<PrintXUser> => {
  try {
    const res = await apiRequest('POST', '/api/auth/firebase-auth', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: displayName || firebaseUser.displayName
    });
    
    const userData = await res.json();
    
    if (!userData.success) {
      throw new Error(userData.error || 'Failed to sync user with server');
    }
    
    return {
      ...userData.data,
      firebaseUid: firebaseUser.uid
    };
  } catch (error) {
    console.error("Error syncing user with server:", error);
    throw error;
  }
};

// Current user state
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db };
