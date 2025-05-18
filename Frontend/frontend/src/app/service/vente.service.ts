import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Produit } from '../models/Produit';
import { User } from '../models/User';
import { Vente } from '../models/Vente';
import { VenteRequest } from '../models/VenteRequest'; // Import VenteRequest
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VenteService {
  private apiUrl = `${environment.apiUrl}/ventes`; // URL directe vers le VenteController backend
  private produitsFullUrl = `${environment.apiUrl}/produits/all`; // Supposant que /api/produits existe pour tous les produits
  private utilisateursFullUrl = `${environment.apiUrl}/users`; // Supposant que /api/users existe

  constructor(private http: HttpClient) {}

  getProduitsDisponiblesPourVente(): Observable<Produit[]> {

    return this.http.get<Produit[]>(`${this.produitsFullUrl}`)
      .pipe(
        tap(data => console.log('Produits (pour vente) chargés:', data.length)),
        catchError(this.handleError)
      );
  }

  getUtilisateursPourVente(): Observable<User[]> {
    return this.http.get<User[]>(this.utilisateursFullUrl) // ou un endpoint spécifique pour les vendeurs
      .pipe(
        tap(data => console.log('Utilisateurs (pour vente) chargés:', data.length)),
        catchError(this.handleError)
      );
  }


  creerVente(venteRequest: VenteRequest): Observable<Vente | string> { // Le backend peut retourner un string en cas d'erreur 400
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Vente>(this.apiUrl, venteRequest, httpOptions)
      .pipe(
        tap(data => console.log('Vente enregistrée:', data)),
        catchError(this.handleErrorExtended) // Utiliser un handler qui peut retourner string
      );
  }


  getAllVentes(): Observable<Vente[]> {
    return this.http.get<Vente[]>(this.apiUrl)
      .pipe(
        tap(data => console.log('Historique des ventes chargé:', data.length)),
        catchError(this.handleError)
      );
  }

  getVenteById(id: number): Observable<Vente> {
    return this.http.get<Vente>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(data => console.log('Vente chargée:', data)),
        catchError(this.handleError)
      );
  }

 /**
   * Met à jour une vente existante.
   */
  updateVente(id: number, venteRequest: VenteRequest): Observable<Vente | string> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    return this.http.put<Vente>(`${this.apiUrl}/${id}`, venteRequest, httpOptions)
      .pipe(
        tap(data => console.log('Vente mise à jour:', data)),
        catchError(this.handleErrorExtended)
      );
  }

  /**
   * Supprime une vente.
   */


  private handleErrorExtended(error: HttpErrorResponse): Observable<never | string> {
    let errorMessage = 'Une erreur inconnue est survenue!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion ou la disponibilité du backend.';
      } else if (typeof error.error === 'string' && error.error.trim() !== '') {
        // Si le corps de l'erreur est une chaîne (souvent le cas pour les badRequest du backend)
        errorMessage = error.error;
      } else {
        errorMessage = `Code d'erreur ${error.status}: ${error.statusText || 'Erreur serveur'}`;
      }
    }
    console.error('Erreur détaillée du service:', error); // Log l'objet erreur complet
    console.error('Message d\'erreur traité:', errorMessage);
    return throwError(() => errorMessage);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur inconnue est survenue!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage = 'Impossible de contacter le serveur.';
      } else if (typeof error.error === 'string' && error.error.trim() !== '') {
        errorMessage = error.error;
      } else {
        errorMessage = `Code d'erreur ${error.status}: ${error.statusText || 'Erreur serveur'}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
    deleteVente(id: number): Observable<void | string> { // Backend returns 204 No Content (void) or error string
    return this.http.delete<void>(`${this.apiUrl}/${id}`) // HTTP DELETE ne renvoie généralement pas de corps pour void
      .pipe(
        tap(() => console.log(`Vente ${id} supprimée`)),
        catchError(this.handleErrorExtended) // handleErrorExtended peut gérer les erreurs textuelles
      );
  }
}