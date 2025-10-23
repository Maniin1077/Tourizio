import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../../environments/environment';

// Initialize Firebase app using environment config
const app = initializeApp(environment.firebaseConfig);

// Export auth instance for use across the app
export const auth = getAuth(app);
