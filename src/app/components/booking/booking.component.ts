import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

interface Place {
  id: number;
  name: string;
  location: string;
  price: number;
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

  totalPrice = 0;
  private filterDebounceTimer: any = null;
  estimatedAmount: any;
  isFirstBooking: any;

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
          this.allPlaces = Object.values(data.placesMap).flat() as Place[];
        } else if (Array.isArray(data)) {
          this.allPlaces = data as Place[];
        }
      })
      .catch(err => console.error('Error loading places JSON', err));

    this.onVehicleTypeChange(); // initialize vehicle model list
  }

  filterDestinations() {
    const query = (this.booking.destination || '').toLowerCase().trim();
    if (this.filterDebounceTimer) clearTimeout(this.filterDebounceTimer);

    this.filterDebounceTimer = setTimeout(() => {
      if (!query) {
        this.filteredDestinations = [];
        this.showDropdown = false;
        this.selectedPlace = null;
        this.updateTotalPrice();
        return;
      }

      this.filteredDestinations = this.allPlaces
        .filter(place => place.name.toLowerCase().includes(query))
        .slice(0, 8);
      this.showDropdown = this.filteredDestinations.length > 0;
    }, 180);
  }

  selectDestination(place: Place) {
    this.selectedPlace = place;
    this.booking.destination = place.name;
    this.showDropdown = false;
    this.updateTotalPrice();
  }

  hideDropdownDelayed() {
    setTimeout(() => (this.showDropdown = false), 150);
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

updateTotalPrice() {
  const days = Math.max(1, Number(this.booking.days || 1));
  const people = Number(this.booking.people || 0);

  if (!this.selectedPlace || !this.booking.date || people <= 0) {
    this.totalPrice = 0;
    return;
  }

  // ✅ Get per-day destination price correctly
  // Example: if Tirupati Temple = ₹7500 for 2 days, dummydata.json might have "days": 2
  // So perDayPrice = 7500 / 2
  let perDayDestinationPrice = this.selectedPlace.price;
  if ((this.selectedPlace as any).days && (this.selectedPlace as any).days > 0) {
    perDayDestinationPrice = this.selectedPlace.price / (this.selectedPlace as any).days;
  }

  const destinationCost = perDayDestinationPrice * people * days;

  const vehicleCost = this.selectedVehicleModel
    ? this.selectedVehicleModel.pricePerDay * days
    : 0;

  this.totalPrice = Math.round((destinationCost + vehicleCost) * 100) / 100;
}

getDiscountedAmount(): number {
  const total = this.estimatedAmount;
  if (this.isFirstBooking) {
    return total * 0.15;
  }
  return 0;
}

getTotalAmount(): number {
  return this.estimatedAmount - this.getDiscountedAmount();
}


  get showTotal(): boolean {
    const nameFilled = !!this.booking.name.trim();
    const dateFilled = !!this.booking.date.trim();
    const peopleOK = Number(this.booking.people || 0) > 0;
    const destOK = !!this.selectedPlace;
    const vehicleOK =
      this.selectedVehicleType === 'No Vehicle' ||
      (this.selectedVehicleModel !== null && !!this.selectedVehicleModel);

    return nameFilled && dateFilled && peopleOK && destOK && vehicleOK;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  onInputChange() {
    if (this.booking.destination && this.selectedPlace && this.selectedPlace.name !== this.booking.destination) {
      this.selectedPlace = null;
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

    const bookingData = {
      userId: currentUser.uid,
      name: this.booking.name,
      destination: this.selectedPlace.name,
      date: this.booking.date,
      people: Number(this.booking.people),
      days: Math.max(1, Number(this.booking.days || 1)),
      vehicle:
        this.selectedVehicleType === 'No Vehicle'
          ? 'No Vehicle'
          : this.selectedVehicleModel?.model || this.selectedVehicleType,
      totalPrice: this.totalPrice,
      email: currentUser.email || '',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    this.router.navigate(['/payment']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('.dest-dropdown') && !target.closest('.destination-input')) {
      this.showDropdown = false;
    }
  }
}
