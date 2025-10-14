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

  submitNewsletter() {
    if (!this.newsletterEmail || !this.validateEmail(this.newsletterEmail)) {
      this.newsletterError = true;
      this.newsletterSuccess = false;
      setTimeout(() => this.newsletterError = false, 4000);
      return;
    }
    this.newsletterSuccess = true;
    this.newsletterError = false;
    this.newsletterEmail = '';
    setTimeout(() => this.newsletterSuccess = false, 4000);
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }
}
