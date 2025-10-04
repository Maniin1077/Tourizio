import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  // Web3Forms access key (replace with your own)
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

  /**
   * Submit contact form
   */
  async submitContact() {
    if (this.isSubmitting) return; // Prevent multiple submissions

    this.isSubmitting = true;
    this.showSuccessMessage = false;
    this.showErrorMessage = false;

    try {
      // Prepare form data
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

      // POST request to Web3Forms
      const response: any = await this.http.post('https://api.web3forms.com/submit', formData).toPromise();

      if (response.success) {
        this.showSuccessMessage = true;
        this.resetForm();
      } else {
        throw new Error(response.message || 'Submission failed');
      }

      // Auto-hide success message after 5s
      setTimeout(() => this.showSuccessMessage = false, 5000);

    } catch (error) {
      console.error('Error submitting form:', error);
      this.showErrorMessage = true;

      // Auto-hide error message after 5s
      setTimeout(() => this.showErrorMessage = false, 5000);
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
