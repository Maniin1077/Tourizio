import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly USER_KEY = 'currentUser';

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  // =============================
  // Signup with Email & Password
  // =============================
  async signUp(email: string, password: string): Promise<firebase.auth.UserCredential> {
    const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    if (userCredential.user) {
      this.saveUserToLocalStorage(userCredential.user);
    }
    return userCredential;
  }

  // =============================
  // Login with Email & Password
  // =============================
  async login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
    if (userCredential.user) {
      this.saveUserToLocalStorage(userCredential.user);
    }
    return userCredential;
  }

  // =============================
  // Google Signup/Login
  // =============================
  async loginWithGoogle(redirectUrl: string = '/'): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const userCredential = await this.afAuth.signInWithPopup(provider);
      if (userCredential.user) {
        this.saveUserToLocalStorage(userCredential.user);
        console.log('Google login successful:', userCredential.user);
      }
      this.router.navigate([redirectUrl]);
    } catch (err: any) {
      console.error('Google login failed:', err);
      throw err;
    }
  }

  // =============================
  // Logout
  // =============================
  async logout(redirectUrl: string = '/login'): Promise<void> {
    try {
      await this.afAuth.signOut();
      localStorage.removeItem(this.USER_KEY); // clear stored user
      this.router.navigate([redirectUrl]);
    } catch (err: any) {
      console.error('Logout failed:', err);
    }
  }

  // =============================
  // Get current user as Observable
  // =============================
  getUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  // =============================
  // Save user info to localStorage
  // =============================
  private saveUserToLocalStorage(user: firebase.User) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  // =============================
  // Get user from localStorage
  // =============================
  getUserFromLocalStorage(): any {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : null;
  }

  // =============================
  // Send Email Verification
  // =============================
  async sendEmailVerification(): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (user && !user.emailVerified) {
      await user.sendEmailVerification();
      console.log('✅ Verification email sent to', user.email);
    }
  }

  // =============================
  // Check if user is logged in
  // =============================
  async isLoggedIn(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    return !!user;
  }
}
