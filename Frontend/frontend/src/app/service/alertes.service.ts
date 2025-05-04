import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Produit } from '../models/Produit';
import { LotDeStock } from '../models/LotDeStock';

export interface AlerteItem {
  id: number;
  type: 'rupture' | 'seuil' | 'expiration';
  titre: string;
  description: string;
  valeur: number; // Quantité ou jours restants
  lien?: string; // Lien vers le détail (si applicable)
  severity: 'danger' | 'warning' | 'info'; // Niveau de sévérité pour le style
  produitId?: number;
  lotId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AlertesService {
  private apiUrl = 'http://localhost:8083/api';

  // Données simulées pour le développement
  private mockAlertes: AlerteItem[] = [
    {
      id: 1,
      type: 'rupture',
      titre: 'Doliprane 1000mg',
      description: 'Rupture de stock',
      valeur: 0,
      severity: 'danger',
      produitId: 1,
    },
    {
      id: 2,
      type: 'seuil',
      titre: 'Efferalgan 500mg',
      description: 'Stock bas',
      valeur: 5,
      severity: 'warning',
      produitId: 2,
    },
    {
      id: 3,
      type: 'expiration',
      titre: 'Aspirine 500mg',
      description: 'Lot expirant bientôt',
      valeur: 7, // jours avant expiration
      severity: 'warning',
      produitId: 3,
      lotId: 101,
    },
    {
      id: 4,
      type: 'expiration',
      titre: 'Ibuprofène 400mg',
      description: 'Lot expirant bientôt',
      valeur: 14, // jours avant expiration
      severity: 'info',
      produitId: 4,
      lotId: 102,
    },
  ];

  constructor(private http: HttpClient) {}

  /**
   * Récupère les alertes actives (ruptures, stocks bas, lots expirants)
   * @returns Observable contenant la liste des alertes actives
   */
  getAlertesActives(): Observable<AlerteItem[]> {
    // En environnement réel :
    // return this.http.get<AlerteItem[]>(`${this.apiUrl}/alertes`)
    //   .pipe(catchError(this.handleError));

    // Simulation pour le développement
    return of(this.mockAlertes);
  }

  /**
   * Génère des alertes basées sur les produits et lots disponibles
   * Cette méthode serait généralement utilisée côté backend
   */
  genererAlertes(produits: Produit[], lots: LotDeStock[]): AlerteItem[] {
    const alertes: AlerteItem[] = [];
    const today = new Date();

    // Vérifier les produits en rupture ou sous seuil
    produits.forEach((produit) => {
      if (produit.quantiteTotaleEnStock === 0) {
        alertes.push({
          id: alertes.length + 1,
          type: 'rupture',
          titre: produit.nomMedicament || `Produit #${produit.id}`,
          description: 'Rupture de stock',
          valeur: 0,
          severity: 'danger',
          produitId: produit.id,
          lien: `/app/produits/${produit.id}`,
        });
      } else if (
        produit.quantiteTotaleEnStock !== undefined &&
        produit.seuilStock !== undefined &&
        produit.quantiteTotaleEnStock < produit.seuilStock
      ) {
        alertes.push({
          id: alertes.length + 1,
          type: 'seuil',
          titre: produit.nomMedicament || `Produit #${produit.id}`,
          description: 'Stock bas',
          valeur: produit.quantiteTotaleEnStock,
          severity: 'warning',
          produitId: produit.id,
          lien: `/app/produits/${produit.id}`,
        });
      }
    });

    // Vérifier les lots expirants
    lots.forEach((lot) => {
      const expirationDate = new Date(lot.dateExpiration);
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 30) {
        let severity: 'danger' | 'warning' | 'info' = 'info';

        if (diffDays <= 7) {
          severity = 'danger';
        } else if (diffDays <= 15) {
          severity = 'warning';
        }

        alertes.push({
          id: alertes.length + 1,
          type: 'expiration',
          titre: lot.produit?.nomMedicament || `Lot #${lot.id}`,
          description: 'Lot expirant bientôt',
          valeur: diffDays,
          severity: severity,
          produitId: lot.produit?.id,
          lotId: lot.id,
          lien: `/app/stock`,
        });
      }
    });

    return alertes;
  }

  /**
   * Marque une alerte comme lue
   * @param alerteId Identifiant de l'alerte
   */
  marquerCommeLue(alerteId: number): Observable<any> {
    // En environnement réel :
    // return this.http.post<any>(`${this.apiUrl}/alertes/${alerteId}/lue`, {})
    //   .pipe(catchError(this.handleError));

    // Simulation
    this.mockAlertes = this.mockAlertes.filter((a) => a.id !== alerteId);
    return of({ success: true });
  }

  /**
   * Marque toutes les alertes comme lues
   */
  marquerToutesCommeLues(): Observable<any> {
    // En environnement réel :
    // return this.http.post<any>(`${this.apiUrl}/alertes/lues`, {})
    //   .pipe(catchError(this.handleError));

    // Simulation
    this.mockAlertes = [];
    return of({ success: true });
  }

  /**
   * Gestion des erreurs
   */
  private handleError(error: any) {
    console.error('Une erreur est survenue', error);
    return of([]);
  }
}
