import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Produit } from '../../models/Produit';
import { ProductService } from '../../service/product.service';
import { FormeEnum } from '../../models/enums/FormeEnum';
import { ServerStatusService } from '../../service/server-status.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Import des modules PrimeNG
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-produit-list',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    // PrimeNG Modules
    TableModule,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    DropdownModule,
    FileUploadModule,
    InputNumberModule,
    InputTextModule,
    RadioButtonModule,
    RatingModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class ProduitComponent implements OnInit, OnDestroy {

  products: Produit[] = [];
  selectedProducts: Produit[] = [];
  product: Produit = {}; // Holds the product being created or edited
  productDialog: boolean = false;
  submitted: boolean = false;

  // Options for the Forme dropdown
  formes: any[] = [];

  // Données d'exemple pour le fallback si l'API échoue
  fallbackProducts: Produit[] = [
    { 
      id: 999,
      nomMedicament: 'Paracétamol (Example)',
      codeEAN: '3400930000000',
      prixVenteTTC: 5.99,
      prixAchatHT: 2.50,
      seuilStock: 10,
      forme: FormeEnum.COMPRIME,
      dosage: '500mg',
      quantiteTotaleEnStock: 25
    },
    {
      id: 998,
      nomMedicament: 'Ibuprofène (Example)',
      codeEAN: '3400931111111',
      prixVenteTTC: 6.99,
      prixAchatHT: 3.20,
      seuilStock: 8,
      forme: FormeEnum.COMPRIME,
      dosage: '200mg',
      quantiteTotaleEnStock: 15
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private serverStatusService: ServerStatusService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
    this.formes = Object.values(FormeEnum).map(value => ({ label: value, value: value }));

    // S'abonner au statut du serveur
    this.serverStatusService.serverStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        if (!isOnline) {
          this.messageService.add({ 
            severity: 'warn', 
            summary: 'Serveur indisponible', 
            detail: 'Le serveur backend est actuellement indisponible. Certaines fonctionnalités peuvent ne pas fonctionner.', 
            life: 5000 
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Produits loaded:', this.products);
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Chargement depuis le cache', 
          detail: 'Impossible de contacter le serveur. Affichage des données en cache.', 
          life: 5000 
        });
        
        // Utiliser les données de fallback si l'API échoue
        this.products = this.fallbackProducts;
        
        // Essayer de récupérer des produits de localStorage si disponibles
        const cachedProducts = localStorage.getItem('cachedProducts');
        if (cachedProducts) {
          try {
            this.products = JSON.parse(cachedProducts);
            console.log('Produits chargés depuis le cache:', this.products);
          } catch (e) {
            console.error('Erreur lors du chargement des produits depuis le cache:', e);
          }
        }
      }
    });
  }

  openNew(): void {
    this.product = {}; // Reset product object
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const idsToDelete = this.selectedProducts.map(p => p.id).filter(id => id !== undefined) as number[];
        if (idsToDelete.length === 0) {
          this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No valid products selected for deletion.', life: 3000 });
          return;
        }

        // NOTE: Adjust backend if it expects a different format for batch delete
        this.productService.deleteSelectedProducts(idsToDelete).subscribe({
            next: () => {
                this.products = this.products.filter(val => !this.selectedProducts.includes(val));
                this.selectedProducts = [];
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
            },
            error: (err) => {
                console.error('Error deleting selected products:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete selected products.', life: 3000 });
            }
        });
      }
    });
  }

  editProduct(product: Produit): void {
    // Clone the product to avoid modifying the original object directly in the table
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: Produit): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.nomMedicament + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (product.id === undefined) {
           console.error('Cannot delete product without ID:', product);
           this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product ID is missing.', life: 3000 });
           return;
        }
        this.productService.deleteProduct(product.id).subscribe({
            next: () => {
                this.products = this.products.filter(val => val.id !== product.id);
                this.product = {}; // Clear current product
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
                // If the deleted product was selected, remove it from selection
                this.selectedProducts = this.selectedProducts.filter(p => p.id !== product.id);
            },
            error: (err) => {
                console.error('Error deleting product:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product.', life: 3000 });
            }
        });
      }
    });
  }

  hideDialog(): void {
    this.productDialog = false;
    this.submitted = false;
  }

  saveProduct(): void {
    this.submitted = true;

    // Enhanced validation for required fields based on backend requirements
    if (!this.product.nomMedicament?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Le nom du médicament est obligatoire', life: 3000 });
      return;
    }

    if (!this.product.forme) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'La forme du médicament est obligatoire', life: 3000 });
      return;
    }

    // Ensure seuilStock is set (required by backend)
    if (this.product.seuilStock === undefined || this.product.seuilStock === null) {
      this.product.seuilStock = 0; // Default value
    }

    // Ensure quantiteTotaleEnStock is set (required by backend)
    if (this.product.quantiteTotaleEnStock === undefined || this.product.quantiteTotaleEnStock === null) {
      this.product.quantiteTotaleEnStock = 0; // Default value
    }

    // Ensure numeric values are properly converted (not strings)
    if (typeof this.product.prixVenteTTC === 'string') {
      this.product.prixVenteTTC = parseFloat(this.product.prixVenteTTC);
    }
    
    if (typeof this.product.prixAchatHT === 'string') {
      this.product.prixAchatHT = parseFloat(this.product.prixAchatHT);
    }
    
    if (typeof this.product.seuilStock === 'string') {
      this.product.seuilStock = parseInt(this.product.seuilStock);
    }
    
    if (typeof this.product.quantiteTotaleEnStock === 'string') {
      this.product.quantiteTotaleEnStock = parseInt(this.product.quantiteTotaleEnStock);
    }

    console.log('Saving product with data:', this.product);

    if (this.product.id) {
      // Update existing product
      this.productService.updateProduct(this.product.id, this.product).subscribe({
        next: (updatedProduct) => {
          const index = this.findIndexById(updatedProduct.id!);
          if (index !== -1) {
            this.products[index] = updatedProduct;
          } else {
            this.loadProducts();
          }
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Produit Mis à Jour', life: 3000 });
          this.productDialog = false;
          this.product = {}; // Clear current product
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update product: ' + err.message, life: 3000 });
        }
      });
    } else {
      // Create new product
      this.productService.createProduct(this.product).subscribe({
        next: (newProduct) => {
          this.products.push(newProduct);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Produit Créé', life: 3000 });
          this.productDialog = false;
          this.product = {}; // Clear current product
        },
        error: (err) => {
          console.error('Error creating product:', err);
          let errorMsg = 'Failed to create product';
          if (err.error && typeof err.error === 'string') {
            errorMsg += ': ' + err.error;
          } else if (err.message) {
            errorMsg += ': ' + err.message;
          }
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg, life: 5000 });
        }
      });
    }
  }

  findIndexById(id: number): number {
    let index = -1;
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }

  // --- Helper Functions ---

  // Placeholder for file upload handling - requires backend integration
  onUpload(event: any): void {
    // This is often more complex and requires sending the file to a specific backend endpoint
    console.log('File Upload Event:', event);
    this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: 'Implement backend logic for import.' });
    // Example: You might extract the file from event.files[0] and send it via HttpClient
    // For now, perhaps just reload products assuming import happened externally
    // this.loadProducts();
  }

    // Helper to determine stock status severity for the tag
    getStockSeverity(product: Produit): string {
        const stock = product.quantiteTotaleEnStock ?? 0;
        const threshold = product.seuilStock ?? 0; // Use 0 if seuilStock is undefined

        if (stock <= 0) {
            return 'danger'; // Out of Stock
        } else if (stock <= threshold) {
            return 'warning'; // Low Stock
        } else {
            return 'success'; // In Stock
        }
    }

    // Helper to get stock status text
    getStockStatusText(product: Produit): string {
        const stock = product.quantiteTotaleEnStock ?? 0;
        const threshold = product.seuilStock ?? 0;

        if (stock <= 0) {
            return 'HORS STOCK';
        } else if (stock <= threshold) {
            return 'STOCK FAIBLE';
        } else {
            return 'EN STOCK';
        }
    }

}