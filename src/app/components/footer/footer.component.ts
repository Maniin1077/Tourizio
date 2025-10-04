import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  // Newsletter email input
  newsletterEmail: string = '';

  // Flags for success and error messages
  newsletterSuccess: boolean = false;
  newsletterError: boolean = false;

  // Handle newsletter submission
  submitNewsletter() {
    if (!this.newsletterEmail || !this.validateEmail(this.newsletterEmail)) {
      // Invalid email
      this.newsletterError = true;
      this.newsletterSuccess = false;

      // Reset error message after 4 seconds
      setTimeout(() => this.newsletterError = false, 4000);
      return;
    }

    // Simulate subscription success
    this.newsletterSuccess = true;
    this.newsletterError = false;

    // Clear input field
    this.newsletterEmail = '';

    // Hide success message after 4 seconds
    setTimeout(() => this.newsletterSuccess = false, 4000);
  }

  // Simple email validation
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
}
