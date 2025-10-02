import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { UserSessionService } from '../../services/user-session.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], // ✅ switched to SCSS for theme consistency
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  isEmailNotVerified = false;
  userEmail = '';

  private afAuth = inject(AngularFireAuth);
  private fb = inject(FormBuilder);
  private session = inject(UserSessionService);
  private router = inject(Router);

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: [
        localStorage.getItem('rememberedEmail') || '',
        [Validators.required, Validators.email],
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [!!localStorage.getItem('rememberedEmail')], // ✅ auto-check if stored
    });
  }

  // 🔑 Normal email/password login
  async onLogin() {
    if (!this.loginForm.valid) return;

    this.isLoading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );

      // Email verification check
      if (!userCredential.user?.emailVerified) {
        this.isEmailNotVerified = true;
        this.userEmail = email;
        return;
      }

      // ✅ Store session with rememberMe
      this.session.setUser({
        uid: userCredential.user.uid,
        email,
        displayName: email.split('@')[0],
        isGoogleUser: false,
        rememberMe,
      });

      // Store email if rememberMe is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      this.router.navigate(['/']);
    } catch (error: any) {
      alert(error.message);
    } finally {
      this.isLoading = false;
    }
  }

  // 🔑 Google login
  async loginWithGoogle() {
    this.isLoading = true;
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await this.afAuth.signInWithPopup(provider);

      if (userCredential.user) {
        this.session.setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName: userCredential.user.displayName || '',
          photoURL: userCredential.user.photoURL || '',
          isGoogleUser: true,
          rememberMe: true, // Always persistent for Google login
        });

        // Store email for Google users
        if (userCredential.user.email) {
          localStorage.setItem('rememberedEmail', userCredential.user.email);
        }

        this.router.navigate(['/']);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      this.isLoading = false;
    }
  }

  // 👁 Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // 📩 Resend verification email
  async resendVerificationEmail() {
    const user = await this.afAuth.currentUser;
    if (user) {
      await user.sendEmailVerification();
      alert('Verification email resent!');
    }
  }

  // 🔀 Navigate to signup page
  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
