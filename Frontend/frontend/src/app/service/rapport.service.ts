import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Vente } from '../models/Vente';
import { Produit } from '../models/Produit';
import { LotDeStock } from '../models/LotDeStock';

@Injectable({
  providedIn: 'root',
})
export class RapportService {
  private apiUrl = 'http://localhost:8083/api';

  constructor(private http: HttpClient) {}

  /**
   * Récupère les ventes sur une période donnée
   */
  getVentes(dateDebut?: Date, dateFin?: Date): Observable<Vente[]> {
    let params = new HttpParams();

    if (dateDebut) {
      params = params.set('start', this.formatDate(dateDebut));
    }

    if (dateFin) {
      params = params.set('end', this.formatDate(dateFin));
    }

    return this.http
      .get<Vente[]>(`${this.apiUrl}/ventes/all`, { params })
      .pipe(
        tap(ventes => console.log(`${ventes.length} ventes chargées`)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère tous les produits
   */
  getProduits(): Observable<Produit[]> {
    return this.http
      .get<Produit[]>(`${this.apiUrl}/produits/all`)
      .pipe(
        tap(produits => console.log(`${produits.length} produits chargés`)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère tous les lots de stock
   */
  getLots(): Observable<LotDeStock[]> {
    return this.http
      .get<LotDeStock[]>(`${this.apiUrl}/lots/all`)
      .pipe(
        tap(lots => console.log(`${lots.length} lots chargés`)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère les statistiques résumées pour le dashboard
   */
  getDashboardStats(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/rapports/dashboard`)
      .pipe(
        tap(stats => console.log('Statistiques dashboard chargées')),
        catchError(this.handleError)
      );
  }

  /**
   * Formate une date au format YYYY-MM-DD pour l'API
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}, ` +
                    `Message: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => 
      new Error('Erreur lors de la communication avec le serveur. Veuillez réessayer plus tard.')
    );
  }
}
