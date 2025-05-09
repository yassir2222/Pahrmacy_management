import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacieGardeService } from '../../service/pharmacie-garde.service';
import { PharmacieGarde } from '../../models/PharmacieGarde';
import { PharmacieGardeWithLocation } from '../../models/PharmacieGardeWithLocation';
import * as L from 'leaflet';

@Component({
  selector: 'app-pharmacy-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="map-container">
      <div class="map-header">
        <h2>Carte des pharmacies de garde</h2>
        <div class="map-controls">
          <div class="search-pharmacy">
            <input 
              type="text" 
              placeholder="Rechercher une pharmacie..."
              [(ngModel)]="searchQuery"
              (input)="filterPharmacies()"
              class="map-search-input"
            />
            <i class="bx bx-search"></i>
          </div>
          <div class="filter-container">
            <button class="filter-btn" (click)="toggleFilterPanel()">
              <i class="bx bx-filter"></i> Filtres
            </button>
            <div class="filter-panel" *ngIf="showFilterPanel">
              <div class="filter-group">
                <h4>Pharmacies de garde</h4>
                <label>
                  <input type="checkbox" [(ngModel)]="filterOptions.showOnDuty" (change)="applyFilters()" />
                  Afficher uniquement les pharmacies de garde
                </label>
              </div>
              <div class="filter-group">
                <h4>Distance</h4>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.5" 
                  [(ngModel)]="filterOptions.maxDistance" 
                  (input)="applyFilters()"
                />
                <span>{{ filterOptions.maxDistance }} km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="map-wrapper">
        <div #mapElement id="pharmacy-map"></div>
      </div>
      
      <div class="pharmacy-info" *ngIf="selectedPharmacy">
        <div class="info-header">
          <h3>{{ selectedPharmacy.nomPharmacie }}</h3>
          <button class="close-btn" (click)="closePharmacyInfo()">
            <i class="bx bx-x"></i>
          </button>
        </div>
        <div class="info-content">
          <div class="info-item">
            <i class="bx bx-map"></i>
            <span>{{ selectedPharmacy.adresse || 'Adresse non disponible' }}</span>
          </div>
          <div class="info-item" *ngIf="selectedPharmacy.telephone">
            <i class="bx bx-phone"></i>
            <span>{{ selectedPharmacy.telephone }}</span>
          </div>
          <div class="info-item" *ngIf="selectedPharmacy.periode">
            <i class="bx bx-time"></i>
            <span>Période: {{ selectedPharmacy.periode }}</span>
          </div>
          <div class="info-item" *ngIf="selectedPharmacy.isOnDuty">
            <i class="bx bx-check-circle on-duty"></i>
            <span class="on-duty">De garde aujourd'hui</span>
          </div>
          <div class="action-buttons">
            <button class="primary-btn" (click)="getDirections(selectedPharmacy)">
              <i class="bx bx-directions"></i> Itinéraire
            </button>
            <button class="secondary-btn" (click)="callPharmacy(selectedPharmacy)" *ngIf="selectedPharmacy.telephone">
              <i class="bx bx-phone-call"></i> Appeler
            </button>
          </div>
        </div>
      </div>
      
      <div class="list-view" [class.active]="showListView">
        <div class="list-header">
          <h3>Pharmacies à proximité</h3>
          <button class="toggle-btn" (click)="toggleListView()">
            <i class="bx" [ngClass]="showListView ? 'bx-chevron-down' : 'bx-chevron-up'"></i>
          </button>
        </div>
        <div class="pharmacy-list" *ngIf="showListView">
          <div 
            class="pharmacy-list-item" 
            *ngFor="let pharmacy of filteredPharmacies" 
            (click)="selectPharmacy(pharmacy)"
            [class.active]="selectedPharmacy && selectedPharmacy.id === pharmacy.id"
            [class.on-duty]="pharmacy.isOnDuty"
          >
            <div class="pharmacy-list-info">
              <h4>{{ pharmacy.nomPharmacie }}</h4>
              <p>{{ pharmacy.adresse || 'Adresse non disponible' }}</p>
              <span class="distance" *ngIf="pharmacy.distance">{{ pharmacy.distance | number:'1.1-1' }} km</span>
            </div>
            <div class="pharmacy-status" *ngIf="pharmacy.isOnDuty">
              <span class="on-duty-badge">De garde</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,  styles: [`
    .map-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .map-header {
      padding: 16px;
      background-color: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      z-index: 10;
    }
    
    .map-header h2 {
      margin: 0 0 12px 0;
      color: #2a4365;
      font-size: 1.2rem;
    }
    
    .map-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .search-pharmacy {
      position: relative;
      flex: 1;
      min-width: 200px;
    }
    
    .map-search-input {
      width: 100%;
      padding: 10px 16px 10px 36px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background-color: #f8f9fa;
      color: #2d3748;
      font-size: 0.9rem;
    }
    
    .search-pharmacy i {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #718096;
      font-size: 1rem;
    }
    
    .filter-container {
      position: relative;
    }
    
    .filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 16px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      background-color: #f8f9fa;
      color: #2d3748;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .filter-btn:hover {
      background-color: #edf2f7;
    }
    
    .filter-panel {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      padding: 16px;
      z-index: 100;
      width: 250px;
    }
    
    .filter-group {
      margin-bottom: 16px;
    }
    
    .filter-group:last-child {
      margin-bottom: 0;
    }
    
    .filter-group h4 {
      margin: 0 0 8px 0;
      font-size: 0.9rem;
      color: #2d3748;
    }
    
    .filter-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: #4a5568;
    }
    
    .map-wrapper {
      flex: 1;
      position: relative;
    }
    
    #pharmacy-map {
      height: 100%;
      width: 100%;
    }
    
    .pharmacy-info {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 320px;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      z-index: 20;
      opacity: 0;
      transform: translateY(-10px);
      animation: slideIn 0.3s forwards;
    }
    
    @keyframes slideIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .info-header {
      padding: 16px;
      background-color: #3182ce;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .info-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 24px;
      height: 24px;
      border-radius: 50%;
    }
    
    .close-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .info-content {
      padding: 16px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      color: #4a5568;
    }
    
    .info-item i {
      font-size: 1.2rem;
      color: #718096;
      min-width: 24px;
      text-align: center;
    }
    
    .on-duty {
      color: #48bb78 !important;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    
    .primary-btn, .secondary-btn {
      flex: 1;
      padding: 10px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    .primary-btn {
      background-color: #3182ce;
      color: white;
    }
    
    .primary-btn:hover {
      background-color: #2c5282;
    }
    
    .secondary-btn {
      background-color: #f8f9fa;
      color: #2d3748;
      border: 1px solid #e2e8f0;
    }
    
    .secondary-btn:hover {
      background-color: #edf2f7;
    }
    
    .list-view {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #ffffff;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
      z-index: 15;
      transform: translateY(calc(100% - 50px));
      transition: transform 0.3s ease;
    }
    
    .list-view.active {
      transform: translateY(0);
    }
    
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
    }
    
    .list-header h3 {
      margin: 0;
      font-size: 1rem;
    }
    
    .toggle-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #718096;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .pharmacy-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .pharmacy-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .pharmacy-list-item:last-child {
      border-bottom: none;
    }
    
    .pharmacy-list-item:hover {
      background-color: #edf2f7;
    }
    
    .pharmacy-list-item.active {
      background-color: #ebf8ff;
      border-left: 3px solid #3182ce;
    }
    
    .pharmacy-list-item.on-duty {
      background-color: #f0fff4;
    }
    
    .pharmacy-list-info {
      flex: 1;
    }
    
    .pharmacy-list-info h4 {
      margin: 0 0 4px 0;
      font-size: 0.95rem;
      color: #2d3748;
    }
    
    .pharmacy-list-info p {
      margin: 0;
      font-size: 0.8rem;
      color: #718096;
    }
    
    .distance {
      font-size: 0.75rem;
      color: #718096;
      margin-top: 4px;
      display: inline-block;
    }
    
    .pharmacy-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    
    .on-duty-badge {
      background-color: #48bb78;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 500;
    }
    
    /* Leaflet custom styles */
    :host ::ng-deep .leaflet-popup-content-wrapper {
      border-radius: 8px;
      padding: 0;
    }
    
    :host ::ng-deep .leaflet-popup-content {
      margin: 0;
      width: 200px !important;
    }
    
    :host ::ng-deep .pharmacy-popup {
      padding: 12px;
    }
    
    :host ::ng-deep .pharmacy-popup h4 {
      margin: 0 0 8px 0;
      font-size: 1rem;
    }
    
    :host ::ng-deep .pharmacy-popup-info {
      font-size: 0.85rem;
      color: #4a5568;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    :host ::ng-deep .pharmacy-popup-actions {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
    }
    
    :host ::ng-deep .popup-btn {
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    :host ::ng-deep .details-btn {
      background-color: #3182ce;
      color: white;
    }
  `]
})
export class PharmacyMapComponent implements OnInit, AfterViewInit {
  @ViewChild('mapElement') mapElement!: ElementRef;
  
  pharmacies: PharmacieGardeWithLocation[] = [];
  filteredPharmacies: PharmacieGardeWithLocation[] = [];
  selectedPharmacy: PharmacieGardeWithLocation | null = null;
  
  map: L.Map | null = null;
  markers: L.Marker[] = [];
  userMarker: L.Marker | null = null;
  userLocation: L.LatLng | null = null;
  
  searchQuery: string = '';
  showFilterPanel: boolean = false;
  showListView: boolean = false;
  
  filterOptions = {
    showOnDuty: false,
    maxDistance: 5 // km
  };
  
  // Icon definitions
  pharmacyIcon = L.icon({
    iconUrl: 'assets/icons/pharmacy-marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
  
  pharmacyOnDutyIcon = L.icon({
    iconUrl: 'assets/icons/pharmacy-on-duty-marker.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
  
  userLocationIcon = L.icon({
    iconUrl: 'assets/icons/user-location-marker.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
  
  constructor(private pharmacieService: PharmacieGardeService) { }

  ngOnInit(): void {
    this.loadPharmacies();
  }
  
  ngAfterViewInit(): void {
    this.initMap();
    this.getUserLocation();
  }
  
  initMap(): void {
    // Initialize the map
    this.map = L.map(this.mapElement.nativeElement, {
      center: [31.7917, -7.0926], // Morocco center coordinates
      zoom: 6,
      zoomControl: false
    });
    
    // Add zoom control to top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);
    
    // Add tile layer (using OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);
  }
    loadPharmacies(): void {
    this.pharmacieService.getAllPharmaciesGarde().subscribe({
      next: (data: PharmacieGarde[]) => {
        // For demo purposes, let's add location coordinates and on-duty status
        this.pharmacies = data.map(pharmacy => {
          // Creates a PharmacieGardeWithLocation with random coordinates
          return {
            ...pharmacy,
            isOnDuty: this.isPharmacyOnDuty(pharmacy), // Determine by period
            // Add random coordinates for Morocco
            latitude: this.getRandomLatitude(),
            longitude: this.getRandomLongitude(),
            distance: 0 // Will be calculated when user location is available
          };
        });
        
        this.filteredPharmacies = [...this.pharmacies];
        this.addPharmacyMarkers();
      },
      error: (error: any) => {
        console.error('Error loading pharmacies', error);
      }
    });
  }
  
  // Determine if a pharmacy is on duty based on its period and current time
  isPharmacyOnDuty(pharmacy: PharmacieGarde): boolean {
    if (!pharmacy.isActive) return false;
    
    // For demo purposes, let's consider all active ones as on duty
    return pharmacy.isActive === true;
  }
  
  getRandomLatitude(): number {
    // Random latitude in Morocco
    return 30 + Math.random() * 6;
  }
  
  getRandomLongitude(): number {
    // Random longitude in Morocco
    return -11 + Math.random() * 10;
  }
  
  addPharmacyMarkers(): void {
    if (!this.map) return;
    
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    
    // Add markers for each pharmacy
    this.filteredPharmacies.forEach(pharmacy => {
      if (pharmacy.latitude && pharmacy.longitude) {
        const marker = L.marker([pharmacy.latitude, pharmacy.longitude], {
          icon: pharmacy.isOnDuty ? this.pharmacyOnDutyIcon : this.pharmacyIcon
        });
        
        // Custom popup content
        const popupContent = this.createPopupContent(pharmacy);
        marker.bindPopup(popupContent);
        
        marker.on('click', () => {
          this.selectPharmacy(pharmacy);
        });
        
        marker.addTo(this.map!);
        this.markers.push(marker);
      }
    });
  }
    createPopupContent(pharmacy: PharmacieGardeWithLocation): string {
    return `
      <div class="pharmacy-popup">
        <h4>${pharmacy.nomPharmacie || 'Pharmacie'}</h4>
        <div class="pharmacy-popup-info">
          <span>${pharmacy.adresse || 'Adresse non disponible'}</span>
          <span>${pharmacy.ville || ''}</span>
          ${pharmacy.periode ? `<span>Période: ${pharmacy.periode}</span>` : ''}
          ${pharmacy.isOnDuty ? '<span><strong class="on-duty">De garde aujourd\'hui</strong></span>' : ''}
        </div>
        <div class="pharmacy-popup-actions">
          <button class="popup-btn details-btn" onclick="document.dispatchEvent(new CustomEvent('pharmacy-details', { detail: ${pharmacy.id || 0} }))">
            Détails
          </button>
        </div>
      </div>
    `;
  }
  
  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.userLocation = L.latLng(latitude, longitude);
          
          if (this.map) {
            // Add user marker
            if (this.userMarker) {
              this.userMarker.remove();
            }
            
            this.userMarker = L.marker([latitude, longitude], {
              icon: this.userLocationIcon
            });
            
            this.userMarker.addTo(this.map);
            
            // Center map on user location with zoom level 13
            this.map.setView([latitude, longitude], 13);
            
            // Calculate distances
            this.calculateDistances();
          }
        },
        (error) => {
          console.error('Error getting user location', error);
        }
      );
    }
  }
  
  calculateDistances(): void {
    if (!this.userLocation) return;
    
    this.pharmacies = this.pharmacies.map(pharmacy => {
      if (pharmacy.latitude && pharmacy.longitude) {
        const pharmacyLatLng = L.latLng(pharmacy.latitude, pharmacy.longitude);
        const distance = this.userLocation!.distanceTo(pharmacyLatLng) / 1000; // Convert to km
        return { ...pharmacy, distance };
      }
      return pharmacy;
    });
    
    // Sort by distance
    this.pharmacies.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    // Apply current filters
    this.applyFilters();
  }
  
  filterPharmacies(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPharmacies = [...this.pharmacies];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredPharmacies = this.pharmacies.filter(pharmacy => 
        (pharmacy.nomPharmacie && pharmacy.nomPharmacie.toLowerCase().includes(query)) || 
        (pharmacy.adresse && pharmacy.adresse.toLowerCase().includes(query)) ||
        (pharmacy.ville && pharmacy.ville.toLowerCase().includes(query))
      );
    }
    
    this.applyFilters(false);
  }
  
  applyFilters(updateMap: boolean = true): void {
    let filtered = [...this.pharmacies];
    
    // Apply search query if it exists
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(pharmacy => 
        (pharmacy.nomPharmacie && pharmacy.nomPharmacie.toLowerCase().includes(query)) || 
        (pharmacy.adresse && pharmacy.adresse.toLowerCase().includes(query)) ||
        (pharmacy.ville && pharmacy.ville.toLowerCase().includes(query))
      );
    }
    
    // Apply on-duty filter
    if (this.filterOptions.showOnDuty) {
      filtered = filtered.filter(pharmacy => pharmacy.isOnDuty);
    }
    
    // Apply distance filter if user location is available
    if (this.userLocation) {
      filtered = filtered.filter(pharmacy => 
        !pharmacy.distance || pharmacy.distance <= this.filterOptions.maxDistance
      );
    }
    
    this.filteredPharmacies = filtered;
    
    if (updateMap) {
      this.addPharmacyMarkers();
    }
  }
  
  selectPharmacy(pharmacy: PharmacieGardeWithLocation): void {
    this.selectedPharmacy = pharmacy;
    
    // Find the marker for this pharmacy and open its popup
    if (this.map) {
      const marker = this.markers.find(m => {
        const latLng = m.getLatLng();
        return pharmacy.latitude && pharmacy.longitude && 
               latLng.lat === pharmacy.latitude && 
               latLng.lng === pharmacy.longitude;
      });
      
      if (marker) {
        this.map.setView(marker.getLatLng(), 15);
        marker.openPopup();
      }
    }
  }
  
  closePharmacyInfo(): void {
    this.selectedPharmacy = null;
  }
  
  toggleFilterPanel(): void {
    this.showFilterPanel = !this.showFilterPanel;
  }
  
  toggleListView(): void {
    this.showListView = !this.showListView;
  }
  
  getDirections(pharmacy: PharmacieGardeWithLocation): void {
    if (pharmacy.latitude && pharmacy.longitude) {
      // Open Google Maps directions in a new tab
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`, '_blank');
    }
  }
  
  callPharmacy(pharmacy: PharmacieGardeWithLocation): void {
    // Handle phone call
    if (pharmacy.telephone) {
      window.open(`tel:${pharmacy.telephone}`);
    }
  }
  
  // Custom event handler for popup button clicks
  ngAfterContentInit() {
    document.addEventListener('pharmacy-details', (event: any) => {
      const pharmacyId = event.detail;
      const pharmacy = this.pharmacies.find(p => p.id === pharmacyId);
      if (pharmacy) {
        this.selectPharmacy(pharmacy);
      }
    });
  }
  
  ngOnDestroy() {
    document.removeEventListener('pharmacy-details', () => {});
  }
}
