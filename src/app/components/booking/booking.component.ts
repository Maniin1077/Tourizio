import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

interface Place {
  id: number;
  name: string;
  location: string;
  price: number;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  booking = { name: '', destination: '', date: '', people: null as number | null };
  selectedPlace: Place | null = null;
  placesMap: Record<string, Place[]> = {};
  allPlaces: Place[] = [];
  filteredDestinations: Place[] = [];
  showDropdown = false;
  totalPrice = 0;

  successMessage = '';
  errorMessage = '';
  isBooking = false;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {
    // ✅ 1. Load dummy data
    fetch('assets/data/dummydata.json')
      .then(res => res.json())
      .then((data: any) => {
        this.placesMap = data.placesMap || {};
        this.allPlaces = Object.values(this.placesMap).flat() as Place[];

        // ✅ 2. Load previously saved booking (if exists)
        const saved = localStorage.getItem('pendingBooking');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.booking = parsed.booking || this.booking;
          this.totalPrice = parsed.totalPrice || 0;

          if (parsed.selectedPlaceId) {
            this.selectedPlace = this.allPlaces.find(p => p.id === parsed.selectedPlaceId) || null;
          }
        }

        // ✅ 3. Handle prefill from query param
        const placeId = +this.route.snapshot.queryParams['placeId'];
        if (placeId) this.prefillBooking(placeId);
      })
      .catch(err => console.error('Error loading places JSON', err));
  }

  prefillBooking(placeId: number) {
    this.selectedPlace = this.allPlaces.find(p => p.id === placeId) || null;
    if (this.selectedPlace) {
      this.booking.destination = this.selectedPlace.name;
      this.updateTotalPrice();
      this.saveToLocalStorage();
    }
  }

  filterDestinations() {
    const query = this.booking.destination.toLowerCase().trim();
    if (!query) {
      this.filteredDestinations = [];
      this.showDropdown = false;
      return;
    }

    this.filteredDestinations = this.allPlaces.filter(place =>
      place.name.toLowerCase().includes(query)
    );
    this.showDropdown = this.filteredDestinations.length > 0;
  }

  selectDestination(place: Place) {
    this.selectedPlace = place;
    this.booking.destination = place.name;
    this.showDropdown = false;
    this.updateTotalPrice();
    this.saveToLocalStorage();
  }

  hideDropdownDelayed() {
    setTimeout(() => (this.showDropdown = false), 200);
  }

  updateTotalPrice() {
    if (this.selectedPlace && this.booking.people && this.booking.people > 0) {
      this.totalPrice = this.selectedPlace.price * this.booking.people;
    } else {
      this.totalPrice = 0;
    }
    this.saveToLocalStorage();
  }

  // ✅ Save all booking data in localStorage
  saveToLocalStorage() {
    const bookingData = {
      booking: this.booking,
      selectedPlaceId: this.selectedPlace?.id || null,
      totalPrice: this.totalPrice
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
  }

  async confirmBooking() {
    if (!this.selectedPlace) return alert('Please select a valid destination.');
    if (!this.booking.people || this.booking.people < 1) return alert('Please enter number of people.');

    const currentUser = await this.afAuth.currentUser;
    if (!currentUser) return alert('You must be logged in to confirm a booking.');

    const bookingData = {
      userId: currentUser.uid,
      name: this.booking.name,
      destination: this.selectedPlace.name,
      date: this.booking.date,
      people: this.booking.people,
      totalPrice: this.totalPrice,
      email: currentUser.email || ''
    };

    // ✅ Save full booking for payment page
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    this.router.navigate(['/payment']);
  }
}
