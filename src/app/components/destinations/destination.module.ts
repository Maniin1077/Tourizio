import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestinationsComponent } from './destinations.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Routes for Destinations Module
const routes: Routes = [
  { path: '', component: DestinationsComponent } // Default route for this module
];

@NgModule({
  declarations: [
    DestinationsComponent, // Main component for destinations page
  ],
  imports: [
    CommonModule,
    FormsModule,              // Template-driven forms
    ReactiveFormsModule,      // Reactive forms
    RouterModule.forChild(routes) // Lazy-loadable child routes
  ],
  exports: [RouterModule],     // Export RouterModule to keep routing consistent
})
export class DestinationsModule { }
