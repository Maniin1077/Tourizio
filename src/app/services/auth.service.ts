import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getCurrentUser() {
    throw new Error('Method not implemented.');
  }

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  // =============================
  // Signup with Email & Password
  // =============================
  signUp(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // =============================
  // Login with Email & Password
  // =============================
  login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  // =============================
  // Google Signup/Login
  // =============================
  async loginWithGoogle(redirectUrl: string = '/'): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const userCredential = await this.afAuth.signInWithPopup(provider);
      if (userCredential.user) {
        // Optional: You can handle additional logic here like saving session
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
