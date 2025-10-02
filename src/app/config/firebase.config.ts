// firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { environment } from '../../environments/environment';

// Initialize Firebase app with configuration from environment.ts
const app = initializeApp(environment.firebaseConfig);

// Authentication instance
export const auth = getAuth(app);

// Firestore instance (for storing blog posts, bookings, profile data)
export const db = getFirestore(app);

// Storage instance (for uploading images, profile pics, etc.)
export const storage = getStorage(app);

// Optional: Export app itself if you need it elsewhere
export default app;
