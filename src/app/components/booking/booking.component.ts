import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService, BookingData } from '../../services/booking.service';
import { UserSessionService, UserSession } from '../../services/user-session.service';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

interface Place {
  id: string;
  name: string;
  location: string;
  price: number;
  imageUrl: string;
  days?: number;
  type?: string;
}

interface BookingForm {
  name: string;
  destination: string;
  date: string;
  people: number;
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit, OnDestroy {
  user: UserSession | null = null;
  bookings: BookingData[] = [];
  loading: boolean = true;
  cancelingBookingIds: string[] = [];

  places: Place[] = [];
  filteredPlaces: Place[] = [];
  favoritePlaces: string[] = [];
  selectedPlace: Place | null = null;

  booking: BookingForm = { name: '', destination: '', date: '', people: 1 };
  isBooking: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: UserSessionService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadPlaces();
    this.loadFavorites();
  }

  /** --------------------------
   * USER SESSION
  --------------------------- */
  private loadUser() {
    this.sessionService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => {
        this.user = u;
        this.loadBookings();
      });
  }

  /** --------------------------
   * BOOKINGS
  --------------------------- */
  private loadBookings() {
    if (!this.user) { 
      this.bookings = [];
      this.loading = false;
      return;
    }

    this.loading = true;

    const cached = localStorage.getItem(`bookings_${this.user.uid}`);
    if (cached) {
      try { this.bookings = JSON.parse(cached); } catch {}
    }

    this.bookingService.getUserBookings(this.user.uid)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: bks => {
          this.bookings = bks;
          localStorage.setItem(`bookings_${this.user!.uid}`, JSON.stringify(bks));
        },
        error: err => { 
          console.error('Failed to load bookings', err); 
          this.loading = false; 
        }
      });
  }

  cancelBooking(id?: string) {
    if (!id || !confirm('Are you sure you want to cancel this booking?')) return;

    this.cancelingBookingIds.push(id);
    this.bookingService.deleteBooking(id).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b.id !== id);
        this.cancelingBookingIds = this.cancelingBookingIds.filter(bid => bid !== id);
        if (this.user) {
          localStorage.setItem(`bookings_${this.user.uid}`, JSON.stringify(this.bookings));
        }
        alert('Booking canceled successfully!');
      },
      error: err => {
        console.error(err);
        this.cancelingBookingIds = this.cancelingBookingIds.filter(bid => bid !== id);
        alert('Failed to cancel booking');
      }
    });
  }

  isCanceling(id: string): boolean { return this.cancelingBookingIds.includes(id); }

  /** --------------------------
   * PLACES / DESTINATIONS
  --------------------------- */
  private loadPlaces() {
    const stored = localStorage.getItem('places');
    if (stored) {
      this.places = JSON.parse(stored);
    } else {
      this.places = [
        { id: '1', name: 'Goa Beach', location: 'Goa', price: 3500, imageUrl: 'assets/images/goa.jpg', type: 'Nature', days: 3 },
        { id: '2', name: 'Jaipur Palace', location: 'Jaipur', price: 4500, imageUrl: 'assets/images/jaipur.jpg', type: 'Cultural', days: 2 },
        { id: '3', name: 'Rishikesh Adventure', location: 'Rishikesh', price: 5000, imageUrl: 'assets/images/rishikesh.jpg', type: 'Adventure', days: 4 }
      ];
      localStorage.setItem('places', JSON.stringify(this.places));
    }
    this.filteredPlaces = [...this.places];
  }

  filterByType(type: string) {
    this.filteredPlaces = type ? this.places.filter(p => p.type === type) : [...this.places];
  }

  /** --------------------------
   * FAVORITES
  --------------------------- */
  loadFavorites() {
    const fav = localStorage.getItem('favoritePlaces');
    this.favoritePlaces = fav ? JSON.parse(fav) : [];
  }

  toggleFavorite(place: Place) {
    if (this.isFavorite(place)) {
      this.favoritePlaces = this.favoritePlaces.filter(id => id !== place.id);
    } else {
      this.favoritePlaces.push(place.id);
    }
    localStorage.setItem('favoritePlaces', JSON.stringify(this.favoritePlaces));
  }

  isFavorite(place: Place): boolean { return this.favoritePlaces.includes(place.id); }

  /** --------------------------
   * BOOKING FORM
  --------------------------- */
  onSelectPlace(place: Place) {
    this.selectedPlace = place;
    this.booking.destination = place.name;
  }

  confirmBooking(place?: Place) {
    if (!this.user) {
      alert('Please login to book a trip!');
      return;
    }

    if (place) this.onSelectPlace(place);
    if (!this.booking.name || !this.booking.destination || !this.booking.date || this.booking.people < 1) return;

    this.isBooking = true;

    setTimeout(() => {
      const newBooking: BookingData = {
        userId: this.user!.uid,                  // required
        name: this.booking.name,
        destination: this.booking.destination,
        date: this.booking.date,
        people: this.booking.people,
        price: this.selectedPlace?.price || 0,
        email: this.user!.email || undefined,    // optional
        id: Date.now().toString()                // optional
      };

      // Save booking
      this.bookings.push(newBooking);
      localStorage.setItem(`bookings_${this.user!.uid}`, JSON.stringify(this.bookings));

      // Reset form
      this.booking = { name: '', destination: '', date: '', people: 1 };
      this.selectedPlace = null;
      this.isBooking = false;

      alert('Booking confirmed!');
    }, 1000);
  }

  onBookNow(placeId: string) {
    const place = this.places.find(p => p.id === placeId);
    if (place) this.confirmBooking(place);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
