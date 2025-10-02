import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms'; // For ngModel and forms
import { BookingComponent } from './booking.component';

const routes: Routes = [
  { path: '', component: BookingComponent } // Default route for booking page
];

@NgModule({
  declarations: [
    BookingComponent, // Declare the component here
  ],
  imports: [
    CommonModule,
    FormsModule,       // Required for forms
    RouterModule.forChild(routes), // Lazy-loaded routing
  ]
})
export class BookingModule {}
