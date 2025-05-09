import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Chart, registerables } from 'chart.js';
import { ChartDataService, InventoryLevelData } from '../../service/chart-data.service';
import { Subscription } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-inventory-chart',
  standalone: true,
  imports: [CommonModule, CardModule, DropdownModule, FormsModule],
  template: `
    <p-card class="inventory-chart-card" [style]="{ width: '100%', marginBottom: '1rem' }">
      <ng-template pTemplate="header">
        <div class="flex justify-content-between align-items-center p-3">
          <h3>Niveaux d'inventaire</h3>
          <p-dropdown 
            [options]="chartTypes" 
            [(ngModel)]="selectedChartType" 
            (onChange)="changeChartType()"
            optionLabel="name" 
            optionValue="value">
          </p-dropdown>
        </div>
      </ng-template>
      <div class="chart-container">
        <canvas #chartCanvas></canvas>
      </div>
    </p-card>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class InventoryChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chartDataService = inject(ChartDataService);
  
  private chart: Chart | undefined;
  private subscription: Subscription | undefined;
  
  chartData: InventoryLevelData | null = null;
  
  chartTypes = [
    { name: 'Barres', value: 'bar' },
    { name: 'Donut', value: 'doughnut' },
    { name: 'Radar', value: 'radar' },
  ];
  
  selectedChartType = 'bar';
  
  ngOnInit(): void {
    this.loadChartData();
  }
  
  ngAfterViewInit(): void {
    if (this.chartData) {
      this.createChart();
    }
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    if (this.chart) {
      this.chart.destroy();
    }
  }
  
  private loadChartData(): void {
    this.subscription = this.chartDataService.getInventoryLevelData().subscribe({
      next: (data) => {
        this.chartData = data;
        if (this.chartCanvas) {
          this.createChart();
        }
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
      }
    });
  }
  
  private createChart(): void {
    if (!this.chartData || !this.chartCanvas) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    if (this.chart) {
      this.chart.destroy();
    }
      this.chart = new Chart(ctx, {
      type: this.selectedChartType as 'bar' | 'doughnut' | 'radar',
      data: {
        labels: this.chartData.labels,
        datasets: this.chartData.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: false,
          }
        },
      }
    });
  }
    changeChartType(): void {
    if (this.chart) {
      // Recreate the chart with the new type instead of trying to change the type directly
      this.createChart();
    }
  }
}