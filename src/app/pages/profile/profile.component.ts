import { Component, OnInit } from '@angular/core';
import { BookingService, BookingData } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any;
  bookings: BookingData[] = [];
  loading = true;
  error = '';
  private bookingSub?: Subscription;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

loadUserData() {
  this.authService.getUser().subscribe({
    next: (user) => {
      this.user = user;
      if (user?.uid) {
        this.subscribeToBookings(user.uid);
      } else {
        this.loading = false;
        this.error = 'User not logged in.';
      }
    },
    error: (err) => {
      console.error('Failed to get current user:', err);
      this.loading = false;
      this.error = 'Failed to load user.';
    }
  });
}

  private subscribeToBookings(uid: string) {
    this.bookingSub?.unsubscribe();
    this.loading = true;
    this.bookingSub = this.bookingService.getUserBookings(uid).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.error = 'Failed to load bookings.';
        this.loading = false;
      }
    });
  }

  cancelBooking(booking: BookingData) {
    if (!booking.id) {
      alert('Cannot cancel booking: missing ID.');
      return;
    }

    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.bookingService.deleteBooking(booking.id).subscribe({
      next: () => {
        alert('Booking cancelled successfully.');
        this.bookings = this.bookings.filter(b => b.id !== booking.id);
      },
      error: (err) => {
        console.error('Cancel error:', err);
        alert('Failed to cancel booking. Please try again.');
      }
    });
  }

  ngOnDestroy() {
    this.bookingSub?.unsubscribe();
  }
}
