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

  private handleErrorExtended(error: HttpErrorResponse): Observable<never | string> {
    let errorMessage = 'Une erreur inconnue est survenue!';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 400 && typeof error.error === 'string') {
        // Cas où le backend renvoie directement le message d'erreur pour les bad requests
        return throwError(() => error.error);
      }
      errorMessage = `Code d'erreur ${error.status}: ${error.message || error.statusText}`;
      if (error.error && typeof error.error === 'string' && error.status !== 400) {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    console.error(errorMessage);
    return throwError(() => errorMessage); // Retourne le message d'erreur
  }

  private handleError(error: HttpErrorResponse) {
    // ... (votre gestionnaire d'erreur actuel peut être conservé ici s'il ne gère pas le retour de string)
    // Pour simplifier, j'utilise le même que handleErrorExtended mais qui ne retourne que 'never'
    let errorMessage = 'Une erreur inconnue est survenue!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Code d'erreur ${error.status}: ${error.message || error.statusText}`;
       if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}