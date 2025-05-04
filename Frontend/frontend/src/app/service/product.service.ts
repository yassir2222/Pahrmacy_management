/* import { TestBed } from '@angular/core/testing';

import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
}); */

// src/app/service/product.service.ts (Rename to produit.service.ts recommended)
import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Produit } from '../models/Produit'; 
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root' 
})
export class ProductService { 

  private apiUrl = 'http://localhost:8083/api/produits'; 
  

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object 
  ) { }

  getProducts(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl+"/all")
      .pipe(
        tap(data => console.log('Fetched products:', data)), // For debugging
        catchError(this.handleError)
      );
  }

  // GET: Fetch product by ID (optional, if needed)
  getProduct(id: number): Observable<Produit> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Produit>(url)
      .pipe(
        tap(data => console.log(`Fetched product id=${id}`)),
        catchError(this.handleError)
      );
  }

  // POST: Create a new product
  createProduct(product: Produit): Observable<Produit> {
    return this.http.post<Produit>(this.apiUrl+"/add", product)
      .pipe(
        tap((newProduct: Produit) => console.log(`Added product w/ id=${newProduct.id}`)),
        catchError(this.handleError)
      );
  }

  // PUT: Update an existing product
  updateProduct(id: number, product: Produit): Observable<Produit> {
    const url = `${this.apiUrl}"/update/"${id}`;
    return this.http.put<Produit>(url, product)
      .pipe(
        tap(_ => console.log(`Updated product id=${id}`)),
        catchError(this.handleError)
      );
  }

  // DELETE: Delete a product by ID
  deleteProduct(id: number): Observable<void> { // Expect no content back
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.delete<void>(url) // Use <void>
      .pipe(
        tap(_ => console.log(`Deleted product id=${id}`)),
        catchError(this.handleError)
      );
  }

  // DELETE: Delete multiple products by IDs
  deleteSelectedProducts(ids: number[]): Observable<void> {
      const url = `${this.apiUrl}/batch`;
      return this.http.request<void>('delete', url, { body: ids }) 
         .pipe(
            tap(_ => console.log(`Deleted products with ids: ${ids.join(', ')}`)),
            catchError(this.handleError)
        );
  }


  // Basic error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    
    // Check if we're in a browser environment before attempting browser-specific operations
    //if (isPlatformBrowser(this.platformId)) {
      // Browser-only code can go here safely
      if (true) {
      // Utiliser une approche compatible avec SSR (pas de ErrorEvent)
      if (typeof error.error === 'object' && error.error !== null && 'message' in error.error) {
        // Erreur côté client avec un message dans l'objet error
        errorMessage = `Error: ${error.error.message}`;
      } else if (error.status) {
        // Erreur côté serveur avec code d'état
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        if (error.error && typeof error.error === 'string') {
           errorMessage += `\nServer Error: ${error.error}`;
        } 
      } else if (error.message) {
        // Autre type d'erreur avec message
        errorMessage = `Error: ${error.message}`;
      }
      
      console.error(errorMessage);
    } else {
      // Server-side specific handling
      console.error('Server-side error occurred:', error.message);
      errorMessage = 'Server-side error occurred';
    }
    
    return throwError(() => new Error('Something bad happened; please try again later. Details: ' + errorMessage));
  }
}