import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { ProductService } from '../../service/product.service'; // Use your service
import { Produit } from '../../models/Produit'; // Use backend model interface

// Import necessary PrimeNG Modules directly in component if using standalone
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for ngModel
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { FormeEnum } from '../../models/enums/FormeEnum';
// PDF Export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-produit',
  standalone: true, // Assuming standalone, adjust if using modules
  imports: [
      CommonModule,
      FormsModule,
      ToolbarModule,
      ButtonModule,
      FileUploadModule,
      TableModule,
      InputTextModule,
      DialogModule,
      InputIconModule,
      InputTextModule, // Use module import for standalone
      DropdownModule,
      RadioButtonModule,
      InputNumberModule,
      RatingModule, // Keep if needed, otherwise remove if no rating field
      TagModule,    // Keep if needed for status display
      ConfirmDialogModule,
      ToastModule,
      InputIconModule,
      IconFieldModule
  ],
  templateUrl: './produit.component.html',
  styleUrl: './produit.component.css',
  providers: [MessageService, ConfirmationService] // Provide services here for standalone
})
export class ProduitComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;

  productDialog: boolean = false;
  products: Produit[] = []; // Use Produit interface
  product: Produit = {};   // Use Produit interface
  selectedProducts: Produit[] = []; // Use Produit interface
  submitted: boolean = false;

  // Define options for FormeEnum dropdown/radio buttons
  formeOptions: any[] = [];

  // REMOVE statuses if not used by backend model
  // statuses: any[] = [];

  constructor(
    private productService: ProductService, // Inject the updated service
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadProducts(); 

    // Prepare options for the FormeEnum dropdown/radio buttons
    this.formeOptions = Object.keys(FormeEnum).map(key => ({
        label: key, 
        value: FormeEnum[key as keyof typeof FormeEnum]
    }));

  }

    formes: any[] = [
    { label: 'Comprimé', value: 'TABLET' },
    { label: 'Gélule', value: 'CAPSULE' },
    { label: 'Sirop', value: 'SYRUP' },
    { label: 'Injection', value: 'INJECTION' },
    { label: 'Crème', value: 'CREAM' },
    { label: 'Poudre', value: 'POWDER' },
    { label: 'Sachet', value: 'SACHET' }
  ];

  loadProducts() {
      this.productService.getProducts().subscribe({
          next: (data) => {
              this.products = data;
              console.log('Products loaded successfully');
          },
          error: (err: HttpErrorResponse) => { // Explicitly type the error
              console.error('Error loading products:', err);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load products. ' + err.message, life: 5000 });
          }
      });
  }


  openNew() {
    this.product = { forme: FormeEnum.TABLET, seuilStock: 0, quantiteTotaleEnStock: 0 }; 
    this.submitted = false;
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    if (!this.selectedProducts || this.selectedProducts.length === 0) {
        return; // Nothing to delete
    }
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const idsToDelete = this.selectedProducts.map(p => p.id).filter(id => id !== undefined) as number[]; // Get valid IDs

        if (idsToDelete.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No products with valid IDs selected', life: 3000 });
            return;
        }

        this.productService.deleteSelectedProducts(idsToDelete).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
                // Reload products or filter locally
                this.loadProducts(); // Easiest way to refresh
                this.selectedProducts = []; // Clear selection
            },
            error: (err) => {
                console.error('Error deleting selected products:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete products. ' + err.message, life: 3000 });
            }
        });
      }
    });
  }

  editProduct(product: Produit) {
    this.product = { ...product }; // Clone
    this.productDialog = true;
  }

  deleteProduct(product: Produit) {
     if (product.id === undefined) {
         console.error("Cannot delete product without ID");
         return;
     }
     const productId = product.id; // Store ID before clearing product object potentially

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.nomMedicament + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
         this.productService.deleteProduct(productId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
                 // Reload or filter locally
                this.loadProducts(); // Easiest way to refresh
                this.product = {}; // Clear current product if it was the one deleted
                this.selectedProducts = this.selectedProducts.filter(p => p.id !== productId); // Update selection
            },
            error: (err) => {
                console.error('Error deleting product:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete product. ' + err.message, life: 3000 });
            }
         });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
    this.product = {}; // Clear the form model
  }

  saveProduct() {
    this.submitted = true;

    // Add validation based on your backend model's requirements
    if (this.product.nomMedicament?.trim() && this.product.forme && this.product.seuilStock !== undefined) { // Example validation
      if (this.product.id) {
        // Update existing product
         const productId = this.product.id; // Keep id
        this.productService.updateProduct(productId, this.product).subscribe({
            next: (updatedProduct) => {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
                this.loadProducts(); // Refresh list
                this.hideDialog();
            },
            error: (err) => {
                 console.error('Error updating product:', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not update product. ' + err.message , life: 3000 });
            }
        });

      } else {
        // Create new product
        // Remove id if present before sending for creation
        const { id, ...newProductData } = this.product;

        this.productService.createProduct(newProductData).subscribe({
             next: (createdProduct) => {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
                this.loadProducts(); // Refresh list
                this.hideDialog();
            },
            error: (err) => {
                 console.error('Error creating product:', err);
                 this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not create product. ' + err.message, life: 3000 });
                // Optionally keep dialog open on error
            }
        });
      }
    } else {
         this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields correctly.', life: 3000 });
    }
  }

  onUpload(event: any) {
      console.log('File upload triggered (needs implementation):', event);
      this.messageService.add({severity: 'info', summary: 'Info', detail: 'File import not implemented yet.'});
  }

   // Keep global filter function
   applyFilterGlobal($event: any, stringVal: string) {
     this.dt?.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
   }
   
getStockStatusText(product: any): string {
  if (!product.quantiteTotaleEnStock) return 'Rupture';
  if (product.quantiteTotaleEnStock <= 5) return 'Faible';
  return 'En stock';
}

getStockSeverity(product: any): string {
  if (!product.quantiteTotaleEnStock) return 'danger';
  if (product.quantiteTotaleEnStock <= 5) return 'warning';
  return 'success';
}

 exportPdf() {
    if (!this.products || this.products.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Avertissement', detail: 'Aucun produit à exporter.', life: 3000 });
      return;
    }

    const doc = new jsPDF();
    const tableColumn = ["Code EAN", "Nom Médicament", "Forme", "Dosage", "Prix TTC", "Stock", "Statut"];
    const tableRows: any[][] = [];

    this.products.forEach(prod => {
      const productData = [
        prod.codeEAN || '-',
        prod.nomMedicament || '-',
        prod.forme || '-',
        prod.dosage || '-',
        prod.prixVenteTTC !== undefined && prod.prixVenteTTC !== null ? prod.prixVenteTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '-',
        prod.quantiteTotaleEnStock !== undefined ? prod.quantiteTotaleEnStock : 0,
        this.getStockStatusText(prod)
      ];
      tableRows.push(productData);
    });

    doc.setFontSize(18);
    doc.text("Rapport des Produits", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [22, 160, 133] },
      didDrawPage: (dataArg: any) => {
        doc.setFontSize(10);
        const pageCount = doc.getNumberOfPages();
        doc.text('Page ' + String(dataArg.pageNumber) + ' sur ' + String(pageCount), dataArg.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save('rapport_produits_spec.pdf'); // Changed name to avoid conflict
    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Rapport PDF généré (depuis spec).', life: 3000 });
  }


}