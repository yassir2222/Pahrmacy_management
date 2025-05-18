// ... existing imports ...
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators ,FormsModule} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';

// PrimeNG Modules (déjà présents dans vos imports standalone)
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Importez vos vrais modèles et services
import { Produit } from '../../models/Produit';
import { LotDeStock } from '../../models/LotDeStock'; // Assurez-vous que ce modèle existe dans app/models
import { Vente } from '../../models/Vente';
import { LigneVenteRequest } from '../../models/LigneVenteRequest';
import { VenteRequest } from '../../models/VenteRequest';
import { User } from '../../models/User';

import { VenteService } from '../../service/vente.service'; // VRAI SERVICE
import { map } from 'leaflet';
import { HttpHeaders } from '@angular/common/http';
// import { ProductService } from '../../services/product.service'; // Si vous avez un service produit séparé
// import { LotService } from '../../services/lot.service'; // Si vous avez un service lot séparé
// import { AuthService } from '../../services/auth.service'; // Pour l'ID utilisateur

// Interface pour le panier
interface ProduitPanier extends Produit {
  quantiteAVendre: number;
}

@Component({
  selector: 'app-vente',
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
    ButtonModule,
    DialogModule,
    InputTextModule,
    CalendarModule,
    InputNumberModule,
    BadgeModule,
    TooltipModule,
    FormsModule,
    ProgressSpinnerModule
    // ... autres modules PrimeNG que vous utilisez
  ],
  templateUrl: './vente.component.html',
  styleUrls: ['./vente.component.css'],
  providers: [
    MessageService,
    ConfirmationService,
    DatePipe,
    CurrencyPipe,
    // Les services avec providedIn: 'root' n'ont pas besoin d'être listés ici
    // Si vos services ne sont pas 'providedIn: "root"', ajoutez-les ici.
    // Ex: ProductService, LotService, AuthService
  ]
})
export class VenteComponent implements OnInit {
  // --- Propriétés pour la gestion des lots (existantes) ---
  produitsListPourLots: Produit[] = []; // Renommé pour clarté
  selectedProduitDetailsPourLots: Produit | null = null; // Renommé
  lotsList: LotDeStock[] = [];
  produitSelectionForm!: FormGroup; // Pour la sélection de produit pour voir les lots
  lotForm!: FormGroup;
  isLoadingProduitsPourLots: boolean = false; // Renommé
  isLoadingSelectedProduitDetails: boolean = false;
  isLoadingLots: boolean = false;
  isSavingLot: boolean = false;
  lotDialogVisible: boolean = false;
  isLotEditMode: boolean = false;
  submittedLot: boolean = false;
  currentEditingLotId: number | null = null;

  // --- Propriétés pour la Nouvelle Vente ---
  produitsDisponiblesPourVente: Produit[] = [];
  panier: ProduitPanier[] = [];
  selectedProduitIdPourPanier?: number;
  quantitePourProduitPanier: number = 1;
  currentUserId: number = 1; // TODO: À remplacer par l'ID de l'utilisateur connecté (via AuthService)
  isLoadingVente: boolean = false;

  // --- Propriétés pour l'Historique des Ventes ---
  historiqueVentes: Vente[] = [];
  isLoadingHistorique: boolean = false;

  selectedVenteForDetails: Vente | null = null; // To store the sale whose details are being viewed
  venteDetailsDialogVisible: boolean = false; //
  venteToEdit: Vente | null = null;
  editVenteDialogVisible: boolean = false;
  isSubmittingEditVente: boolean = false;
  

  panierPourEdition: ProduitPanier[] = [];
  selectedProduitIdPourEditionPanier?: number;
  quantitePourProduitEditionPanier: number = 1;
  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private venteService: VenteService, // VRAI SERVICE
    // private productService: ProductService, // Si séparé
    // @Inject('LotService') private lotService: ILotService, // Si vous gardez l'injection par token pour un LotService réel
    // private authService: AuthService // Pour l'ID utilisateur
  ) {}

  ngOnInit(): void {
    // Initialisation pour la gestion des lots (existante)
    this.produitSelectionForm = this.fb.group({
      produitId: [null, Validators.required]
    });
    this.lotForm = this.fb.group({
      numeroLot: ['', Validators.required],
      dateExpiration: [null, Validators.required],
      quantite: [null, [Validators.required, Validators.min(1)]],
      prixAchatHT: [null, [Validators.required, Validators.min(0.01)]],
      dateReception: [null]
    });
    this.loadProduitsPourGestionLots(); // Charger les produits pour le dropdown de gestion des lots

    // Initialisation pour la nouvelle vente
    this.loadProduitsDisponiblesPourVente();
    // this.currentUserId = this.authService.getCurrentUser()?.id; // Exemple avec AuthService

    // Initialisation pour l'historique des ventes
    this.loadHistoriqueVentes();
  }

  // --- Méthodes pour la Nouvelle Vente ---
  loadProduitsDisponiblesPourVente(): void {
    this.isLoadingVente = true;
    // Utilisez votre vrai service produit ici si vous en avez un
    this.venteService.getProduitsDisponiblesPourVente().subscribe({
      next: (data) => {
        this.produitsDisponiblesPourVente = data;
        this.isLoadingVente = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les produits pour la vente.' });
        console.error(err);
        this.isLoadingVente = false;
      }
    });
  }

  ajouterAuPanier(): void {

    if (!this.selectedProduitIdPourPanier || this.quantitePourProduitPanier <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner un produit et une quantité valide.' });
      return;
    }
    const produitSource = this.produitsDisponiblesPourVente.find(p => p.id === this.selectedProduitIdPourPanier);
    if (!produitSource) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Produit non trouvé.' });
      return;
    }
    if (produitSource.quantiteTotaleEnStock === undefined || produitSource.quantiteTotaleEnStock === null || produitSource.quantiteTotaleEnStock < this.quantitePourProduitPanier) {
      this.messageService.add({ severity: 'warn', summary: 'Stock insuffisant', detail: `Stock disponible pour ${produitSource.nomMedicament}: ${produitSource.quantiteTotaleEnStock || 0}` });
      return;
    }
    if (produitSource.prixVenteTTC === null || produitSource.prixVenteTTC === undefined) {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `Prix de vente non défini pour ${produitSource.nomMedicament}.` });
        return;
    }

    const itemExistant = this.panier.find(item => item.id === this.selectedProduitIdPourPanier);
    if (itemExistant) {
      // Vérifier si l'ajout dépasse le stock total
      if (produitSource.quantiteTotaleEnStock < (itemExistant.quantiteAVendre + this.quantitePourProduitPanier) ) {
        this.messageService.add({ severity: 'warn', summary: 'Stock insuffisant', detail: `Quantité demandée (${itemExistant.quantiteAVendre + this.quantitePourProduitPanier}) dépasse le stock (${produitSource.quantiteTotaleEnStock}) pour ${produitSource.nomMedicament}.` });
        return;
      }
      itemExistant.quantiteAVendre += this.quantitePourProduitPanier;
    } else {
      this.panier.push({ ...produitSource, quantiteAVendre: this.quantitePourProduitPanier });
    }
    this.selectedProduitIdPourPanier = undefined;
    this.quantitePourProduitPanier = 1;
  }

  retirerDuPanier(produitId: number): void {
    this.panier = this.panier.filter(item => item.id !== produitId);
  }

  calculerTotalPanier(): number {
    return this.panier.reduce((total, item) => {
        const prix = item.prixVenteTTC !== null && item.prixVenteTTC !== undefined ? item.prixVenteTTC : 0;
        return total + (prix * item.quantiteAVendre);
    }, 0);
  }

  finaliserVente(): void {
    if (this.panier.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Panier vide', detail: 'Ajoutez des produits avant de finaliser.' });
      return;
    }
    if (!this.currentUserId) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Utilisateur non identifié pour la vente.' });
      return;
    }

    const lignesVente: LigneVenteRequest[] = this.panier.map(item => {
        if (item.prixVenteTTC === null || item.prixVenteTTC === undefined) {
            throw new Error(`Prix de vente non défini pour le produit ID ${item.id} dans le panier.`);
        }
        if (item.id === undefined) {
            throw new Error(`ID de produit non défini dans le panier.`);
        }
        return {
            produitId: item.id,
            quantite: item.quantiteAVendre,
            prixUnitaireVenteTTC: item.prixVenteTTC
        };
    });

    const venteRequest: VenteRequest = {
      userId: this.currentUserId,
      lignesVente: lignesVente
    };

    this.isLoadingVente = true;
    this.venteService.creerVente(venteRequest).subscribe({
      next: (nouvelleVenteOuMessage) => {
        if (typeof nouvelleVenteOuMessage === 'string') { // Gestion d'un message d'erreur du backend
            this.messageService.add({ severity: 'error', summary: 'Erreur Vente', detail: nouvelleVenteOuMessage });
        } else {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Vente enregistrée avec succès!' });
            console.log('Vente enregistrée:', nouvelleVenteOuMessage);
            this.panier = [];
            this.loadProduitsDisponiblesPourVente(); // Rafraîchir les stocks
            this.loadHistoriqueVentes(); // Rafraîchir l'historique
        }
        this.isLoadingVente = false;
      },
      error: (errorMessage) => { // Géré par handleErrorExtended qui peut retourner une string
        this.messageService.add({ severity: 'error', summary: 'Erreur Vente', detail: errorMessage });
        console.error('Erreur lors de la création de la vente:', errorMessage);
        this.isLoadingVente = false;
      }
    });

  }




  openEditVenteDialog(vente: Vente): void {
    this.venteToEdit = JSON.parse(JSON.stringify(vente)); // Create a deep copy
    this.editVenteDialogVisible = true; // Make sure to set this to true
    // Logique pour pré-remplir le formulaire d'édition si nécessaire
    console.log("Opening edit dialog for sale:", this.venteToEdit);
    // this.messageService.add({severity: 'info', summary: 'Fonctionnalité en développement', detail: 'L\'édition de vente est complexe.'});
  }



  // --- Méthodes pour l'Historique des Ventes ---
 

  // --- Méthodes pour la gestion des lots (existantes, à adapter avec vrais services si nécessaire) ---
  loadProduitsPourGestionLots(): void { // Renommé
    this.isLoadingProduitsPourLots = true;
    // Remplacez this.produitServiceMock.getProduits() par votre vrai service
    // Exemple: this.productService.getProducts() ou this.venteService.getProduitsDisponiblesPourVente()
    // Pour l'instant, je vais simuler un appel qui pourrait venir de VenteService ou un ProductService
     this.venteService.getProduitsDisponiblesPourVente().pipe( // ou un appel à un ProductService dédié
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les produits pour la gestion des lots.' });
        console.error(err);
        return of([]);
      }),
      tap(() => this.isLoadingProduitsPourLots = false)
    ).subscribe(data => {
      this.produitsListPourLots = data;
    });
  }

  onProduitSelectedPourLots(produitId: number | null): void { // Renommé
    this.selectedProduitDetailsPourLots = null;
    this.lotsList = [];

    if (produitId) {
      this.isLoadingSelectedProduitDetails = true;
      this.isLoadingLots = true; // Aussi pour les lots

      // Simulez l'appel à getProduitById et getLotsByProduitId avec vos vrais services
      // Exemple:
      // const produitDetails$ = this.productService.getProductById(produitId);
      // const lotsDetails$ = this.lotService.getLotsByProductId(produitId);
      // forkJoin({ details: produitDetails$, lots: lotsDetails$ }).subscribe(...)

      // Pour l'instant, simulation simple (le backend ne fournit pas ces endpoints séparément dans VenteController)
      // Vous aurez besoin d'un ProductService et LotService pour cela.
      // Je vais juste trouver le produit dans la liste chargée.
      const foundProduit = this.produitsListPourLots.find(p => p.id === produitId);
      if (foundProduit) {
          this.selectedProduitDetailsPourLots = foundProduit;
          // Ici, vous appelleriez lotService.getLotsByProduitId(produitId)
          // this.lotService.getLotsByProduitId(produitId).subscribe(lots => this.lotsList = lots);
          this.messageService.add({severity: 'info', summary: 'Info', detail: 'La récupération des lots nécessite un LotService fonctionnel.'});
          this.lotsList = []; // Vider en attendant un vrai service
      } else {
          this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Détails du produit non trouvés.' });
      }
      this.isLoadingSelectedProduitDetails = false;
      this.isLoadingLots = false;
    }
  }

  openNewLotDialog(): void {
    if (!this.produitSelectionForm.value.produitId) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Veuillez d\'abord sélectionner un produit.' });
      return;
    }
    this.isLotEditMode = false;
    this.submittedLot = false;
    this.currentEditingLotId = null;
    this.lotForm.reset();
    if (this.selectedProduitDetailsPourLots && this.selectedProduitDetailsPourLots.prixAchatHT) {
        this.lotForm.patchValue({ prixAchatHT: this.selectedProduitDetailsPourLots.prixAchatHT });
    }
    this.lotDialogVisible = true;
  }

  openEditLotDialog(lot: LotDeStock): void {
    this.isLotEditMode = true;
    this.submittedLot = false;
    this.currentEditingLotId = lot.id;
    this.lotForm.patchValue({
      ...lot,
      dateExpiration: lot.dateExpiration ? new Date(lot.dateExpiration) : null,
      dateReception: lot.dateReception ? new Date(lot.dateReception) : null
    });
    this.lotDialogVisible = true;
  }

  hideLotDialog(): void {
    this.lotDialogVisible = false;
    this.submittedLot = false;
    this.currentEditingLotId = null;
  }

  saveLot(): void {
    this.submittedLot = true;
    if (this.lotForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Veuillez corriger les erreurs du formulaire.' });
      return;
    }
    if (!this.selectedProduitDetailsPourLots && !this.isLotEditMode) { // Correction: utiliser selectedProduitDetailsPourLots
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucun produit sélectionné pour associer le lot.' });
        return;
    }

    this.isSavingLot = true;
    const lotDataFromForm = { ...this.lotForm.value };
    const produitIdPourLot = this.selectedProduitDetailsPourLots!.id; // Assurer que selectedProduitDetailsPourLots est non null

    let saveObservable: Observable<LotDeStock>; // Le type Lot est un exemple, adaptez à ce que votre LotService renvoie

    // Remplacez par les appels à votre vrai LotService
    // if (this.isLotEditMode && this.currentEditingLotId) {
    //   saveObservable = this.lotService.updateLot({ ...lotDataFromForm, id: this.currentEditingLotId, produitId: produitIdPourLot });
    // } else {
    //   saveObservable = this.lotService.addLot({ ...lotDataFromForm, produitId: produitIdPourLot });
    // }
    this.messageService.add({severity: 'info', summary: 'Info', detail: 'La sauvegarde des lots nécessite un LotService fonctionnel.'});
    this.isSavingLot = false;
    this.hideLotDialog();
    // saveObservable.pipe(
    //   catchError(err => { /* ... */ })
    // ).subscribe(() => { /* ... */ });
  }

  confirmDeleteLot(lot: LotDeStock): void {
    this.confirmationService.confirm({
      key: 'deleteLotConfirmation', // Assurez-vous que p-confirmDialog a cette clé
      message: `Êtes-vous sûr de vouloir supprimer le lot N°${lot.numeroLot} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteLot(lot.id);
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Annulé', detail: 'Suppression du lot annulée.' });
      }
    });
  }

  deleteLot(lotId: number): void {
    this.isLoadingLots = true;
    // Remplacez par l'appel à votre vrai LotService
    // this.lotService.deleteLot(lotId).pipe(catchError(err => { /* ... */ })).subscribe(() => { /* ... */ });
    this.messageService.add({severity: 'info', summary: 'Info', detail: 'La suppression des lots nécessite un LotService fonctionnel.'});
    this.isLoadingLots = false;
    if (this.selectedProduitDetailsPourLots && this.selectedProduitDetailsPourLots.id !== undefined) {
        this.onProduitSelectedPourLots(this.selectedProduitDetailsPourLots.id);
    }
  }

  getBadgeValue(lot: LotDeStock): string {
    const expirationDate = new Date(lot.dateExpiration);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    if (lot.quantite <= 0) return 'Épuisé';
    if (expirationDate < today) return 'Expiré';
    if (expirationDate < threeMonthsFromNow) return 'Expire Bientôt';
    return 'En Stock';
  }

  getBadgeSeverity(lot: LotDeStock): string {
    const expirationDate = new Date(lot.dateExpiration);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    if (lot.quantite <= 0 || expirationDate < today) return 'danger';
    if (expirationDate < threeMonthsFromNow) return 'warning';
    return 'success';
  }

  // Helper pour l'image du produit dans la section gestion des lots
  get selectedProduitPourImageLots(): Produit | null {
    const selectedId = this.produitSelectionForm.get('produitId')?.value;
    if (selectedId) {
      return this.produitsListPourLots.find(p => p.id === selectedId) || null;
    }
    return null;
  }


   loadHistoriqueVentes(): void {
    this.isLoadingHistorique = true;
    this.venteService.getAllVentes().subscribe({
      next: (data) => {
        this.historiqueVentes = data;
        this.isLoadingHistorique = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger l\'historique des ventes.' });
        console.error(err);
        this.isLoadingHistorique = false;
      }
    });
  }

  // Add this method
  showVenteDetails(vente: Vente): void {
    this.selectedVenteForDetails = vente;
    this.venteDetailsDialogVisible = true;
  }

  hideVenteDetailsDialog(): void {
    this.venteDetailsDialogVisible = false;
    this.selectedVenteForDetails = null;
  }


  /**
   * Met à jour une vente existante.
   * @param id L'ID de la vente à mettre à jour.
   * @param venteRequest Les nouvelles données de la vente.
   * @returns Observable<Vente | string>
   * @remarks Nécessite un endpoint PUT /api/ventes/{id} sur le backend.
   */
  updateVente(id: number, venteRequest: VenteRequest): Observable<Vente | string> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };
    console.warn(`[VenteService] updateVente appelé. Backend endpoint PUT  requis.`);
    // Décommentez et adaptez lorsque le backend est prêt
    // return this.http.put<Vente>(`${this.apiUrl}/${id}`, venteRequest, httpOptions)
    //   .pipe(
    //     tap(data => console.log('Vente mise à jour:', data)),
    //     catchError(this.handleErrorExtended)
    //   );
    return of(`Simulation: Vente ${id} mise à jour (backend non implémenté)`).pipe(delay(500)); // Simulation
  }

 

 

  ajouterAuPanierEdition(): void {
    if (!this.selectedProduitIdPourEditionPanier || this.quantitePourProduitEditionPanier <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Attention', detail: 'Sélectionnez un produit et une quantité.' });
      return;
    }
    const produitSource = this.produitsDisponiblesPourVente.find(p => p.id === this.selectedProduitIdPourEditionPanier);
    if (!produitSource) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Produit non trouvé.' });
      return;
    }
     // Pour l'édition, la vérification de stock est plus complexe car on modifie une vente existante.
     // Le backend gère la logique de stock lors de la modification.
     // On peut toutefois faire une vérification indicative.
    if (produitSource.prixVenteTTC === null || produitSource.prixVenteTTC === undefined) {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `Prix de vente non défini pour ${produitSource.nomMedicament}.` });
        return;
    }

    const itemExistant = this.panierPourEdition.find(item => item.id === this.selectedProduitIdPourEditionPanier);
    if (itemExistant) {
      itemExistant.quantiteAVendre += this.quantitePourProduitEditionPanier;
    } else {
      this.panierPourEdition.push({ ...produitSource, quantiteAVendre: this.quantitePourProduitEditionPanier });
    }
    this.selectedProduitIdPourEditionPanier = undefined;
    this.quantitePourProduitEditionPanier = 1;
  }

  retirerDuPanierEdition(produitId: number): void {
    this.panierPourEdition = this.panierPourEdition.filter(item => item.id !== produitId);
  }

  calculerTotalPanierEdition(): number {
    return this.panierPourEdition.reduce((total, item) => {
      const prix = item.prixVenteTTC ?? 0;
      return total + (prix * item.quantiteAVendre);
    }, 0);
  }

  saveEditedVente(): void {
    if (!this.venteToEdit || !this.venteToEdit.id) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Aucune vente sélectionnée pour la modification.' });
      return;
    }
    if (this.panierPourEdition.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Panier vide', detail: 'Ajoutez des produits à la vente modifiée.' });
      return;
    }

    const lignesVenteModifiees: LigneVenteRequest[] = this.panierPourEdition.map(item => {
      if (item.id === undefined) throw new Error(`ID de produit non défini dans le panier d'édition.`);
      if (item.prixVenteTTC === null || item.prixVenteTTC === undefined) {
        throw new Error(`Prix de vente non défini pour le produit ID ${item.id} dans le panier d'édition.`);
      }
      return {
        produitId: item.id,
        quantite: item.quantiteAVendre,
        prixUnitaireVenteTTC: item.prixVenteTTC // Utiliser le prix de l'item dans le panier d'édition
      };
    });

    // Le VenteRequest backend n'a pas userId, il est inféré ou non modifiable via cet endpoint.
    const venteRequest: VenteRequest = {
      lignesVente: lignesVenteModifiees
    };

    this.isSubmittingEditVente = true;
    this.venteService.updateVente(this.venteToEdit.id, venteRequest).subscribe({
      next: (venteModifieeOuMessage) => {
        if (typeof venteModifieeOuMessage === 'string') {
            this.messageService.add({ severity: 'error', summary: 'Erreur Modification', detail: venteModifieeOuMessage });
        } else {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Vente modifiée avec succès!' });
            this.hideEditVenteDialog();
            this.loadHistoriqueVentes();
            this.loadProduitsDisponiblesPourVente(); // Stocks ont pu changer
        }
        this.isSubmittingEditVente = false;
      },
      error: (errorMessage) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur Modification', detail: errorMessage });
        this.isSubmittingEditVente = false;
      }
    });
  }

  hideEditVenteDialog(): void {
    this.editVenteDialogVisible = false;
    this.venteToEdit = null;
    this.panierPourEdition = [];
    this.isSubmittingEditVente = false;
  }


   confirmDeleteVente(vente: Vente): void {
    if (!vente || typeof vente.id !== 'number') {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Données de vente invalides pour la suppression.' });
        return;
    }
    const venteId = vente.id;
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer la vente N°${venteId} du ${new Date(vente.dateVente).toLocaleDateString()} ? Cette action restituera les stocks.`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.deleteVente(venteId);
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Annulé', detail: 'Suppression de la vente annulée.' });
      }
    });
  }

  deleteVente(venteId: number): void {
    this.isLoadingHistorique = true; // ou un indicateur spécifique
    this.venteService.deleteVente(venteId).subscribe({
      next: (response) => { // Peut être void ou un message de succès si le service est adapté
        if (typeof response === 'string' && response.length > 0) { // Check if backend sent a string message on success
             this.messageService.add({ severity: 'success', summary: 'Succès', detail: response });
        } else { // Standard void success
             this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Vente supprimée avec succès.' });
        }
        this.loadProduitsDisponiblesPourVente(); // Refresh stock
        this.loadHistoriqueVentes(); // Refresh history
        this.isLoadingHistorique = false;
      },
      error: (errorMessage) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur Suppression', detail: errorMessage });
        this.isLoadingHistorique = false;
      }
    });
  }
}