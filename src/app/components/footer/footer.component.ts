import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  newsletterEmail: string = '';
  newsletterSuccess: boolean = false;
  newsletterError: boolean = false;

  // Handle newsletter subscription
  submitNewsletter() {
    if (!this.newsletterEmail || !this.validateEmail(this.newsletterEmail)) {
      this.newsletterError = true;
      this.newsletterSuccess = false;

      // Hide error after 4s
      setTimeout(() => (this.newsletterError = false), 4000);
      return;
    }

    // Simulate successful subscription
    this.newsletterSuccess = true;
    this.newsletterError = false;

    // Clear input
    this.newsletterEmail = '';

    // Hide success after 4s
    setTimeout(() => (this.newsletterSuccess = false), 4000);
  }

  // Simple email validation
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
}
