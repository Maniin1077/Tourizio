import { Component, Input, AfterViewInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-mini-map',
  templateUrl: './mini-map.component.html',
  styleUrls: ['./mini-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiniMapComponent implements AfterViewInit, OnDestroy {
  @Input() lat!: number;
  @Input() lng!: number;
  @Input() zoom: number = 13;
  @Input() mapId!: string;
  @Input() placeName?: string;
  @Input() markerColor: string = '#008080'; // Default Teal

  private map!: L.Map;

  ngAfterViewInit(): void {
    if (!this.mapId) {
      console.error('Map ID is required for MiniMapComponent!');
      return;
    }
    this.initializeMap();
  }

  private initializeMap(): void {
    const mapElement = document.getElementById(this.mapId);
    if (!mapElement) {
      console.error(`Map element with ID ${this.mapId} not found`);
      return;
    }

    // Initialize map
    this.map = L.map(this.mapId, {
      center: [this.lat, this.lng],
      zoom: this.zoom,
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);

    // Add custom marker
    const marker = L.marker([this.lat, this.lng], {
      icon: this.createCustomIcon(this.markerColor)
    }).addTo(this.map);

    // Optional popup
    if (this.placeName) {
      marker.bindPopup(`<b>${this.placeName}</b>`).openPopup();
    }

    // Ensure proper rendering
    setTimeout(() => this.map.invalidateSize(), 100);
  }

  private createCustomIcon(color: string): L.DivIcon {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="marker-pin" style="background: ${color};">
          <div class="marker-dot"></div>
        </div>
      `,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40]
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
