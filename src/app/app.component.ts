import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { trigger, transition, style, animate, query } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        // Initial state of entering page
        query(':enter', [style({ opacity: 0 })], { optional: true }),

        // Animate leaving page
        query(':leave', [animate('300ms ease', style({ opacity: 0 }))], { optional: true }),

        // Animate entering page
        query(':enter', [animate('300ms ease', style({ opacity: 1 }))], { optional: true }),
      ]),
    ]),
  ],
})
export class AppComponent {
  title = 'Tourism Platform';

  constructor(private router: Router) {}

  // Check if current page is an auth-related page
  isAuthPage(): boolean {
    const url = this.router.url;
    return ['/login', '/signup', '/profile', '/payment'].some(path =>
      url.startsWith(path)
    );
  }

  // Provide route animation state
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
