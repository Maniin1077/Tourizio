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
  constructor(private firestore: AngularFirestore) {}

  // ✅ Add booking to Firestore and return docRef
  async addBooking(data: BookingData): Promise<void> {
    const booking: BookingData = {
      ...data,
      status: data.status || 'Pending',
      notes: data.notes || ''
    };
    try {
      const docRef = await this.firestore.collection('bookings').add(booking);
      // add Firestore ID to object
      booking.id = docRef.id;
      console.log('✅ Booking saved with ID:', docRef.id);
      await this.sendBookingMail(booking);
    } catch (e) {
      console.error('❌ Failed to add booking:', e);
      throw e;
    }
  }

  // ✅ Get all bookings for user
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
    if (!bookingId) {
      console.error('❌ Missing booking ID for delete');
      throw new Error('Missing booking ID');
    }
    const docRef = this.firestore.doc(`bookings/${bookingId}`);
    return from(docRef.delete());
  }

  // ✅ Send booking confirmation mail
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
      await emailjs.send(
        'service_tourizio',
        'template_5nkq3q3',
        params,
        'vEluSFRJDT2jlYQ1K'
      );
      console.log('✅ Booking confirmation email sent');
    } catch (err) {
      console.error('❌ Email send failed:', err);
    }
  }
}
