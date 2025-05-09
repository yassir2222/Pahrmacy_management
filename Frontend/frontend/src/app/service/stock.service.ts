import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Produit } from '../models/Produit';
import { LotDeStock } from '../models/LotDeStock';
import { MouvementStock } from '../models/MouvementStock';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  // Backend API base URLs
  private apiUrlRoot = environment.apiUrl;
  private baseApiUrl = `${this.apiUrlRoot}`;
  private produitsUrl = `${this.baseApiUrl}/produits/all`;
  private lotsUrl = `${this.baseApiUrl}/lots`;
  private mouvementUrl = `${this.baseApiUrl}/lots/mouvement`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les produits.
   */
  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.produitsUrl)
      .pipe(
        tap(produits => console.log(`${produits.length} produits chargés`)),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère les lots pour un produit spécifique.
   * @param produitId L'ID du produit
   */
  getLots(produitId: number): Observable<LotDeStock[]> {
    console.log(`Tentative de chargement des lots pour le produit ID: ${produitId}`);
    const url = `${this.lotsUrl}/produit/${produitId}`;
    console.log(`URL appelée: ${url}`);
    
    return this.http.get<LotDeStock[]>(url)
      .pipe(
        tap(lots => {
          console.log(`Réponse reçue: ${lots.length} lots chargés pour le produit ${produitId}`);
          console.log('Lots:', lots);
        }),
        catchError(error => {
          console.error(`Erreur lors du chargement des lots pour le produit ${produitId}:`, error);
          
          // Si l'endpoint n'existe pas, essayons une URL alternative
          if (error.status === 404) {
            console.log('Endpoint non trouvé, tentative avec une URL alternative...');
            return this.getLotsAlternative(produitId);
          }
          
          return throwError(() => error);
        })
      );
  }
  
  /**
   * Méthode alternative pour récupérer les lots (au cas où l'endpoint principal n'existe pas)
   */
  private getLotsAlternative(produitId: number): Observable<LotDeStock[]> {
    // Essayons une URL alternative comme /lots?produitId=X
    const params = new HttpParams().set('produitId', produitId.toString());
    return this.http.get<LotDeStock[]>(`${this.lotsUrl}`, { params })
      .pipe(
        tap(lots => console.log(`Alternative: ${lots.length} lots chargés pour le produit ${produitId}`)),
        catchError(error => {
          console.error('Échec de la méthode alternative:', error);
          // Retourner un tableau vide pour éviter de bloquer l'UI
          return of([]);
        })
      );
  }

  /**
   * Récupère tous les lots
   */
  getAllLots(): Observable<LotDeStock[]> {
    return this.http.get<LotDeStock[]>(`${this.lotsUrl}/all`)
      .pipe(
        tap(lots => console.log(`${lots.length} lots chargés au total`)),
        catchError(this.handleError)
      );
  }

  /**
   * Ajoute un nouveau mouvement de stock.
   * @param data Les données du mouvement de stock
   */
  ajouterMouvement(data: MouvementStock): Observable<MouvementStock> {
    return this.http.post<MouvementStock>(`${this.mouvementUrl}/add`, data)
      .pipe(
        tap(mouvement => console.log(`Mouvement de stock ajouté: ${mouvement.typeMouvement} de ${mouvement.quantite} unités`)),
        catchError(this.handleError)
      );
  }
  
  /**
   * Récupère l'historique des mouvements de stock
   */
  getMouvements(): Observable<MouvementStock[]> {
    return this.http.get<MouvementStock[]>(`${this.mouvementUrl}/all`)
      .pipe(
        tap(mouvements => console.log(`${mouvements.length} mouvements de stock chargés`)),
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
