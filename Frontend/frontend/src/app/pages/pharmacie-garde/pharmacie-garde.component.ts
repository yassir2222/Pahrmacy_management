import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PharmacieGarde } from '../../models/PharmacieGarde';
import { PharmacieGardeService } from '../../service/pharmacie-garde.service';

// Import des modules PrimeNG
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-pharmacie-garde',
  templateUrl: './pharmacie-garde.component.html',
  styleUrls: ['./pharmacie-garde.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    // PrimeNG Modules
    TableModule,
    ToastModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    RippleModule,
    CardModule,
    DividerModule,
    TagModule
  ],
  providers: [MessageService]
})
export class PharmacieGardeComponent implements OnInit {

  pharmaciesGarde: PharmacieGarde[] = [];
  selectedVille: string = '';
  selectedPeriode: string = '';
  villes: any[] = [];
  periodes: any[] = [];
  loading: boolean = true;

  constructor(
    private pharmacieGardeService: PharmacieGardeService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadPharmaciesGarde();
    this.loadVilles();
    this.loadPeriodes();
  }

  loadPharmaciesGarde(): void {
    this.loading = true;
    this.pharmacieGardeService.getActivePharmaciesGarde().subscribe({
      next: (data) => {
        this.pharmaciesGarde = data;
        this.loading = false;
        console.log('Pharmacies de garde chargées:', this.pharmaciesGarde);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des pharmacies de garde:', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les pharmacies de garde.', life: 3000 });
        this.loading = false;
      }
    });
  }

  loadVilles(): void {
    this.pharmacieGardeService.getVilles().subscribe({
      next: (villes) => {
        this.villes = villes.map(ville => ({ label: ville, value: ville }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des villes:', err);
      }
    });
  }

  loadPeriodes(): void {
    this.pharmacieGardeService.getPeriodes().subscribe({
      next: (periodes) => {
        this.periodes = periodes.map(periode => ({ 
          label: periode === 'MATIN' ? 'Matin' : periode === 'NUIT' ? 'Nuit' : 'Journée', 
          value: periode 
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des périodes:', err);
      }
    });
  }

  filterByVille(): void {
    if (!this.selectedVille) {
      this.loadPharmaciesGarde();
      return;
    }

    this.loading = true;
    this.pharmacieGardeService.getPharmaciesGardeByVille(this.selectedVille).subscribe({
      next: (data) => {
        this.pharmaciesGarde = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Erreur lors du filtrage par ville ${this.selectedVille}:`, err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `Impossible de filtrer par ville ${this.selectedVille}.`, life: 3000 });
        this.loading = false;
      }
    });
  }

  filterByPeriode(): void {
    if (!this.selectedPeriode) {
      this.loadPharmaciesGarde();
      return;
    }

    this.loading = true;
    this.pharmacieGardeService.getPharmaciesGardeByPeriode(this.selectedPeriode).subscribe({
      next: (data) => {
        this.pharmaciesGarde = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(`Erreur lors du filtrage par période ${this.selectedPeriode}:`, err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `Impossible de filtrer par période ${this.selectedPeriode}.`, life: 3000 });
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.selectedVille = '';
    this.selectedPeriode = '';
    this.loadPharmaciesGarde();
  }

  getPeriodeClass(periode: string): string {
    switch (periode) {
      case 'MATIN': return 'p-tag-info';
      case 'NUIT': return 'p-tag-danger';
      case 'JOURNÉE': return 'p-tag-success';
      default: return 'p-tag-warning';
    }
  }

  getPeriodeLabel(periode: string): string {
    switch (periode) {
      case 'MATIN': return 'Matin';
      case 'NUIT': return 'Nuit';
      case 'JOURNÉE': return 'Journée';
      default: return periode;
    }
  }
}