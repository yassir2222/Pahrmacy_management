import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { Vente } from '../../models/Vente';
import { Produit } from '../../models/Produit';
import { LotDeStock } from '../../models/LotDeStock';
import { RapportService } from '../../service/rapport.service';
import { PanelModule } from 'primeng/panel';
import { BadgeModule } from 'primeng/badge';
// Import our custom Chart.js module to fix the dependency issue
import '../../charts.module';

@Component({
  selector: 'app-rapport',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    CalendarModule,
    ToastModule,
    ProgressSpinnerModule,
    ButtonModule,
    ChartModule,
    PanelModule,
    BadgeModule,
  ],
  providers: [MessageService],
  templateUrl: './rapport.component.html',
  styles: [
    `
      .stat-label {
        font-size: 1rem;
        color: #6c757d;
      }
      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #3f51b5;
      }
      .card-blue {
        border-top: 4px solid #2196f3;
      }
      .card-green {
        border-top: 4px solid #4caf50;
      }
      .card-orange {
        border-top: 4px solid #ff9800;
      }
      .small-badge {
        font-size: 0.8rem;
        margin-left: 0.5rem;
      }
      .chart-container {
        height: 300px;
      }
    `,
  ],
})
export class RapportComponent implements OnInit {
  // Filtres de date
  dateDebut: Date = new Date();
  dateFin: Date = new Date();

  // Données
  ventes: Vente[] = [];
  produits: Produit[] = [];
  lots: LotDeStock[] = [];

  // États
  loading: boolean = false;

  // Statistiques
  totalVentes: number = 0;
  nombreVentes: number = 0;
  totalProduits: number = 0;
  produitsEnAlerte: number = 0;

  // Données pour les graphiques
  ventesParJourOptions: any;
  ventesParJourData: any;

  topProduitsOptions: any;
  topProduitsData: any;

  // Données filtrées
  produitsSousSeuil: Produit[] = [];
  lotsExpirants: LotDeStock[] = [];

  constructor(
    private rapportService: RapportService,
    private messageService: MessageService
  ) {
    // Initialiser les dates à il y a un mois
    this.dateDebut = new Date();
    this.dateDebut.setMonth(this.dateDebut.getMonth() - 1);
    this.dateFin = new Date();
  }

  ngOnInit(): void {
    this.initChartOptions();
    this.chargerDonnees();
  }

  /**
   * Initialise les options des graphiques
   */
  initChartOptions(): void {
    // Options pour le graphique des ventes par jour
    this.ventesParJourOptions = {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Montant (€)',
          },
          min: 0,
        },
      },
    };

    // Options pour le graphique des top produits
    this.topProduitsOptions = {
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Quantité vendue',
          },
          min: 0,
        },
      },
    };
  }

  /**
   * Charge les données des ventes, produits et lots
   */
  chargerDonnees(): void {
    this.loading = true;

    // Charger les ventes
    this.rapportService.getVentes(this.dateDebut, this.dateFin).subscribe({
      next: (ventes) => {
        this.ventes = ventes;
        this.calculerStatistiquesVentes();
        this.preparerDonneesGraphiques();
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement des ventes');
        this.loading = false;
      },
    });

    // Charger les produits
    this.rapportService.getProduits().subscribe({
      next: (produits) => {
        this.produits = produits;
        this.totalProduits = produits.length;
        this.filtrerProduitsSousSeuil();
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement des produits');
        this.loading = false;
      },
    });

    // Charger les lots
    this.rapportService.getLots().subscribe({
      next: (lots) => {
        this.lots = lots;
        this.filtrerLotsExpirants();
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement des lots');
        this.loading = false;
      },
    });
  }

  /**
   * Calcule les statistiques de ventes
   */
  calculerStatistiquesVentes(): void {
    this.nombreVentes = this.ventes.length;
    this.totalVentes = this.ventes.reduce(
      (total, vente) => total + vente.montantTotal,
      0
    );
  }

  /**
   * Prépare les données pour les graphiques
   */
  preparerDonneesGraphiques(): void {
    // Préparer données pour graphique des ventes par jour
    this.preparerDonneesVentesParJour();

    // Préparer données pour graphique des top produits
    this.preparerDonneesTopProduits();
  }

  /**
   * Prépare les données pour le graphique des ventes par jour
   */
  preparerDonneesVentesParJour(): void {
    // Grouper les ventes par jour
    const ventesParJour = new Map<string, number>();

    this.ventes.forEach((vente) => {
      const date = new Date(vente.dateVente);
      const dateStr = this.formatDate(date);

      if (ventesParJour.has(dateStr)) {
        ventesParJour.set(
          dateStr,
          ventesParJour.get(dateStr)! + vente.montantTotal
        );
      } else {
        ventesParJour.set(dateStr, vente.montantTotal);
      }
    });

    // Trier les dates
    const datesSorted = Array.from(ventesParJour.keys()).sort();

    // Créer les données pour le graphique
    this.ventesParJourData = {
      labels: datesSorted,
      datasets: [
        {
          label: 'Ventes',
          data: datesSorted.map((date) => ventesParJour.get(date)),
          fill: false,
          borderColor: '#2196F3',
          tension: 0.4,
        },
      ],
    };
  }

  /**
   * Prépare les données pour le graphique des top produits
   */
  preparerDonneesTopProduits(): void {
    // Compter les ventes par produit
    const ventesParProduit = new Map<
      number,
      { id: number; nom: string; quantite: number }
    >();

    this.ventes.forEach((vente) => {
      vente.lignesVente.forEach((ligne) => {
        // Vérifier si ligne.produit et ligne.produit.id existent avant de les utiliser
        if (ligne.produit && typeof ligne.produit.id === 'number') {
          const produitId = ligne.produit.id; // Utiliser l'ID de l'objet produit
          if (ventesParProduit.has(produitId)) {
            const produitData = ventesParProduit.get(produitId)!;
            produitData.quantite += ligne.quantite;
          } else {
            // Le nom du produit est déjà dans ligne.produit.nomMedicament
            ventesParProduit.set(produitId, {
              id: produitId,
              nom: ligne.produit.nomMedicament || `Produit #${produitId}`,
              quantite: ligne.quantite,
            });
          }
        } else {
          console.warn("Ligne de vente avec produit ou ID de produit manquant:", ligne);
        }
      });
    });

    // Trier par quantité vendue et prendre les 5 premiers
    const topProduits = Array.from(ventesParProduit.values())
      .sort((a, b) => b.quantite - a.quantite)
      .slice(0, 5);

    // Créer les données pour le graphique
    this.topProduitsData = {
      labels: topProduits.map((p) => p.nom),
      datasets: [
        {
          label: 'Quantité vendue',
          data: topProduits.map((p) => p.quantite),
          backgroundColor: '#4CAF50',
        },
      ],
    };
  }

  /**
   * Filtre les produits sous le seuil
   */
  filtrerProduitsSousSeuil(): void {
    this.produitsSousSeuil = this.produits.filter(
      (produit) =>
        produit.quantiteTotaleEnStock !== undefined &&
        produit.seuilStock !== undefined &&
        produit.quantiteTotaleEnStock <= produit.seuilStock
    );

    this.produitsEnAlerte = this.produitsSousSeuil.length;
  }

  /**
   * Filtre les lots expirants bientôt (dans les 30 jours)
   */
  filtrerLotsExpirants(): void {
    const dateAujourdhui = new Date();
    const dateLimite = new Date(dateAujourdhui);
    dateLimite.setDate(dateAujourdhui.getDate() + 30);

    this.lotsExpirants = this.lots.filter((lot) => {
      const dateExpiration = new Date(lot.dateExpiration);
      return dateExpiration <= dateLimite && dateExpiration >= dateAujourdhui;
    });
  }

  /**
   * Gestion des erreurs
   */
  handleError(error: any, message: string): void {
    console.error(error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 5000,
    });
  }

  /**
   * Rafraîchit les données avec les nouvelles dates
   */
  filtrerParDate(): void {
    this.chargerDonnees();
  }

  /**
   * Calcule le pourcentage de stock par rapport au seuil
   */
  calculerPourcentageStock(produit: Produit): number {
    if (!produit.quantiteTotaleEnStock || !produit.seuilStock) return 0;
    return Math.min(
      100,
      Math.round((produit.quantiteTotaleEnStock / produit.seuilStock) * 100)
    );
  }

  /**
   * Calcule le nombre de jours avant expiration
   */
  calculerJoursAvantExpiration(dateExpiration: string | Date): number {
    const dateExp = new Date(dateExpiration);
    const aujourdhui = new Date();
    const diffTime = dateExp.getTime() - aujourdhui.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Formate une date au format YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
