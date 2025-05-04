import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Observable, Subject, of, Subscription } from 'rxjs';
import { catchError, takeUntil, tap, debounceTime } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card'; // Pour l'encadrement
import { DividerModule } from 'primeng/divider'; // Pour séparer visuellement

// Services and Models
import { VenteService } from '../../service/vente.service';
import { Produit } from '../../models/Produit';
import { User } from '../../models/User'; // Ou Utilisateur
import { Vente } from '../../models/Vente';
import { LigneVente } from '../../models/LigneVente';

@Component({
  selector: 'app-vente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    ButtonModule,
    InputNumberModule,
    ProgressSpinnerModule,
    CardModule,
    DividerModule,
  ],
  templateUrl: './vente.component.html',
  providers: [MessageService],
})
export class VenteComponent implements OnInit, OnDestroy {
  venteForm!: FormGroup;
  produits: Produit[] = [];
  utilisateurs: User[] = []; // Ou Utilisateur[]
  montantTotal: number = 0;

  isLoadingProduits: boolean = false;
  isLoadingUtilisateurs: boolean = false;
  isSaving: boolean = false;

  private destroy$ = new Subject<void>();
  private lignesVenteSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private venteService: VenteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
    this.listenToLignesChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.lignesVenteSub?.unsubscribe();
  }

  // --- Initialisation ---

  initForm(): void {
    this.venteForm = this.fb.group({
      utilisateurId: [null, Validators.required],
      dateVente: [new Date(), Validators.required], // Date actuelle par défaut
      lignes: this.fb.array([this.createLigneVenteGroup()]), // Commence avec une ligne
    });
  }

  createLigneVenteGroup(): FormGroup {
    return this.fb.group({
      produitId: [null, Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      prixUnitaire: [{ value: 0, disabled: true }], // Calculé et désactivé
      prixTotalLigne: [{ value: 0, disabled: true }], // Calculé et désactivé
    });
  }

  loadInitialData(): void {
    this.isLoadingProduits = true;
    this.isLoadingUtilisateurs = true;

    this.venteService
      .getProduits()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.isLoadingProduits = false;
          return of([]);
        })
      )
      .subscribe((data) => {
        this.produits = data;
        this.isLoadingProduits = false;
      });

    this.venteService
      .getUtilisateurs()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.isLoadingUtilisateurs = false;
          return of([]);
        })
      )
      .subscribe((data) => {
        this.utilisateurs = data;
        this.isLoadingUtilisateurs = false;
      });
  }

  // --- Gestion des Lignes de Vente ---

  get lignes(): FormArray {
    return this.venteForm.get('lignes') as FormArray;
  }

  addLigneVente(): void {
    this.lignes.push(this.createLigneVenteGroup());
  }

  removeLigneVente(index: number): void {
    if (this.lignes.length > 1) {
      // Empêche de supprimer la dernière ligne
      this.lignes.removeAt(index);
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Au moins une ligne est requise.',
      });
    }
  }

  onProductChange(index: number): void {
    const ligneGroup = this.lignes.at(index) as FormGroup;
    const produitId = ligneGroup.get('produitId')?.value;
    const selectedProduit = this.produits.find((p) => p.id === produitId);

    if (selectedProduit && selectedProduit.prixVenteTTC !== undefined) {
      ligneGroup.get('prixUnitaire')?.setValue(selectedProduit.prixVenteTTC);
    } else {
      ligneGroup.get('prixUnitaire')?.setValue(0);
    }
    this.calculerPrixTotalLigne(index);
  }

  onQuantityChange(index: number): void {
    this.calculerPrixTotalLigne(index);
  }

  calculerPrixTotalLigne(index: number): void {
    const ligneGroup = this.lignes.at(index) as FormGroup;
    const quantite = ligneGroup.get('quantite')?.value || 0;
    const prixUnitaire = ligneGroup.get('prixUnitaire')?.value || 0;
    const prixTotal = quantite * prixUnitaire;
    ligneGroup.get('prixTotalLigne')?.setValue(prixTotal);
    // Note: Pas besoin d'appeler calculerMontantTotal ici, car listenToLignesChanges le fait
  }

  // --- Calcul Montant Total ---

  listenToLignesChanges(): void {
    this.lignesVenteSub = this.lignes.valueChanges
      .pipe(
        debounceTime(100) // Évite les calculs trop fréquents
      )
      .subscribe(() => {
        this.calculerMontantTotal();
      });
    // Calcul initial
    this.calculerMontantTotal();
  }

  calculerMontantTotal(): void {
    this.montantTotal = this.lignes.controls.reduce((total, control) => {
      const group = control as FormGroup;
      // Utiliser getRawValue pour obtenir la valeur même si désactivé
      const prixLigne = group.getRawValue().prixTotalLigne || 0;
      return total + prixLigne;
    }, 0);
  }

  // --- Validation et Sauvegarde ---

  validerVente(): void {
    if (this.venteForm.invalid) {
      this.venteForm.markAllAsTouched(); // Marquer pour erreurs
      this.lignes.controls.forEach((control) =>
        (control as FormGroup).markAllAsTouched()
      );
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur de validation',
        detail: 'Veuillez corriger les erreurs dans le formulaire.',
      });
      return;
    }

    this.isSaving = true;
    const formValue = this.venteForm.getRawValue(); // Important pour obtenir les valeurs désactivées

    const venteData: Vente = {
      utilisateurId: formValue.utilisateurId,
      dateVente: formValue.dateVente,
      lignesVente: formValue.lignes.map((ligne: any) => ({
        produitId: ligne.produitId,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        prixTotalLigne: ligne.prixTotalLigne,
      })),
      montantTotal: this.montantTotal, // Utiliser la propriété calculée
    };

    this.venteService
      .ajouterVente(venteData)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          console.error('Erreur enregistrement vente:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Échec',
            detail: "Erreur lors de l'enregistrement de la vente.",
          });
          this.isSaving = false;
          return of(null); // Gérer l'erreur
        })
      )
      .subscribe((response) => {
        if (response) {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Vente enregistrée avec succès!',
          });
          this.venteForm.reset();
          this.lignes.clear(); // Vider les lignes
          this.addLigneVente(); // Ajouter une ligne vide
          this.venteForm.patchValue({ dateVente: new Date() }); // Remettre la date
          this.montantTotal = 0;
        }
        this.isSaving = false;
      });
  }
}
