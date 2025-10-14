import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

interface Place {
  id: number;
  name: string;
  location?: string;
  price: number;
  days?: number;
  image?: string;
  type?: string;
}

interface VehicleOption {
  type: string;
  model: string;
  capacity: string;
  pricePerDay: number;
}

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit {
  booking = {
    name: '',
    destination: '',
    date: '',
    people: null as number | null,
    days: 1,
  };

  selectedPlace: Place | null = null;
  selectedPlaceImage: string | null = null;
  destinationText: string = '';

  allPlaces: Place[] = [];
  filteredDestinations: Place[] = [];
  showDropdown = false;

  vehicleTypes = ['Car/SUV', 'Tempo Van/Traveller', 'Bike', 'No Vehicle'];
  selectedVehicleType: string = 'No Vehicle';
  vehicleModels: VehicleOption[] = [];
  selectedVehicleModel: VehicleOption | null = null;

  vehicles: VehicleOption[] = [
    { type: 'Car/SUV', model: 'Maruti Alto K10', capacity: '4 seater', pricePerDay: 2000 },
    { type: 'Car/SUV', model: 'Tata Nexon', capacity: '6 seater', pricePerDay: 2500 },
    { type: 'Car/SUV', model: 'Toyota Innova Hycross', capacity: '7 seater', pricePerDay: 3000 },
    { type: 'Car/SUV', model: 'Toyota Innova Crysta', capacity: '8 seater', pricePerDay: 3500 },
    { type: 'Car/SUV', model: 'Mahindra Bolero Neo Plus', capacity: '9 seater', pricePerDay: 4000 },
    { type: 'Tempo Van/Traveller', model: 'Force Traveller Mini', capacity: '9 seater', pricePerDay: 5000 },
    { type: 'Tempo Van/Traveller', model: 'Tata Winger', capacity: '12 seater', pricePerDay: 6000 },
    { type: 'Tempo Van/Traveller', model: 'Force Traveller', capacity: '15 seater', pricePerDay: 7000 },
    { type: 'Tempo Van/Traveller', model: 'Force Traveller', capacity: '17 seater', pricePerDay: 8500 },
    { type: 'Tempo Van/Traveller', model: 'Force Traveller', capacity: '20 seater', pricePerDay: 10000 },
    { type: 'Bike', model: 'Royal Enfield Classic 350', capacity: '2 seater', pricePerDay: 1100 },
    { type: 'Bike', model: 'Honda CB350 H’ness', capacity: '2 seater', pricePerDay: 1300 },
    { type: 'Bike', model: 'Bajaj Avenger 220', capacity: '2 seater', pricePerDay: 1500 },
  ];

  // pricing
  totalPrice = 0;
  estimatedAmount = 0 * 0.5;
  gstRate = 0.025;
  gstAmount = 0;
  amountWithGst = 0;
  discountRate = 0.15;
  discountAmount = 0;
  finalAmount = 0;
  isFirstBooking = false;

  showConfirmModal = false;

  private filterDebounceTimer: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    fetch('assets/data/dummydata.json')
      .then(res => res.json())
      .then((data: any) => {
        if (data && data.placesMap) {
          // if JSON has a placesMap structure
          this.allPlaces = Object.values(data.placesMap).flat() as Place[];
        } else if (Array.isArray(data)) {
          this.allPlaces = data as Place[];
        } else if (data && data.places) {
          this.allPlaces = data.places as Place[];
        }

      })
      .catch(err => console.error('Error loading places JSON', err));

    this.onVehicleTypeChange();

    // detect first booking from localStorage if user logged in
    this.afAuth.onAuthStateChanged(user => {
      if (user) {
        const bookings = this.getAllBookingsForUser(user.uid);
        this.isFirstBooking = bookings.length === 0;
      } else {
        this.isFirstBooking = false;
      }
    });
  }

  filterDestinations() {
    const q = (this.booking.destination || '').toLowerCase().trim();
    if (this.filterDebounceTimer) clearTimeout(this.filterDebounceTimer);

    this.filterDebounceTimer = setTimeout(() => {
      if (!q) {
        this.filteredDestinations = [];
        this.showDropdown = false;
        return;
      }
      this.filteredDestinations = this.allPlaces
        .filter(p => (p.name || '').toLowerCase().includes(q) || (p.location || '').toLowerCase().includes(q))
        .slice(0, 8);
      this.showDropdown = this.filteredDestinations.length > 0;
    }, 160);
  }

  selectDestination(place: Place): void {
  this.selectedPlace = place;
  this.booking.destination = place.name;
  this.showDropdown = false;

  // ✅ Default number of days to 1 if not defined
  this.booking.days = place.days || 1;

  // Trigger typing animation
  this.animateDestinationText();

  // Set image
  if (place.image) {
    this.selectedPlaceImage = place.image;
  } else {
    const normalized = place.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.selectedPlaceImage = `assets/images/${normalized}.jpg`;
  }

  // ✅ Update total price immediately
  this.updateTotalPrice();
}

  hideDropdownDelayed() {
    setTimeout(() => (this.showDropdown = false), 150);
  }

  animateDestinationText() {
  if (!this.selectedPlace) return;
  const fullText = this.selectedPlace.name;
  this.destinationText = '';
  let i = 0;
  const interval = setInterval(() => {
    this.destinationText += fullText[i];
    i++;
    if (i >= fullText.length) clearInterval(interval);
  }, 50);
}


  onVehicleTypeChange() {
    if (!this.selectedVehicleType || this.selectedVehicleType === 'No Vehicle') {
      this.vehicleModels = [];
      this.selectedVehicleModel = null;
    } else {
      this.vehicleModels = this.vehicles.filter(v => v.type === this.selectedVehicleType);
      this.selectedVehicleModel = null;
    }
    this.updateTotalPrice();
  }

  onVehicleModelChange() {
    this.updateTotalPrice();
  }

  updateTotalPrice(): void {
  const days = Math.max(1, Number(this.booking.days || 1));
  const people = Math.max(1, Number(this.booking.people || 1));

  if (!this.selectedPlace || !this.booking.date || people <= 0) {
    this.totalPrice = 0;
    this.estimatedAmount = 0;
    this.gstAmount = 0;
    this.amountWithGst = 0;
    this.discountAmount = 0;
    this.finalAmount = 0;
    return;
  }

  // ✅ Use half-price as in destination page
  const basePrice = this.selectedPlace.price / 2;

  // Destination cost = price per person per day
  const destinationCost = basePrice * people * days;

  // Vehicle cost
  const vehicleCost = this.selectedVehicleModel ? this.selectedVehicleModel.pricePerDay * days : 0;

  // Total calculations
  this.totalPrice = Math.round((destinationCost + vehicleCost) * 100) / 100;
  this.estimatedAmount = this.totalPrice;

  this.gstAmount = Math.round(this.estimatedAmount * this.gstRate * 100) / 100;
  this.amountWithGst = Math.round((this.estimatedAmount + this.gstAmount) * 100) / 100;
  this.discountAmount = this.isFirstBooking ? Math.round(this.amountWithGst * this.discountRate * 100) / 100 : 0;
  this.finalAmount = Math.round((this.amountWithGst - this.discountAmount) * 100) / 100;
}

  get showTotal(): boolean {
    const nameOK = !!(this.booking.name && this.booking.name.toString().trim().length > 0);
    const dateOK = !!this.booking.date;
    const peopleOK = Number(this.booking.people || 0) > 0;
    const destOK = !!this.selectedPlace;
    const vehicleOK = this.selectedVehicleType === 'No Vehicle' || (this.selectedVehicleModel !== null && !!this.selectedVehicleModel);
    return nameOK && dateOK && peopleOK && destOK && vehicleOK;
  }

  formatCurrency(amount: number): string {
    if (!isFinite(amount) || amount === null || amount === undefined) amount = 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
  }

  onInputChange() {
    if (this.booking.destination && this.selectedPlace && this.selectedPlace.name !== this.booking.destination) {
      this.selectedPlace = null;
      this.selectedPlaceImage = null;
    }
    this.filterDestinations();
    this.updateTotalPrice();
  }

  async confirmBooking() {
    if (!this.booking.name || !this.selectedPlace || !this.booking.date || !this.booking.people || Number(this.booking.people) <= 0) {
      return alert('Please fill all required fields.');
    }
    if (this.selectedVehicleType !== 'No Vehicle' && !this.selectedVehicleModel) {
      return alert('Please select a vehicle model.');
    }

    const currentUser = await this.afAuth.currentUser;
    if (!currentUser) return alert('You must be logged in to book.');

    this.updateTotalPrice();

    const bookingData: any = {
      id: this.generateId(),
      userId: currentUser.uid,
      name: this.booking.name,
      destination: this.selectedPlace!.name,
      date: this.booking.date,
      people: Number(this.booking.people),
      days: Math.max(1, Number(this.booking.days || 1)),
      image: this.selectedPlaceImage || '',
      location: this.selectedPlace!.location || '',
      type: this.selectedPlace!.type || '',
      vehicle: this.selectedVehicleType === 'No Vehicle' ? 'No Vehicle' : (this.selectedVehicleModel?.model || this.selectedVehicleType),
      estimatedAmount: this.estimatedAmount,
      gstAmount: this.gstAmount,
      amountWithGst: this.amountWithGst,
      discountAmount: this.discountAmount,
      finalAmount: this.finalAmount,
      totalPrice: this.totalPrice,
      email: currentUser.email || '',
      createdAt: new Date().toISOString(),
      paid: false,
      paidAt: null,
      cancelled: false,
      cancelledAt: null,
    };

    // Save booking to user's bookings (localStorage)
    this.appendBookingForUser(currentUser.uid, bookingData);

    // Update first booking flag
    const bookings = this.getAllBookingsForUser(currentUser.uid);
    this.isFirstBooking = bookings.filter(b => b.paid).length === 0 && bookings.length > 0;

    // Keep pendingBooking in localStorage for quick retrieval if needed
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    // Show confirmation modal (no payment flow)
    this.showConfirmModal = true;
  }

  // Close modal; optionally navigate to profile if user wants to view My Bookings
  closeModal(goToProfile: boolean) {
    this.showConfirmModal = false;
    if (goToProfile) {
      // navigate to profile where My Bookings can be shown
      this.router.navigate(['/profile']);
    } else {
      // clear form but keep booking visible in profile
      this.resetFormAfterBooking();
    }
  }

  private resetFormAfterBooking() {
    this.booking = { name: '', destination: '', date: '', people: null, days: 1 };
    this.selectedPlace = null;
    this.selectedPlaceImage = null;
    this.selectedVehicleType = 'No Vehicle';
    this.selectedVehicleModel = null;
    this.updateTotalPrice();
  }

  private generateId(): string {
    return 'b_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  private getAllBookingsForUser(uid: string): any[] {
    try {
      const raw = localStorage.getItem(`userBookings_${uid}`);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  private appendBookingForUser(uid: string, booking: any) {
    const arr = this.getAllBookingsForUser(uid);
    arr.push(booking);
    try {
      localStorage.setItem(`userBookings_${uid}`, JSON.stringify(arr));
    } catch (e) {
      console.error('Error saving booking', e);
    }
  }

  computeRefundForCancellation(booking: any, cancellationDateIso?: string) {
    if (!booking || !booking.date) return { refundPercent: 0, refundAmount: 0 };

    const travelDate = new Date(booking.date);
    const now = cancellationDateIso ? new Date(cancellationDateIso) : new Date();
    const diffHours = (travelDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (diffHours >= 72) refundPercent = 90;
    else if (diffHours >= 48) refundPercent = 75;
    else refundPercent = 0;

    const paidAmount = booking.finalAmount || 0;
    const refundAmount = Math.round((paidAmount * (refundPercent / 100)) * 100) / 100;

    return { refundPercent, refundAmount, diffHours: Math.round(diffHours) };
  }

  cancelBookingForUser(uid: string, bookingId: string) {
    const arr = this.getAllBookingsForUser(uid);
    const idx = arr.findIndex(b => b.id === bookingId);
    if (idx === -1) return { success: false, message: 'Booking not found' };

    const booking = arr[idx];
    const refund = this.computeRefundForCancellation(booking);
    booking.cancelled = true;
    booking.cancelledAt = new Date().toISOString();
    booking.refund = { percent: refund.refundPercent, amount: refund.refundAmount };

    arr[idx] = booking;
    localStorage.setItem(`userBookings_${uid}`, JSON.stringify(arr));
    return { success: true, booking, refund };
  }

  onImageError() {
    // If image can't be loaded, clear selectedPlaceImage but keep selectedPlace metadata
    this.selectedPlaceImage = null;
    if (this.selectedPlace) {
      this.selectedPlace.image = undefined;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.autocomplete-dropdown') && !target.closest('.destination-input')) {
      this.showDropdown = false;
    }
  }
}