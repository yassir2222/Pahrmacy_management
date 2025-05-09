import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, switchMap, map } from 'rxjs/operators';
import { Subject, Observable, of } from 'rxjs';
import { SearchService, SearchResult, SearchFilter } from '../../service/search.service';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    OverlayPanelModule
  ],
  template: `
    <div class="search-container" [class.active]="isSearchActive">
      <div class="search-input-wrapper">
        <i class="bx bx-search search-icon"></i>
        <input 
          type="text" 
          placeholder="Rechercher..." 
          [(ngModel)]="searchQuery" 
          (input)="onSearchInput()"
          (focus)="onSearchFocus()"
          (keydown.enter)="performSearch()"
          #searchInput
        >
        <div class="search-actions">
          <i *ngIf="searchQuery" class="bx bx-x clear-icon" (click)="clearSearch()"></i>
          <i class="bx bx-microphone voice-icon" (click)="startVoiceSearch()" [class.active]="isListening"></i>
          <i class="bx bx-filter filter-icon" (click)="showFilters($event)"></i>
        </div>
      </div>
      
      <!-- Search Suggestions Dropdown -->
      <div class="search-suggestions" *ngIf="suggestions.length > 0 && isSearchActive">
        <ul>
          <li *ngFor="let suggestion of suggestions" (click)="selectSuggestion(suggestion)">
            <i class="bx bx-history" *ngIf="isFromHistory(suggestion)"></i>
            <span>{{ suggestion }}</span>
          </li>
        </ul>
      </div>
      
      <!-- Search Results Dropdown -->
      <div class="search-results" *ngIf="showResults && searchResults.length > 0">
        <div class="results-header">
          <h4>Résultats pour "{{ lastSearchQuery }}"</h4>
          <span class="results-count">{{ searchResults.length }} trouvés</span>
        </div>
        <ul>
          <li *ngFor="let result of searchResults" [routerLink]="[result.route]" (click)="hideResults()">
            <div class="result-icon" [ngClass]="'icon-' + result.type">
              <i class="bx" [ngClass]="getIconClass(result.type)"></i>
            </div>
            <div class="result-info">
              <div class="result-name">{{ result.name }}</div>
              <div class="result-description">{{ result.description }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Filters Overlay Panel -->
    <p-overlayPanel #filtersPanel>
      <div class="filters-container">
        <h4>Filtres de recherche</h4>
        <div class="filter-options">          <div 
            *ngFor="let filter of availableFilters" 
            class="filter-option" 
            [class.active]="filter.value === activeFilter"
            (click)="selectFilter(filter.value)"
          >
            <i class="bx" [ngClass]="filter.icon"></i>
            <span>{{ filter.label }}</span>
          </div>
        </div>
      </div>
    </p-overlayPanel>
    
    <!-- Voice search feedback -->
    <div class="voice-search-overlay" *ngIf="isListening">
      <div class="voice-search-content">
        <div class="voice-indicator"></div>
        <p>Je vous écoute...</p>
        <p class="voice-text" *ngIf="voiceText">{{ voiceText }}</p>
        <button class="voice-cancel-btn" (click)="stopVoiceSearch()">Annuler</button>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
      width: 100%;
    }
    
    .search-input-wrapper {
      display: flex;
      align-items: center;
      background-color: var(--bg-secondary);
      border-radius: 8px;
      padding: 0 12px;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .search-container.active .search-input-wrapper {
      box-shadow: 0 0 0 2px var(--primary-500);
    }
    
    .search-icon {
      font-size: 1.2rem;
      color: var(--text-muted);
      margin-right: 8px;
    }
    
    .search-container input {
      flex: 1;
      border: none;
      background: transparent;
      height: 40px;
      color: var(--text-primary);
      font-size: 0.9rem;
      outline: none;
      width: 100%;
    }
    
    .search-container input::placeholder {
      color: var(--text-muted);
    }
    
    .search-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .search-actions i {
      font-size: 1.1rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    
    .search-actions i:hover {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
    
    .voice-icon.active {
      color: var(--primary-500);
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: var(--card-bg);
      border-radius: 0 0 8px 8px;
      box-shadow: var(--card-shadow);
      z-index: 100;
      margin-top: 4px;
      overflow: hidden;
    }
    
    .search-suggestions ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .search-suggestions li {
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .search-suggestions li:hover {
      background-color: var(--bg-tertiary);
    }
    
    .search-suggestions i {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background-color: var(--card-bg);
      border-radius: 8px;
      box-shadow: var(--card-shadow);
      z-index: 100;
      margin-top: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .results-header h4 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    .results-count {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .search-results ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .search-results li {
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid var(--border-color);
    }
    
    .search-results li:last-child {
      border-bottom: none;
    }
    
    .search-results li:hover {
      background-color: var(--bg-tertiary);
    }
    
    .result-icon {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .icon-product {
      background-color: var(--primary-100);
      color: var(--primary-700);
    }
    
    .icon-supplier {
      background-color: var(--success-100);
      color: var(--success-700);
    }
    
    .icon-category {
      background-color: var(--warning-100);
      color: var(--warning-700);
    }
    
    .icon-sale {
      background-color: var(--danger-100);
      color: var(--danger-700);
    }
    
    .result-icon i {
      font-size: 1.2rem;
    }
    
    .result-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    
    .result-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .result-description {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .filters-container {
      padding: 12px;
      min-width: 200px;
    }
    
    .filters-container h4 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 0.9rem;
    }
    
    .filter-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .filter-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .filter-option:hover {
      background-color: var(--bg-tertiary);
    }
    
    .filter-option.active {
      background-color: var(--primary-100);
      color: var(--primary-700);
    }
    
    .voice-search-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.7);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .voice-search-content {
      background-color: var(--card-bg);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      width: 300px;
    }
    
    .voice-indicator {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: var(--primary-500);
      margin: 0 auto 16px;
      animation: pulse 1.5s infinite;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .voice-text {
      margin-top: 16px;
      font-style: italic;
    }
    
    .voice-cancel-btn {
      margin-top: 16px;
      background-color: transparent;
      border: 1px solid var(--border-color);
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .voice-cancel-btn:hover {
      background-color: var(--bg-tertiary);
    }
  `]
})
export class AdvancedSearchComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('filtersPanel') filtersPanel: any;
  
  searchQuery: string = '';
  suggestions: string[] = [];
  searchResults: SearchResult[] = [];
  isSearchActive: boolean = false;
  showResults: boolean = false;
  lastSearchQuery: string = '';
  isListening: boolean = false;
  voiceText: string = '';
  
  private searchTerms = new Subject<string>();
  private recognition: any;
    activeFilter: SearchFilter = 'all';
  availableFilters: {label: string, value: SearchFilter, icon: string}[] = [
    { label: 'Tous', value: 'all', icon: 'bx-search-alt' },
    { label: 'Produits', value: 'product', icon: 'bx-capsule' },
    { label: 'Fournisseurs', value: 'supplier', icon: 'bx-building' },
    { label: 'Catégories', value: 'category', icon: 'bx-category' },
    { label: 'Ventes', value: 'sale', icon: 'bx-receipt' },
    { label: 'Expirant bientôt', value: 'expiring-soon', icon: 'bx-time' }
  ];

  constructor(
    private searchService: SearchService,
    private router: Router
  ) { }

  ngOnInit() {
    this.setupSearch();
    this.setupVoiceRecognition();
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // Check if the click is outside the search component
    if (!(event.target as HTMLElement).closest('.search-container')) {
      this.isSearchActive = false;
      this.suggestions = [];
      if (!this.showResults) {
        this.searchQuery = '';
      }
    }
  }
  
  private setupSearch() {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term.trim()) {
          // If search is empty, show recent searches
          return this.searchService.recentSearches$.pipe(
            map(history => history.map(item => item.query))
          );
        }
        // Otherwise get suggestions
        return this.searchService.getSuggestions(term);
      })
    ).subscribe(suggestions => {
      this.suggestions = suggestions;
    });
  }
    private setupVoiceRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Browser supports speech recognition
      const SpeechRecognitionApi = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionApi();
      this.recognition.lang = 'fr-FR';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        this.voiceText = transcript;
        
        if (event.results[0].isFinal) {
          this.searchQuery = transcript;
          this.searchTerms.next(transcript);
          setTimeout(() => {
            this.performSearch();
            this.stopVoiceSearch();
          }, 500);
        }
      };
      
      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        this.stopVoiceSearch();
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }
  
  onSearchInput() {
    this.searchTerms.next(this.searchQuery);
  }
  
  onSearchFocus() {
    this.isSearchActive = true;
    if (!this.searchQuery.trim()) {
      // Show recent searches
      this.searchService.recentSearches$.subscribe(history => {
        this.suggestions = history.map(item => item.query);
      });
    }
  }
  
  performSearch() {
    if (!this.searchQuery.trim()) return;
    
    this.lastSearchQuery = this.searchQuery;
    this.suggestions = [];
    
    this.searchService.search(this.searchQuery, this.activeFilter).subscribe(results => {
      this.searchResults = results;
      this.showResults = true;
    });
  }
  
  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.suggestions = [];
    this.performSearch();
    this.searchInput.nativeElement.focus();
  }
  
  isFromHistory(suggestion: string): boolean {
    // This could be more sophisticated with actual history check
    return true;
  }
  
  clearSearch() {
    this.searchQuery = '';
    this.suggestions = [];
    this.showResults = false;
    this.searchResults = [];
    this.searchInput.nativeElement.focus();
  }
  
  hideResults() {
    this.showResults = false;
    this.isSearchActive = false;
  }
  
  showFilters(event: Event) {
    if (this.filtersPanel) {
      this.filtersPanel.toggle(event);
    }
  }
  
  selectFilter(filter: SearchFilter) {
    this.activeFilter = filter;
    this.filtersPanel.hide();
    
    if (this.searchQuery.trim()) {
      this.performSearch();
    }
  }
  
  startVoiceSearch() {
    if (this.recognition) {
      try {
        this.isListening = true;
        this.voiceText = '';
        this.recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition', error);
        this.isListening = false;
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }
  
  stopVoiceSearch() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
  
  getIconClass(type: string): string {
    switch (type) {
      case 'product': return 'bx-capsule';
      case 'supplier': return 'bx-building';
      case 'category': return 'bx-category';
      case 'sale': return 'bx-receipt';
      default: return 'bx-search-alt';
    }
  }
}
