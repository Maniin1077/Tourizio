// FILE: payment.module.ts
// Angular Feature Module for Payment Page
// Improved readability, comments, and best practices

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PaymentComponent } from './payment.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
    data: { 
      animation: 'PaymentPage',
      title: 'Secure Payment' // ✅ Page title meta (optional for SEO/UX)
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),

    // ✅ Since PaymentComponent is standalone, we import it directly here
    PaymentComponent 
  ]
})
export class PaymentModule {}
