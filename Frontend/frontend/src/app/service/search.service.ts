import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SearchResult {
  id: number;
  name: string;
  type: 'product' | 'supplier' | 'category' | 'sale';
  description: string;
  imageUrl?: string;
  route: string;
}

export interface SearchHistory {
  query: string;
  timestamp: Date;
  type?: SearchFilter;
}

export type SearchFilter = 'all' | 'product' | 'supplier' | 'category' | 'sale' | 'expiring-soon';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrlRoot = environment.apiUrl;
  private apiUrl = `${this.apiUrlRoot}/api/search`;
  
  private localStorageKey = 'pharmacy-search-history';
  private recentSearchesSubject = new BehaviorSubject<SearchHistory[]>([]);
  
  recentSearches$ = this.recentSearchesSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadSearchHistory();
  }
  
  search(query: string, filter: SearchFilter = 'all'): Observable<SearchResult[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    // In a real app, this would call the backend API
    return this.http.get<SearchResult[]>(`${this.apiUrl}?q=${query}&filter=${filter}`).pipe(
      catchError(() => {
        // Return mock data if API call fails
        return of(this.getMockSearchResults(query, filter));
      }),
      tap(() => {
        // Save search to history
        this.saveToHistory({ query, timestamp: new Date(), type: filter !== 'all' ? filter : undefined });
      })
    );
  }
  
  getSuggestions(query: string): Observable<string[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    // In a real app, this would call the backend API
    return this.http.get<string[]>(`${this.apiUrl}/suggestions?q=${query}`).pipe(
      catchError(() => {
        // Return mock suggestions if API call fails
        return of(this.getMockSuggestions(query));
      })
    );
  }
  
  saveToHistory(search: SearchHistory): void {
    const history = this.getSearchHistory();
    
    // Check if the search already exists to avoid duplicates
    const existingIndex = history.findIndex(item => item.query.toLowerCase() === search.query.toLowerCase());
    if (existingIndex !== -1) {
      // Update the timestamp on existing search
      history.splice(existingIndex, 1);
    }
    
    // Add new search to the beginning
    history.unshift(search);
    
    // Keep only the last 10 searches
    const trimmedHistory = history.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem(this.localStorageKey, JSON.stringify(trimmedHistory));
    
    // Update the subject
    this.recentSearchesSubject.next(trimmedHistory);
  }
  
  clearHistory(): void {
    localStorage.removeItem(this.localStorageKey);
    this.recentSearchesSubject.next([]);
  }
  
  private getSearchHistory(): SearchHistory[] {
    const historyStr = localStorage.getItem(this.localStorageKey);
    if (!historyStr) {
      return [];
    }
    
    try {
      const history = JSON.parse(historyStr);
      // Convert string timestamps back to Date objects
      return history.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      console.error('Error parsing search history:', error);
      return [];
    }
  }
  
  private loadSearchHistory(): void {
    const history = this.getSearchHistory();
    this.recentSearchesSubject.next(history);
  }
  
  // Mock data for development
  private getMockSearchResults(query: string, filter: SearchFilter): SearchResult[] {
    const allResults: SearchResult[] = [
      {
        id: 1,
        name: 'Paracétamol 500mg',
        type: 'product',
        description: 'Boîte de 16 comprimés',
        imageUrl: 'assets/images/products/paracetamol.jpg',
        route: '/produit/1'
      },
      {
        id: 2,
        name: 'Ibuprofène 200mg',
        type: 'product',
        description: 'Boîte de 20 comprimés',
        imageUrl: 'assets/images/products/ibuprofen.jpg',
        route: '/produit/2'
      },
      {
        id: 3,
        name: 'Doliprane 1000mg',
        type: 'product',
        description: 'Boîte de 8 comprimés',
        imageUrl: 'assets/images/products/doliprane.jpg',
        route: '/produit/3'
      },
      {
        id: 1,
        name: 'Pharmaceutique Express',
        type: 'supplier',
        description: 'Fournisseur principal de médicaments',
        route: '/fournisseur/1'
      },
      {
        id: 1,
        name: 'Analgésiques',
        type: 'category',
        description: '34 produits',
        route: '/categorie/1'
      },
      {
        id: 145,
        name: 'Vente #145',
        type: 'sale',
        description: '03/05/2025 - 85.50€',
        route: '/vente/145'
      }
    ];
    
    // Filter by type if specified
    let filteredResults = filter === 'all' ? 
      allResults : 
      allResults.filter(result => {
        if (filter === 'expiring-soon') {
          // Mock expiring products
          return result.type === 'product' && [1, 3].includes(result.id);
        }
        return result.type === filter;
      });
    
    // Filter by query (case-insensitive)
    const lowerQuery = query.toLowerCase();
    filteredResults = filteredResults.filter(result => 
      result.name.toLowerCase().includes(lowerQuery) || 
      result.description.toLowerCase().includes(lowerQuery)
    );
    
    return filteredResults;
  }
  
  private getMockSuggestions(query: string): string[] {
    const allSuggestions = [
      'Paracétamol', 'Paracétamol 500mg', 'Paracétamol 1000mg',
      'Ibuprofène', 'Ibuprofène 200mg', 'Ibuprofène 400mg',
      'Doliprane', 'Doliprane 500mg', 'Doliprane 1000mg',
      'Aspirine', 'Aspirine 500mg', 'Aspirine vitamine C',
      'Advil', 'Dafalgan', 'Efferalgan',
      'Antalgique', 'Anti-inflammatoire', 'Antibiotique',
      'Antihistaminique', 'Antiseptique', 'Vermifuge',
      'Pharmaceutique Express', 'MediSupply', 'PharmaGroup',
      'Analgésiques', 'Vitamines', 'Dermatologie'
    ];
    
    const lowerQuery = query.toLowerCase();
    return allSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(lowerQuery))
      .slice(0, 5); // Return only the first 5 suggestions
  }
}