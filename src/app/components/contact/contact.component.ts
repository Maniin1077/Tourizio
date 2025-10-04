import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  // Web3Forms access key (replace with your actual key)
  web3formsKey = 'ed7befcf-3cfe-405c-a6b8-b871ea4ea2ff';

  // Contact form model
  contact = {
    name: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  };

  // Submission states
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Load previously saved data from local storage
    const saved = localStorage.getItem('contactFormData');
    if (saved) {
      this.contact = JSON.parse(saved);
    }
  }

  /**
   * Save form data in local storage on every input change
   */
  saveToLocalStorage() {
    localStorage.setItem('contactFormData', JSON.stringify(this.contact));
  }

  /**
   * Submit contact form to Web3Forms API
   */
  async submitContact() {
    if (this.isSubmitting) return; // Prevent multiple submissions
    if (!this.contact.name || !this.contact.email || !this.contact.message) {
      this.showErrorMessage = true;
      setTimeout(() => (this.showErrorMessage = false), 4000);
      return;
    }

    this.isSubmitting = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;

    try {
      const formData = new FormData();
      formData.append('access_key', this.web3formsKey);
      formData.append('name', this.contact.name);
      formData.append('email', this.contact.email);
      formData.append('phone', this.contact.phone || '');
      formData.append('inquiry_type', this.contact.inquiryType || '');
      formData.append('message', this.contact.message);
      formData.append('subject', 'New Contact Form Submission - Tourism App');
      formData.append('from_name', this.contact.name);
      formData.append('reply_to', this.contact.email);

      const response: any = await this.http
        .post('https://api.web3forms.com/submit', formData)
        .toPromise();

      if (response.success) {
        this.showSuccessMessage = true;
        this.resetForm();
        localStorage.removeItem('contactFormData');
      } else {
        throw new Error(response.message || 'Submission failed');
      }

      // Auto-hide success message
      setTimeout(() => (this.showSuccessMessage = false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      this.showErrorMessage = true;
      setTimeout(() => (this.showErrorMessage = false), 5000);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Reset form fields
   */
  resetForm() {
    this.contact = {
      name: '',
      email: '',
      phone: '',
      inquiryType: '',
      message: ''
    };
  }
}
