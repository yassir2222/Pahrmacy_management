import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Produit } from '../models/Produit';
import { User } from '../models/User';
import { Vente } from '../models/Vente';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VenteService {
  // Backend API base URLs
  private apiUrlRoot = environment.apiUrl;
  private baseApiUrl = `${this.apiUrlRoot}`;
  private produitsUrl = `${this.baseApiUrl}/produits/all`;
  private utilisateursUrl = `${this.baseApiUrl}/users`; 
  private ventesUrl = `${this.baseApiUrl}/ventes`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des produits.
   */
  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.produitsUrl)
      .pipe(
        tap(data => console.log('Produits chargés:', data.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère la liste des utilisateurs (vendeurs).
   */
  getUtilisateurs(): Observable<User[]> {
    return this.http.get<User[]>(this.utilisateursUrl)
      .pipe(
        tap(data => console.log('Utilisateurs chargés:', data.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère uniquement les utilisateurs ayant le rôle de vendeur.
   * Accepte différentes variantes du rôle "vendeur".
   */
  getVendeurs(): Observable<User[]> {
    return this.http.get<User[]>(this.utilisateursUrl)
      .pipe(
        map(users => {
          // Si aucun utilisateur n'a de rôle de vendeur, retourner tous les utilisateurs
          const vendeurs = users.filter(user => {
            if (!user.role) return true; // Inclure aussi les utilisateurs sans rôle défini
            const role = user.role.toLowerCase();
            return role === 'vendeur' || role === 'user' || role === 'vente' || role === 'admin'; 
          });
          
          // Si toujours aucun vendeur trouvé, retourner tous les utilisateurs
          return vendeurs.length > 0 ? vendeurs : users;
        }),
        tap(data => console.log('Vendeurs chargés:', data.length)),
        catchError(this.handleError)
      );
  }

  /**
   * Enregistre une nouvelle vente.
   * @param venteData Les données de la vente à enregistrer.
   */
  ajouterVente(venteData: Vente): Observable<Vente> {
    return this.http.post<Vente>(`${this.ventesUrl}/add`, venteData)
      .pipe(
        tap(data => console.log('Vente enregistrée:', data)),
        catchError(this.handleError)
      );
  }
  
  /**
   * Récupère l'historique des ventes
   */
  getVentes(): Observable<Vente[]> {
    return this.http.get<Vente[]>(`${this.ventesUrl}/all`)
      .pipe(
        tap(data => console.log('Historique des ventes chargé:', data.length)),
        catchError(this.handleError)
      );
  }
  
  /**
   * Récupère une vente spécifique par ID
   */
  getVenteById(id: number): Observable<Vente> {
    return this.http.get<Vente>(`${this.ventesUrl}/${id}`)
      .pipe(
        tap(data => console.log('Vente chargée:', data)),
        catchError(this.handleError)
      );
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
    return throwError(() => new Error(errorMessage));
  }
}
