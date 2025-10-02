import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BlogComponent } from './blog.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: BlogComponent, data: { animation: 'BlogPage' } }
];

@NgModule({
  declarations: [BlogComponent],
  imports: [
    CommonModule,
    FormsModule,        // For search input and future forms
    RouterModule.forChild(routes)
  ],
})
export class BlogModule {}
