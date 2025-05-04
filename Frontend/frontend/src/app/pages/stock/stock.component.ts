import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { StockService } from '../../service/stock.service';
import { Produit } from '../../models/Produit';
import { LotDeStock } from '../../models/LotDeStock';
import { MouvementStock, TypeMouvement } from '../../models/MouvementStock';

// Define the specific type for badge severity
type BadgeSeverity =
  | 'info'
  | 'success'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    PanelModule,
    DropdownModule,
    CardModule,
    TableModule,
    BadgeModule,
    InputNumberModule,
    InputTextarea,
    ButtonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './stock.component.html',
  // styleUrls: ['./stock.component.css'] // Décommentez si vous créez un fichier CSS
  providers: [MessageService], // Fournir MessageService ici si p-toast est dans ce template
})
export class StockComponent implements OnInit {
  produits: Produit[] = [];
  lots: LotDeStock[] = [];
  selectedProduit: Produit | null = null;
  mouvementForm!: FormGroup;

  isLoadingProduits: boolean = false;
  isLoadingLots: boolean = false;
  isLoadingMouvement: boolean = false;

  typesMouvement: { label: string; value: TypeMouvement }[] = [
    { label: 'Réception (entrée)', value: 'Reception' },
    { label: 'Vente (sortie)', value: 'Vente' },
    { label: 'Perte (sortie)', value: 'Perte' },
    { label: 'Retour (entrée)', value: 'Retour' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProduits();

    // Écouter les changements de produit pour charger les lots
    this.mouvementForm
      .get('produitId')
      ?.valueChanges.pipe(
        takeUntil(this.destroy$),
        tap((produitId) => {
          this.lots = []; // Vider les lots précédents
          this.selectedProduit =
            this.produits.find((p) => p.id === produitId) || null;
        }),
        switchMap((produitId) => {
          if (produitId) {
            this.isLoadingLots = true;
            return this.stockService.getLots(produitId).pipe(
              catchError((err) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Erreur',
                  detail: 'Impossible de charger les lots.',
                });
                this.isLoadingLots = false;
                return []; // Retourne un observable vide en cas d'erreur
              })
            );
          } else {
            return []; // Pas d'ID produit, retourne un observable vide
          }
        })
      )
      .subscribe((lots) => {
        this.lots = lots;
        this.isLoadingLots = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.mouvementForm = this.fb.group({
      produitId: [null, Validators.required],
      typeMouvement: [null, Validators.required],
      quantite: [null, [Validators.required, Validators.min(1)]],
      motif: [''], // Motif n'est pas requis
    });
  }

  loadProduits(): void {
    this.isLoadingProduits = true;
    this.stockService
      .getProduits()
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les produits.',
          });
          this.isLoadingProduits = false;
          return [];
        })
      )
      .subscribe((produits) => {
        this.produits = produits;
        this.isLoadingProduits = false;
      });
  }

  ajouterMouvement(): void {
    if (this.mouvementForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.mouvementForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Veuillez remplir tous les champs requis.',
      });
      return;
    }

    this.isLoadingMouvement = true;
    const mouvementData: MouvementStock = this.mouvementForm.value;

    this.stockService
      .ajouterMouvement(mouvementData)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Échec de l'ajout du mouvement.",
          });
          this.isLoadingMouvement = false;
          return of([]);
        })
      )
      .subscribe((response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Mouvement ajouté avec succès.',
        });
        this.isLoadingMouvement = false;
        this.mouvementForm.reset(); // Réinitialiser le formulaire
        // Recharger les lots pour voir la mise à jour
        const currentProductId = mouvementData.produitId;
        this.mouvementForm.patchValue({ produitId: currentProductId }); // Remettre l'ID produit pour déclencher valueChanges si nécessaire
        // Ou déclencher manuellement le rechargement si valueChanges ne se déclenche pas après reset
        if (currentProductId) {
          this.reloadLots(currentProductId);
        }
      });
  }

  reloadLots(produitId: number): void {
    this.isLoadingLots = true;
    this.stockService
      .getLots(produitId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de recharger les lots.',
          });
          this.isLoadingLots = false;
          return [];
        })
      )
      .subscribe((lots) => {
        this.lots = lots;
        this.isLoadingLots = false;
        // Mettre à jour aussi la quantité totale dans selectedProduit si l'API ne la renvoie pas dans getLots
        if (this.selectedProduit) {
          this.selectedProduit.quantiteTotaleEnStock = this.lots.reduce(
            (sum, lot) => sum + lot.quantiteActuelle,
            0
          );
        }
      });
  }

  // --- Logique pour les Badges ---

  isDateExpirationProche(
    dateExpirationStr: string | Date | undefined,
    joursSeuil: number = 30
  ): boolean {
    if (!dateExpirationStr) return false;
    const dateExpiration = new Date(dateExpirationStr);
    const maintenant = new Date();
    const dateSeuil = new Date();
    dateSeuil.setDate(maintenant.getDate() + joursSeuil);
    // Handle invalid date string/object
    if (isNaN(dateExpiration.getTime())) {
      console.error(
        'Invalid date provided for expiration check:',
        dateExpirationStr
      );
      return false;
    }
    return dateExpiration <= dateSeuil;
  }

  isStockBas(quantiteActuelle: number | undefined): boolean {
    // Check if quantiteActuelle is defined and not null
    if (quantiteActuelle === undefined || quantiteActuelle === null) {
      return false;
    }
    // Check if selectedProduit and seuilStock are defined
    if (
      !this.selectedProduit ||
      this.selectedProduit.seuilStock === undefined ||
      this.selectedProduit.seuilStock === null
    ) {
      // If no threshold is set, maybe don't consider it low? Or decide on default behavior.
      // For now, return false if threshold isn't set.
      return false;
    }
    // Consider 0 or less as low stock, or below/equal to threshold
    return quantiteActuelle <= this.selectedProduit.seuilStock;
  }

  getBadgeSeverity(lot: LotDeStock): BadgeSeverity {
    const expirationProche = this.isDateExpirationProche(lot.dateExpiration);
    const stockBas = this.isStockBas(lot.quantiteActuelle);

    if (expirationProche || stockBas) {
      return 'danger'; // Matches BadgeSeverity
    }
    return 'info'; // Matches BadgeSeverity
  }

  getBadgeValue(lot: LotDeStock): string {
    const expirationProche = this.isDateExpirationProche(lot.dateExpiration);
    const stockBas = this.isStockBas(lot.quantiteActuelle);

    if (expirationProche && stockBas) return 'Stock bas / Exp. proche';
    if (expirationProche) return 'Exp. proche';
    if (stockBas) return 'Stock bas';

    return ''; // Return empty string instead of null
  }
}
