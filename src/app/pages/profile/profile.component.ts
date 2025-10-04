import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { UserSessionService, UserSession } from '../../services/user-session.service';
import { BookingService, BookingData } from '../../services/booking.service';

interface EnhancedBooking extends BookingData {
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  notes?: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: UserSession | null = null;
  bookings: EnhancedBooking[] = [];
  loading: boolean = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: UserSessionService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    // Subscribe to user session
    this.sessionService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (u) => this.loadUserData(u),
        error: (err) => {
          console.error(err);
          this.error = 'Failed to load user session.';
          this.loading = false;
        }
      });
  }

  private loadUserData(user: UserSession | null): void {
    this.user = user;
    this.bookings = [];
    this.loading = true;
    this.error = null;

    if (!user) {
      this.loading = false;
      return;
    }

    // Load cached bookings from localStorage for instant UI
    const cached = localStorage.getItem(`bookings_${user.uid}`);
    if (cached) {
      try {
        this.bookings = JSON.parse(cached);
      } catch (err) {
        console.error('Failed to parse cached bookings', err);
        this.bookings = [];
      }
      this.loading = false;
    }

    // Fetch fresh data from backend (Firestore)
    this.bookingService.getUserBookings(user.uid)
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (bookings) => {
          // Map bookings to ensure default status and notes
          this.bookings = bookings.map(b => ({
            ...b,
            status: b.status as 'Confirmed' | 'Pending' | 'Cancelled' || 'Pending',
            notes: b.notes || ''
          }));
          localStorage.setItem(`bookings_${user.uid}`, JSON.stringify(this.bookings));
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to fetch bookings.';
        }
      });
  }

  cancelBooking(bookingId: string | undefined): void {
    if (!bookingId) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.bookingService.deleteBooking(bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.bookings = this.bookings.filter(b => b.id !== bookingId);
          if (this.user) {
            localStorage.setItem(`bookings_${this.user.uid}`, JSON.stringify(this.bookings));
          }
          alert('Booking cancelled successfully!');
        },
        error: (err) => {
          console.error(err);
          alert('Failed to cancel booking. Try again.');
        }
      });
  }

  // Utility for badge CSS based on status
  getStatusBadge(status: string): string {
    switch (status) {
      case 'Confirmed': return 'bg-green-200 text-green-800';
      case 'Pending': return 'bg-yellow-200 text-yellow-800';
      case 'Cancelled': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
