import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Chart, registerables } from 'chart.js';
import { ChartDataService, InventoryForecastData } from '../../service/chart-data.service';
import { Subscription } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-inventory-forecast',
  standalone: true,
  imports: [CommonModule, CardModule, DropdownModule, FormsModule],
  template: `
    <p-card class="forecast-chart-card" [style]="{ width: '100%', marginBottom: '1rem' }">
      <ng-template pTemplate="header">
        <div class="flex justify-content-between align-items-center p-3">
          <h3>Prévision d'inventaire</h3>
          <p-dropdown 
            [options]="viewOptions" 
            [(ngModel)]="selectedView" 
            (onChange)="updateChart()"
            optionLabel="name" 
            optionValue="value">
          </p-dropdown>
        </div>
      </ng-template>
      <div class="chart-container">
        <canvas #chartCanvas></canvas>
      </div>
      <ng-template pTemplate="footer">
        <div class="forecast-info">
          <div class="info-item">
            <div class="status status-warning"></div>
            <span>Niveau actuel</span>
          </div>
          <div class="info-item">
            <div class="status status-info"></div>
            <span>Prévision</span>
          </div>
          <div class="info-item">
            <div class="status status-danger"></div>
            <span>Seuil critique</span>
          </div>
        </div>
      </ng-template>
    </p-card>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
    .forecast-info {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-top: 1rem;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .status {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .status-warning {
      background-color: rgba(255, 206, 86, 1);
    }
    .status-info {
      background-color: rgba(54, 162, 235, 1);
    }
    .status-danger {
      background-color: rgba(255, 99, 132, 1);
    }
  `]
})
export class InventoryForecastComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chartDataService = inject(ChartDataService);
  
  private chart: Chart | undefined;
  private subscription: Subscription | undefined;
  
  chartData: InventoryForecastData | null = null;
  
  viewOptions = [
    { name: '2 mois', value: '2m' },
    { name: '6 mois', value: '6m' },
    { name: '1 an', value: '1y' },
  ];
  
  selectedView = '2m';
  
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
    this.subscription = this.chartDataService.getInventoryForecastData().subscribe({
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
      type: 'line',
      data: {
        labels: this.chartData.labels,
        datasets: this.chartData.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            },
            title: {
              display: true,
              text: 'Unités'
            }
          },
          x: {
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'Période'
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }
  
  updateChart(): void {
    // In a real application, you would fetch new data based on the selected view
    // For now, we'll just update the chart with the existing data
    if (this.chart) {
      this.chart.update();
    }
  }
}