import { Component, inject } from '@angular/core';
import { UserSessionService, UserSession } from '../../services/user-session.service';
import { Observable } from 'rxjs';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase.config';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  menuOpen = false;           // Mobile menu state
  showProfileMenu = false;    // Profile dropdown state

  private session = inject(UserSessionService);
  user$: Observable<UserSession | null> = this.session.user$; // Real user session

  constructor(private router: Router) {
    // Close menus whenever the route changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.menuOpen = false;
        this.showProfileMenu = false;
      }
    });
  }

  // Toggle mobile menu
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  // Toggle profile dropdown menu
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  // Navigate to profile page
  goToProfile() {
    this.router.navigate(['/profile']);
    this.showProfileMenu = false;
  }

  // Logout using Firebase
  async logout() {
    try {
      await signOut(auth);
      this.session.clearUser();          // Clear session
      this.showProfileMenu = false;
      console.log('User logged out successfully');
      this.router.navigate(['/']);       // Optional: Redirect to home
    } catch (err) {
      console.error('Logout failed', err);
    }
  }
}
