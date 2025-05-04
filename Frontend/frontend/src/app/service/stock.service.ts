import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../models/Produit'; // Assurez-vous que ce chemin est correct
import { LotDeStock } from '../models/LotDeStock'; // Créez ce modèle si nécessaire
import { MouvementStock } from '../models/MouvementStock'; // Créez ce modèle si nécessaire

@Injectable({
  providedIn: 'root',
})
export class StockService {
  // L'URL de base est gérée par l'intercepteur, nous utilisons des chemins relatifs
  private produitsUrl = '/produits';
  private lotsUrl = '/lots';
  private mouvementUrl = '/lots/mouvement';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les produits.
   */
  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.produitsUrl);
  }

  /**
   * Récupère les lots pour un produit spécifique.
   * @param produitId L'ID du produit
   */
  getLots(produitId: number): Observable<LotDeStock[]> {
    const params = new HttpParams().set('produitId', produitId.toString());
    return this.http.get<LotDeStock[]>(this.lotsUrl, { params });
  }

  /**
   * Ajoute un nouveau mouvement de stock.
   * @param data Les données du mouvement de stock
   */
  ajouterMouvement(data: MouvementStock): Observable<any> {
    // Assurez-vous que l'objet 'data' correspond à ce que le backend attend
    return this.http.post<any>(this.mouvementUrl, data);
  }
}

// Interface pour LotDeStock (à créer dans ../models/LotDeStock.ts si elle n'existe pas)
// export interface LotDeStock {
//   id: number;
//   numeroLot: string;
//   dateExpiration: string; // ou Date
//   quantiteActuelle: number;
//   produit?: Produit; // Optionnel, selon la réponse API
//   // autres champs si nécessaire
// }

// Interface pour MouvementStock (à créer dans ../models/MouvementStock.ts si elle n'existe pas)
// export interface MouvementStock {
//   produitId: number;
//   typeMouvement: 'Reception' | 'Vente' | 'Perte' | 'Retour';
//   quantite: number;
//   motif?: string; // Optionnel
//   // autres champs si nécessaire (ex: lotNumero si applicable)
// }
