import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import emailjs from '@emailjs/browser';

export interface BookingData {
  id?: string;
  userId: string;
  name: string;
  destination: string;
  date: string;
  people: number;
  price: number;
  status?: string;
  notes?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  getAllBookingsForUser(uid: any): BookingData[] {
    throw new Error('Method not implemented.');
  }
  setBookingsInLocalStorage(uid: any, bookings: BookingData[]) {
    throw new Error('Method not implemented.');
  }

  private readonly LOCAL_KEY = 'userBookings';

  constructor(private firestore: AngularFirestore) {}

  // ✅ Add booking to Firestore and save to localStorage
  async addBooking(data: BookingData): Promise<void> {
    const booking: BookingData = {
      ...data,
      status: data.status || 'Pending',
      notes: data.notes || ''
    };

    try {
      const docRef = await this.firestore.collection('bookings').add(booking);
      booking.id = docRef.id;
      console.log('✅ Booking saved with ID:', docRef.id);

      // Save to localStorage
      this.saveBookingToLocalStorage(booking);

      // Send confirmation email
      await this.sendBookingMail(booking);

    } catch (e) {
      console.error('❌ Failed to add booking:', e);
      throw e;
    }
  }

  // ✅ Save booking to localStorage
  private saveBookingToLocalStorage(booking: BookingData) {
    let bookings: BookingData[] = JSON.parse(localStorage.getItem(this.LOCAL_KEY) || '[]');
    bookings.push(booking);
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(bookings));
  }

  // ✅ Get bookings from localStorage
  getBookingsFromLocalStorage(): BookingData[] {
    return JSON.parse(localStorage.getItem(this.LOCAL_KEY) || '[]');
  }

  // ✅ Clear localStorage bookings
  clearLocalBookings() {
    localStorage.removeItem(this.LOCAL_KEY);
  }

  // ✅ Get all bookings for user from Firestore
  getUserBookings(userId: string): Observable<BookingData[]> {
    return this.firestore
      .collection<BookingData>('bookings', ref => ref.where('userId', '==', userId))
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as BookingData;
            const id = a.payload.doc.id;
            return {
              id,
              ...data,
              status: data.status || 'Pending',
              notes: data.notes || ''
            };
          })
        )
      );
  }

  // ✅ Cancel/Delete booking
  deleteBooking(bookingId: string): Observable<void> {
    if (!bookingId) throw new Error('Missing booking ID');
    const docRef = this.firestore.doc(`bookings/${bookingId}`);
    return from(docRef.delete());
  }

  // ✅ Send booking confirmation email
  async sendBookingMail(data: BookingData): Promise<void> {
    if (!data.email) return;

    const params = {
      customer_name: data.name,
      customer_email: data.email,
      destination: data.destination,
      travel_date: data.date,
      number_of_people: data.people,
      price_per_person: data.price,
      total_amount: data.price * data.people,
      booking_date: new Date().toLocaleDateString(),
      booking_id: data.id || 'TEMP_ID',
      status: data.status || 'Pending',
      notes: data.notes || '',
      company_name: 'Tourizio',
      support_email: 'support@tourizio.com',
      support_phone: '+1 (555) 123-4567',
      from_name: 'Tourizio Official',
      from_email: 'tourizioofficial@gmail.com'
    };

    try {
      await emailjs.send('service_tourizio', 'template_5nkq3q3', params, 'vEluSFRJDT2jlYQ1K');
      console.log('✅ Booking confirmation email sent');
    } catch (err) {
      console.error('❌ Email send failed:', err);
    }
  }
}
