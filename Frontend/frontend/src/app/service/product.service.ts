// src/app/service/product.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Produit } from '../models/Produit'; 
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root' 
})
export class ProductService { 
  private apiUrlRoot = environment.apiUrl;
  private apiUrl = `${this.apiUrlRoot}/produits`; 
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object 
  ) { }

  getProducts(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.apiUrl}/all`)
      .pipe(
        map(products => {
          // Ensure all products have properly formatted fields
          return products.map(product => this.formatProductData(product));
        }),
        tap(data => console.log('Fetched products:', data)), 
        catchError(this.handleError)
      );
  }

  getProduct(id: number): Observable<Produit> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Produit>(url)
      .pipe(
        map(product => this.formatProductData(product)),
        tap(data => console.log(`Fetched product id=${id}`)),
        catchError(this.handleError)
      );
  }

  createProduct(product: Produit): Observable<Produit> {
    // Create a copy of the product to avoid modifying the original
    const productToSend = {...product};
    
    // Ensure price values are properly formatted for the backend (Java expects BigDecimal)
    if (productToSend.prixVenteTTC !== undefined && productToSend.prixVenteTTC !== null) {
      // Ensure it's a number, not a string
      productToSend.prixVenteTTC = Number(productToSend.prixVenteTTC);
    }
    
    if (productToSend.prixAchatHT !== undefined && productToSend.prixAchatHT !== null) {
      productToSend.prixAchatHT = Number(productToSend.prixAchatHT);
    }
    
    console.log('Attempting to create product with data:', JSON.stringify(productToSend, null, 2));
    return this.http.post<Produit>(`${this.apiUrl}/add`, productToSend)
      .pipe(
        map(product => this.formatProductData(product)),
        tap((newProduct: Produit) => console.log(`Added product successfully with id=${newProduct.id}`)),
        catchError(error => {
          console.error('Failed to create product. Error details:', error);
          if (error.error instanceof Object) {
            console.error('Error body:', JSON.stringify(error.error, null, 2));
          } else if (typeof error.error === 'string') {
            console.error('Error message from server:', error.error);
          }
          return this.handleError(error);
        })
      );
  }

  updateProduct(id: number, product: Produit): Observable<Produit> {
    // Create a copy of the product to avoid modifying the original
    const productToSend = {...product};
    
    // Ensure price values are properly formatted for the backend (Java expects BigDecimal)
    if (productToSend.prixVenteTTC !== undefined && productToSend.prixVenteTTC !== null) {
      productToSend.prixVenteTTC = Number(productToSend.prixVenteTTC);
    }
    
    if (productToSend.prixAchatHT !== undefined && productToSend.prixAchatHT !== null) {
      productToSend.prixAchatHT = Number(productToSend.prixAchatHT);
    }
    
    const url = `${this.apiUrl}/update/${id}`;
    return this.http.put<Produit>(url, productToSend)
      .pipe(
        map(product => this.formatProductData(product)),
        tap(_ => console.log(`Updated product id=${id}`)),
        catchError(this.handleError)
      );
  }


  deleteProduct(id: number): Observable<void> {
    const url = `${this.apiUrl}/delete/${id}`;
    const headers = this.getAuthHeaders();

    console.log(`Attempting to delete product with ID: ${id}. URL: ${url}`);
    // Optional: Log token snippet for debugging, as you had
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('Token for delete starts with:', token.substring(0, 15) + '...');
      } else {
        console.warn('No auth_token found in localStorage for deleteProduct.');
      }
    }


    return this.http.delete<void>(url, { headers })
      .pipe(
        tap(_ => console.log(`Successfully deleted product with id=${id}`)),
        catchError(error => {
          console.error(`Failed to delete product with ID ${id}. Error details:`, error);
          if (error.error instanceof Object) {
            console.error('Error body:', JSON.stringify(error.error, null, 2));
          } else if (typeof error.error === 'string') {
            console.error('Error message from server:', error.error);
          }
          // Specific check from your original code
          if (error.status === 403) {
            console.error('Authorization failed (403). Check if user has delete permissions.');
          }
          return this.handleError(error);
        })
      );
  }

  deleteSelectedProducts(ids: number[]): Observable<void> {
    const url = `${this.apiUrl}/batch`; // Assuming this is your batch delete endpoint
    
    // Use a consistent way to get headers, and ensure Content-Type is set if sending a body
    let headers = this.getAuthHeaders();

    console.log(`Attempting to batch delete products with IDs: [${ids.join(', ')}]. URL: ${url}`);
    // Optional: Log token snippet for debugging
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('Token for batch delete starts with:', token.substring(0, 15) + '...');
      } else {
        console.warn('No auth_token found in localStorage for deleteSelectedProducts.');
      }
    }
    console.log('Sending batch delete request with body:', JSON.stringify(ids, null, 2));


    // Using http.request to explicitly set method to 'DELETE' with a body.
    // Alternatively, some backends/frameworks might allow http.delete(url, { headers, body: ids })
    return this.http.request<void>('delete', url, {
      body: ids,
      headers: headers
    }).pipe(
      tap(_ => console.log(`Successfully batch deleted products with IDs: [${ids.join(', ')}]`)),
      catchError(error => {
        console.error(`Failed to batch delete products with IDs [${ids.join(', ')}]. Error details:`, error);
        if (error.error instanceof Object) {
          console.error('Error body:', JSON.stringify(error.error, null, 2));
        } else if (typeof error.error === 'string') {
          console.error('Error message from server:', error.error);
        }
        // You could add specific status checks here too, e.g., for 403
        if (error.status === 403) {
          console.error('Authorization failed (403) for batch delete. Check permissions.');
        }
        return this.handleError(error);
      })
    );
  }


private getAuthHeaders(): Record<string, string> {
  if (isPlatformBrowser(this.platformId)) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
  }
  return {};
}


  // Helper method to format product data consistently
  private formatProductData(product: Produit): Produit {
    if (!product) return product;
    
    // Make a copy to avoid modifying the original object
    const formattedProduct = {...product};
    
    // Ensure prixVenteTTC is a number
    if (formattedProduct.prixVenteTTC !== undefined && formattedProduct.prixVenteTTC !== null) {
      formattedProduct.prixVenteTTC = Number(formattedProduct.prixVenteTTC);
    }
    
    // Ensure prixAchatHT is a number
    if (formattedProduct.prixAchatHT !== undefined && formattedProduct.prixAchatHT !== null) {
      formattedProduct.prixAchatHT = Number(formattedProduct.prixAchatHT);
    }
    
    // Ensure quantiteTotaleEnStock is a number
    if (formattedProduct.quantiteTotaleEnStock !== undefined && formattedProduct.quantiteTotaleEnStock !== null) {
      formattedProduct.quantiteTotaleEnStock = Number(formattedProduct.quantiteTotaleEnStock);
    } else {
      // Default to 0 if missing
      formattedProduct.quantiteTotaleEnStock = 0;
    }
    
    return formattedProduct;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    
    if (isPlatformBrowser(this.platformId)) {
      if (typeof error.error === 'object' && error.error !== null && 'message' in error.error) {
        errorMessage = `Error: ${error.error.message}`;
      } else if (error.status) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        if (error.error && typeof error.error === 'string') {
           errorMessage += `\nServer Error: ${error.error}`;
        } 
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      console.error(errorMessage);
    } else {
      console.error('Server-side error occurred:', error.message);
      errorMessage = 'Server-side error occurred';
    }
    
    return throwError(() => new Error('Something bad happened; please try again later. Details: ' + errorMessage));
  }
}