import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject } from 'rxjs';

export interface UserSession {
  uid: string;
  displayName: string;
  email: string;
  isGoogleUser: boolean;
  photoURL?: string;
  rememberMe?: boolean; // optional, controls storage type
  metadata?: {
    creationTime?: Date;      // Converted to Date
    lastSignInTime?: Date;    // Converted to Date
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {
  private userSubject = new BehaviorSubject<UserSession | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private afAuth: AngularFireAuth) {
    // Load stored user on app start
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: UserSession = JSON.parse(storedUser);
        // Convert metadata strings to Date objects if they exist
        if (parsedUser.metadata) {
          parsedUser.metadata.creationTime = parsedUser.metadata.creationTime ? new Date(parsedUser.metadata.creationTime) : undefined;
          parsedUser.metadata.lastSignInTime = parsedUser.metadata.lastSignInTime ? new Date(parsedUser.metadata.lastSignInTime) : undefined;
        }
        this.userSubject.next(parsedUser);
      } catch (err) {
        console.error('Failed to parse stored user', err);
        this.clearUser();
      }
    }

    // Firebase auth state listener
    this.afAuth.authState.subscribe(firebaseUser => {
      if (firebaseUser) {
        const isGoogleUser = ((firebaseUser.providerData || []) as any[])
          .some((p: any) => p.providerId === 'google.com');

        const user: UserSession = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          isGoogleUser,
          photoURL: firebaseUser.photoURL || '',
          metadata: {
            creationTime: firebaseUser.metadata?.creationTime ? new Date(firebaseUser.metadata.creationTime) : undefined,
            lastSignInTime: firebaseUser.metadata?.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined
          }
        };

        this.setUser(user); // persists in storage
      } else {
        this.clearUser();
      }
    });
  }

  // Set user session and persist
  setUser(user: UserSession) {
    this.userSubject.next(user);

    if (user.rememberMe) {
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('user');
    }
  }

  // Get current user (sync)
  getUser(): UserSession | null {
    return this.userSubject.value;
  }

  // Clear user session
  clearUser() {
    this.userSubject.next(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');

    this.afAuth.signOut().catch(err => console.error('Error signing out:', err));
  }
}
