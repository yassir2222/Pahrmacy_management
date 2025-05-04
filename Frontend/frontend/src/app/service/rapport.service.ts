import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
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
      .get<Vente[]>(`${this.apiUrl}/ventes`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère tous les produits
   */
  getProduits(): Observable<Produit[]> {
    return this.http
      .get<Produit[]>(`${this.apiUrl}/produits/all`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Récupère tous les lots de stock
   */
  getLots(): Observable<LotDeStock[]> {
    return this.http
      .get<LotDeStock[]>(`${this.apiUrl}/lots`)
      .pipe(catchError(this.handleError));
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
