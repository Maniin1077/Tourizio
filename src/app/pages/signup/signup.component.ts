import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { UserSessionService } from '../../services/user-session.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  isEmailSent = false;
  userEmail = '';
  resendCountdown = 0;
  isResendDisabled = false;
  errorMessage: string = ''; // ✅ Added for HTML binding

  private afAuth = inject(AngularFireAuth);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private session = inject(UserSessionService);

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // =============================
  // Email/Password Signup
  // =============================
  async onSignup() {
    if (this.signupForm.invalid || this.isLoading) return;

    this.errorMessage = ''; // clear previous errors
    this.isLoading = true;

    const { name, email, password } = this.signupForm.value;

    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      await userCredential.user?.updateProfile({ displayName: name });
      await userCredential.user?.sendEmailVerification();

      this.isEmailSent = true;
      this.userEmail = email;

      alert('✅ Verification email sent. Please verify your email first.');
      this.router.navigate(['/check-email']); // Optional check-email page
    } catch (error: any) {
      this.errorMessage = error.message; // ✅ show error in HTML
    } finally {
      this.isLoading = false;
    }
  }

  // =============================
  // Google Signup/Login
  // =============================
  async signupWithGoogle() {
    if (this.isLoading) return;

    this.errorMessage = '';
    this.isLoading = true;

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await this.afAuth.signInWithPopup(provider);
      const user = userCredential.user;

      if (user) {
        this.session.setUser({
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          isGoogleUser: true,
          photoURL: user.photoURL || ''
        });
      }

      alert('✅ Google signup/login successful!');
      this.router.navigate(['/']); // Redirect to home
    } catch (error: any) {
      this.errorMessage = error.message; // ✅ show error in HTML
    } finally {
      this.isLoading = false;
    }
  }

  // =============================
  // Resend Email Verification
  // =============================
  async resendVerificationEmail() {
    if (this.isResendDisabled || this.isLoading) return;

    this.errorMessage = '';
    this.isResendDisabled = true;
    this.isLoading = true;

    try {
      const user = await this.afAuth.currentUser;
      if (user && !user.emailVerified) {
        await user.sendEmailVerification();
        alert('✅ Verification email resent!');
        this.startResendCountdown();
      }
    } catch (error: any) {
      this.errorMessage = error.message; // ✅ show error in HTML
    } finally {
      this.isLoading = false;
    }
  }

  private startResendCountdown() {
    this.resendCountdown = 30;
    const timer = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.isResendDisabled = false;
        clearInterval(timer);
      }
    }, 1000);
  }

  // =============================
  // Password Toggle
  // =============================
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // =============================
  // Form Getters
  // =============================
  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }

  // =============================
  // Navigation
  // =============================
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
