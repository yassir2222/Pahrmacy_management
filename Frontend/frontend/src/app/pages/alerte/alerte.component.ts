import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LotDeStock } from '../../models/LotDeStock';
import { Produit } from '../../models/Produit';
import { AlerteService } from '../../service/alerte.service';

@Component({
  selector: 'app-alerte',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    BadgeModule,
    ToastModule,
    PanelModule,
    CardModule,
    ProgressSpinnerModule,
  ],
  providers: [MessageService],
  templateUrl: './alerte.component.html',
  styles: [
    `
      :host ::ng-deep .p-badge.p-badge-danger {
        background-color: #ffb3b3; /* Rouge clair */
        color: #b22222;
      }
      :host ::ng-deep .p-badge.p-badge-warn {
        background-color: #fff2b3; /* Jaune clair */
        color: #8b8000;
      }
      :host ::ng-deep .p-badge.p-badge-info {
        background-color: #b3e0ff; /* Bleu pâle */
        color: #0066cc;
      }
      .alert-container {
        margin-bottom: 2rem;
      }
    `,
  ],
})
export class AlerteComponent implements OnInit {
  produits: Produit[] = [];
  lots: LotDeStock[] = [];

  produitsRupture: Produit[] = [];
  produitsSousSeuil: Produit[] = [];
  lotsExpirants: LotDeStock[] = [];

  loading: boolean = true;

  constructor(
    private alerteService: AlerteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.loading = true;

    // Charger les produits
    this.alerteService.getProduits().subscribe({
      next: (produits) => {
        this.produits = produits;
        this.filtrerProduits();
        this.chargerLots();
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement des produits');
        this.loading = false;
      },
    });
  }

  chargerLots(): void {
    this.alerteService.getLots().subscribe({
      next: (lots) => {
        this.lots = lots;
        this.filtrerLots();
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err, 'Erreur lors du chargement des lots');
        this.loading = false;
      },
    });
  }

  filtrerProduits(): void {
    // Filtrer les produits en rupture de stock
    this.produitsRupture = this.produits.filter(
      (produit) => produit.quantiteTotaleEnStock === 0
    );

    // Filtrer les produits sous le seuil de stock
    this.produitsSousSeuil = this.produits.filter(
      (produit) =>
        produit.quantiteTotaleEnStock !== 0 &&
        produit.quantiteTotaleEnStock !== undefined &&
        produit.seuilStock !== undefined &&
        produit.quantiteTotaleEnStock < produit.seuilStock
    );
  }

  filtrerLots(): void {
    const dateAujourdhui = new Date();
    const dateLimite = new Date(dateAujourdhui);
    dateLimite.setDate(dateAujourdhui.getDate() + 30); // Date limite = aujourd'hui + 30 jours

    // Filtrer les lots expirants dans moins de 30 jours
    this.lotsExpirants = this.lots.filter((lot) => {
      const dateExpiration = new Date(lot.dateExpiration);
      return dateExpiration <= dateLimite && dateExpiration >= dateAujourdhui;
    });
  }

  handleError(error: any, message: string): void {
    console.error(error);
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 5000,
    });
  }

  calculerPourcentageStock(produit: Produit): number {
    if (!produit.quantiteTotaleEnStock || !produit.seuilStock) return 0;
    return Math.min(
      100,
      Math.round((produit.quantiteTotaleEnStock / produit.seuilStock) * 100)
    );
  }

  calculerJoursAvantExpiration(dateExpiration: string | Date): number {
    const dateExp = new Date(dateExpiration);
    const aujourdhui = new Date();
    const diffTime = dateExp.getTime() - aujourdhui.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
