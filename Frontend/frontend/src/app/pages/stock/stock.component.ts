import { Component, OnInit, OnDestroy } from '@angular/core'; // Added OnDestroy
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api'; // Added ConfirmationService
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
// import { InputTextarea } from 'primeng/inputtextarea'; // Removed if not used for lots
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog'; // Added DialogModule
import { CalendarModule } from 'primeng/calendar'; // Added CalendarModule
import { InputTextModule } from 'primeng/inputtext'; // Added InputTextModule

import { StockService } from '../../service/stock.service';
import { Produit } from '../../models/Produit';
import { LotDeStock } from '../../models/LotDeStock';
// import { MouvementStock, TypeMouvement } from '../../models/MouvementStock'; // Removed
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Import ConfirmDialogModule

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
    ConfirmDialogModule,
    PanelModule,
    DropdownModule,
    CardModule,
    TableModule,
    BadgeModule,
    InputNumberModule,
    // InputTextarea, // Removed if not used for lots
    ButtonModule,
    ProgressSpinnerModule,
    DialogModule, // Added
    CalendarModule, // Added
    InputTextModule // Added
  ],
  templateUrl: './stock.component.html',
  providers: [MessageService, ConfirmationService], // Added ConfirmationService
})
export class StockComponent implements OnInit, OnDestroy {
  produits: Produit[] = [];
  lots: LotDeStock[] = [];
  selectedProduit: Produit | null = null;
  
  produitSelectionForm!: FormGroup; // For selecting product
  lotForm!: FormGroup; // For adding/editing lots

  isLoadingProduits: boolean = false;
  isLoadingLots: boolean = false;
  isSavingLot: boolean = false; // For lot save operation

  lotDialog: boolean = false;
  currentLot: LotDeStock = {
        id: 0, 
    numeroLot: '',
    dateExpiration: '', 
    quantite: 0, 
    prixAchatHT: undefined, 
    produit: undefined,
    dateReception: undefined
  }; // To hold lot being edited/created
  isLotEditMode: boolean = false;
  submittedLot: boolean = false; // For lot form submission validation

  private destroy$ = new Subject<void>();

  constructor(
    private stockService: StockService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService // Injected
  ) {}

  ngOnInit(): void {
    this.produitSelectionForm = this.fb.group({
      produitId: [null, Validators.required],
    });
    this.initLotForm();
    this.loadProduits();

    this.produitSelectionForm
      .get('produitId')
      ?.valueChanges.pipe(
        takeUntil(this.destroy$),
        tap((produitId) => {
          this.lots = [];
          this.selectedProduit =
            this.produits.find((p) => p.id === produitId) || null;
          if (this.selectedProduit) {
            this.updateTotalStockForSelectedProduct(); // Initial calculation
          }
        }),
        switchMap((produitId) => {
          if (produitId) {
            return this.fetchLotsForProduct(produitId);
          } else {
            return of([]);
          }
        })
      )
      .subscribe(); // Handled by fetchLotsForProduct
  }

  fetchLotsForProduct(produitId: number): Observable<LotDeStock[]> {
    this.isLoadingLots = true;
    return this.stockService.getLots(produitId).pipe(
      tap(loadedLots => {
        this.lots = loadedLots;
        this.isLoadingLots = false;
        this.updateTotalStockForSelectedProduct();
      }),
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les lots.',
        });
        this.isLoadingLots = false;
        return of([]);
      })
    );
  }
  
  updateTotalStockForSelectedProduct(): void {
    if (this.selectedProduit) {
      this.selectedProduit.quantiteTotaleEnStock = this.lots.reduce(
        (sum, lot) => sum + (lot.quantite || 0), // Ensure lot.quantite is a number
        0
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


   initLotForm(): void {
    this.lotForm = this.fb.group({
      id: [null],
      numeroLot: ['', Validators.required],
      dateExpiration: [null, Validators.required],
      quantite: [null, [Validators.required, Validators.min(1)]],
      prixAchatHT: [null, [Validators.required, Validators.min(0.01)]], // MODIFIÉ: rendu requis
      dateReception: [null], 
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
          return of([]);
        })
      )
      .subscribe((produits) => {
        this.produits = produits;
        this.isLoadingProduits = false;
      });
  }

  openNewLotDialog(): void {
    if (!this.selectedProduit || this.selectedProduit.id === undefined) {
        this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez d\'abord sélectionner un produit.' });
        return;
    }
    this.isLotEditMode = false;
    this.submittedLot = false;
    this.currentLot = {
          id: 0, 
    numeroLot: '',
    dateExpiration: '', 
    quantite: 0, 
    prixAchatHT: undefined, 
    produit: undefined,
    dateReception: undefined
    }; // Reset
    this.lotForm.reset(); // Clear form
    this.lotDialog = true;
  }

  openEditLotDialog(lot: LotDeStock): void {
    this.isLotEditMode = true;
    this.submittedLot = false;
    this.currentLot = { ...lot }; // Copy lot data
    // Convert date strings to Date objects for p-calendar
    const dateExpiration = lot.dateExpiration ? new Date(lot.dateExpiration) : null;
    const dateReception = lot.dateReception ? new Date(lot.dateReception) : null;

    this.lotForm.patchValue({
        ...lot,
        dateExpiration: dateExpiration,
        dateReception: dateReception
    });
    this.lotDialog = true;
  }

  hideLotDialog(): void {
    this.lotDialog = false;
    this.submittedLot = false;
    this.lotForm.reset();
    this.currentLot = {
    id: 0, 
    numeroLot: '',
    dateExpiration: '', 
    quantite: 0, 
    prixAchatHT: undefined, 
    produit: undefined,
    dateReception: undefined 
    };
  }
  
  saveLot(): void {
    this.submittedLot = true;
    if (this.lotForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir tous les champs requis du lot.' });
      Object.values(this.lotForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    if (!this.selectedProduit || this.selectedProduit.id === undefined) {
        this.messageService.add({ severity: 'error', summary: 'Erreur Produit', detail: 'Produit non sélectionné pour l\'opération.' });
        return;
    }

    this.isSavingLot = true;
    const lotDataFromForm = this.lotForm.value;
    const dateExpirationFormatted = lotDataFromForm.dateExpiration ? new Date(lotDataFromForm.dateExpiration).toISOString().split('T')[0] : '';

    let saveObservable: Observable<LotDeStock>;

    if (this.isLotEditMode && this.currentLot.id) {
      const updatePayload: LotDeStock = {
        id: this.currentLot.id,
        numeroLot: lotDataFromForm.numeroLot,
        dateExpiration: dateExpirationFormatted,
        quantite: lotDataFromForm.quantite,
        prixAchatHT: lotDataFromForm.prixAchatHT,
        dateReception: lotDataFromForm.dateReception ? new Date(lotDataFromForm.dateReception).toISOString().split('T')[0] : undefined,
      };
      saveObservable = this.stockService.updateLot(this.currentLot.id, updatePayload);
    } else {
      // MODIFIÉ: section pour la création
      const createPayload = {
        numeroLot: lotDataFromForm.numeroLot,
        dateExpiration: dateExpirationFormatted,
        quantite: lotDataFromForm.quantite,
        prixAchatHT: lotDataFromForm.prixAchatHT,
      };
      saveObservable = this.stockService.createLot(this.selectedProduit.id, createPayload);
    }

    saveObservable.pipe(
        takeUntil(this.destroy$),
        catchError(err => {
            this.messageService.add({ severity: 'error', summary: 'Erreur Sauvegarde', detail: err.message || 'Échec de la sauvegarde du lot.' });
            this.isSavingLot = false;
            return of(null); 
        })
    ).subscribe(savedLotResponse => {
        if (savedLotResponse) {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: `Lot ${this.isLotEditMode ? 'mis à jour' : 'ajouté'} avec succès.` });
            this.hideLotDialog();
            if (this.selectedProduit && this.selectedProduit.id) {
                 this.fetchLotsForProduct(this.selectedProduit.id).subscribe();
            }
        }
        this.isSavingLot = false;
    });
  }

  deleteLot(lot: LotDeStock): void {
    if (lot.id === undefined) return;
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer le lot n° ${lot.numeroLot} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        if (lot.id === undefined) return; // Double check
        this.stockService.deleteLot(lot.id).pipe(
            takeUntil(this.destroy$),
            catchError(err => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `Échec de la suppression du lot. ${err.message || ''}` });
                return of(null);
            })
        ).subscribe(response => {
            if (response !== null) { // Check if deletion was successful (void observable will complete)
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Lot supprimé avec succès.' });
                if (this.selectedProduit && this.selectedProduit.id) {
                    this.fetchLotsForProduct(this.selectedProduit.id).subscribe(); // Refresh lots
                }
            }
        });
      }
    });
  }

  reloadLots(produitId: number): void { // Kept for potential direct use, but fetchLotsForProduct is preferred
    this.fetchLotsForProduct(produitId).subscribe();
  }

  isDateExpirationProche(
    dateExpirationStr: string | Date | undefined | null, // Allow null
    joursSeuil: number = 30
  ): boolean {
    if (!dateExpirationStr) return false;
    const dateExpiration = new Date(dateExpirationStr);
    if (isNaN(dateExpiration.getTime())) {
      console.error('Date invalide pour vérification expiration:', dateExpirationStr);
      return false;
    }
    const maintenant = new Date();
    maintenant.setHours(0, 0, 0, 0); // Compare dates only
    const dateSeuil = new Date(maintenant);
    dateSeuil.setDate(maintenant.getDate() + joursSeuil);
    
    return dateExpiration <= dateSeuil && dateExpiration >= maintenant; // Expired or expiring soon, but not past
  }

  isStockBas(quantite: number | undefined | null): boolean { // Allow null
    if (quantite === undefined || quantite === null) return false; // Or true if undefined means critical
    if (
      !this.selectedProduit ||
      this.selectedProduit.seuilStock === undefined ||
      this.selectedProduit.seuilStock === null
    ) {
      return quantite <= 0; // Default to low if 0 or less and no threshold
    }
    return quantite <= this.selectedProduit.seuilStock;
  }

  getBadgeSeverity(lot: LotDeStock): BadgeSeverity {
    const expirationProche = this.isDateExpirationProche(lot.dateExpiration);
    const stockBas = this.isStockBas(lot.quantite);

    if (new Date(lot.dateExpiration || 0) < new Date()) return 'danger'; // Already expired
    if (expirationProche && stockBas) return 'danger';
    if (expirationProche || stockBas) return 'warn'; // Changed to warn for single condition
    
    return 'success'; // Changed to success for "En stock"
  }

  getBadgeValue(lot: LotDeStock): string {
    if (new Date(lot.dateExpiration || 0) < new Date()) return 'Expiré';
    const expirationProche = this.isDateExpirationProche(lot.dateExpiration);
    const stockBas = this.isStockBas(lot.quantite);

    if (expirationProche && stockBas) return 'Stock bas / Exp. proche';
    if (expirationProche) return 'Exp. proche';
    if (stockBas) return 'Stock bas';

    return 'En stock';
  }
}