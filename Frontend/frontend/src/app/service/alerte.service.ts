import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Produit } from '../models/Produit';
import { LotDeStock } from '../models/LotDeStock';

@Injectable({
  providedIn: 'root',
})
export class AlerteService {
  private apiUrl = 'http://localhost:8083/api';

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les produits depuis l'API
   */
  getProduits(): Observable<Produit[]> {
    return this.http
      .get<Produit[]>(`${this.apiUrl}/produits/all`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère tous les lots de stock depuis l'API
   */
  getLots(): Observable<LotDeStock[]> {
    return this.http
      .get<LotDeStock[]>(`${this.apiUrl}/lots`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: any) {
    console.error('Une erreur est survenue', error);
    return throwError(
      () =>
        new Error(
          'Erreur lors de la communication avec le serveur. Veuillez réessayer plus tard.'
        )
    );
  }
}
