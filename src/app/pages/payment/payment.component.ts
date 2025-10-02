// FILE: payment.component.ts
// Standalone Angular Payment Component
// Keeps all original functionality + clean enhancements

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: [] // ✅ Add SCSS for theming later
})
export class PaymentComponent implements OnInit {
  // 🔹 Form fields
  cardNumber = '';
  expiryMonth = '';
  expiryYear = '';
  cvv = '';
  saveCard = false;

  // 🔹 Booking / Payment
  totalAmount = 0;
  bookingData: any = null;

  // 🔹 Dropdown data
  months: string[] = [
    '01','02','03','04','05','06',
    '07','08','09','10','11','12'
  ];
  years: number[] = [];

  // 🔹 UI States
  loading = false;
  cardType = ''; // Visa / MasterCard / Amex etc.

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    // ✅ Populate years dynamically (next 10 years)
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear + i);

    // ✅ Load booking from localStorage
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
      try {
        this.bookingData = JSON.parse(pendingBooking);
        this.totalAmount =
          (this.bookingData.people || 1) * (this.bookingData.price || 0);
      } catch {
        console.warn('⚠️ Invalid booking data in localStorage');
        localStorage.removeItem('pendingBooking');
      }
    }
  }

  // 🔹 Card Type Detection (optional UX improvement)
  detectCardType(cardNum: string): void {
    if (!cardNum) {
      this.cardType = '';
      return;
    }
    if (/^4/.test(cardNum)) this.cardType = 'Visa';
    else if (/^5[1-5]/.test(cardNum)) this.cardType = 'MasterCard';
    else if (/^3[47]/.test(cardNum)) this.cardType = 'Amex';
    else this.cardType = 'Unknown';
  }

  // 🔹 Handle Payment
  async makePayment(paymentForm: NgForm): Promise<void> {
    if (!paymentForm.valid) {
      alert('⚠️ Please complete all required fields.');
      return;
    }

    if (!this.bookingData) {
      alert('⚠️ No booking found!');
      return;
    }

    this.loading = true;
    try {
      const currentUser = await this.afAuth.currentUser;
      if (!currentUser) {
        alert('⚠️ You must be logged in to make payment.');
        this.loading = false;
        return;
      }

      // Save booking + send confirmation
      await this.bookingService.addBooking(this.bookingData);
      await this.bookingService.sendBookingMail(this.bookingData);

      alert(
        `✅ Payment Successful! INR ${this.totalAmount} Paid. Please check your email for booking details.`
      );

      localStorage.removeItem('pendingBooking');
      this.router.navigate(['/profile']);
    } catch (err) {
      console.error('❌ Payment/Booking failed:', err);
      alert(
        '❌ Payment succeeded but booking could not be saved. Please try again.'
      );
    } finally {
      this.loading = false;
    }
  }

  // 🔹 Cancel Payment
  cancelPayment(): void {
    localStorage.removeItem('pendingBooking');
    alert('❌ Payment cancelled.');
    this.router.navigate(['/destinations']);
  }
}
