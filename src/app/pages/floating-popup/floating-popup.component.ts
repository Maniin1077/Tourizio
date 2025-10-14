import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-floating-popup',
  templateUrl: './floating-popup.component.html',
  styleUrls: ['./floating-popup.component.scss'],
})
export class FloatingPopupComponent implements OnInit {
  showPromo = false;

  ngOnInit(): void {
    // Show popup after 1 second
    setTimeout(() => (this.showPromo = true), 1000);

    // Hide after 120 seconds
    setTimeout(() => (this.showPromo = false), 120000);
  }

  closePromo(): void {
    this.showPromo = false;
  }
}
