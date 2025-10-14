import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  web3formsKey = 'YOUR_ACCESS_KEY_HERE';

  contact = {
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  };

  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const saved = localStorage.getItem('contactFormData');
    if (saved) {
      try {
        this.contact = JSON.parse(saved);
      } catch {
        localStorage.removeItem('contactFormData');
      }
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('contactFormData', JSON.stringify(this.contact));
    } catch {}
  }

  async submitContact() {
    if (this.isSubmitting) return;

    // basic front-end checks
    if (!this.contact.name || !this.contact.email || !this.contact.message) {
      this.showErrorMessage = true;
      setTimeout(() => (this.showErrorMessage = false), 4200);
      return;
    }

    this.isSubmitting = true;
    this.showErrorMessage = false;

    const formData = new FormData();
    formData.append('access_key', this.web3formsKey);
    formData.append('name', this.contact.name);
    formData.append('email', this.contact.email);
    formData.append('phone', this.contact.phone || '');
    formData.append('inquiry_type', this.contact.inquiryType || '');
    formData.append('message', this.contact.message);
    formData.append('subject', 'New Contact Form Submission - Tourism App');

    try {
      const response: any = await lastValueFrom(this.http.post('https://api.web3forms.com/submit', formData));

      if (response && response.success) {
        this.showSuccessMessage = true;
        localStorage.removeItem('contactFormData');

        // keep success modal shown and clear after user clicks close
        // auto-close fallback:
        setTimeout(() => this.showSuccessMessage = false, 10000);

        // clear form after a short delay so user sees submitted content briefly
        setTimeout(() => {
          this.contact = { name: '', email: '', phone: '', inquiryType: '', message: '' };
        }, 1200);
      } else {
        this.showErrorMessage = true;
        setTimeout(() => (this.showErrorMessage = false), 4200);
      }
    } catch (err) {
      console.error('Submit contact error:', err);
      this.showErrorMessage = true;
      setTimeout(() => (this.showErrorMessage = false), 4200);
    } finally {
      this.isSubmitting = false;
    }
  }

  closePopup() {
    this.showSuccessMessage = false;
  }
}
