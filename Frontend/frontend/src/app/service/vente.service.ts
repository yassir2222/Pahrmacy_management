import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../models/Produit';
import { User } from '../models/User';
import { Vente } from '../models/Vente';

@Injectable({
  providedIn: 'root',
})
export class VenteService {
  // URLs relatives gérées par l'intercepteur
  private produitsUrl = '/produits';
  private utilisateursUrl = '/users'; // Ou /utilisateurs, ajustez selon votre API
  private ventesUrl = '/ventes';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste des produits.
   */
  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.produitsUrl);
  }

  /**
   * Récupère la liste des utilisateurs (vendeurs).
   */
  getUtilisateurs(): Observable<User[]> {
    // Ajustez le type si vous utilisez Utilisateur
    return this.http.get<User[]>(this.utilisateursUrl);
  }

  /**
   * Enregistre une nouvelle vente.
   * @param venteData Les données de la vente à enregistrer.
   */
  ajouterVente(venteData: Vente): Observable<any> {
    return this.http.post<any>(this.ventesUrl, venteData);
  }
}
