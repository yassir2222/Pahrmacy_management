import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Chart, registerables } from 'chart.js';
import { ChartDataService, SalesPerformanceData } from '../../service/chart-data.service';
import { Subscription } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule, CardModule, DropdownModule, FormsModule, ButtonModule, CalendarModule],
  template: `
    <p-card class="sales-chart-card" [style]="{ width: '100%', marginBottom: '1rem' }">
      <ng-template pTemplate="header">
        <div class="flex justify-content-between align-items-center p-3">
          <h3>Performance des ventes</h3>
          <div class="flex align-items-center gap-2">
            <p-dropdown 
              [options]="periods" 
              [(ngModel)]="selectedPeriod" 
              (onChange)="updateChart()"
              optionLabel="name" 
              optionValue="value">
            </p-dropdown>
            <p-dropdown 
              [options]="chartTypes" 
              [(ngModel)]="selectedChartType" 
              (onChange)="changeChartType()"
              optionLabel="name" 
              optionValue="value">
            </p-dropdown>
          </div>
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
export class SalesChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chartDataService = inject(ChartDataService);
  
  private chart: Chart | undefined;
  private subscription: Subscription | undefined;
  
  chartData: SalesPerformanceData | null = null;
  
  chartTypes = [
    { name: 'Ligne', value: 'line' },
    { name: 'Barres', value: 'bar' },
  ];
  
  periods = [
    { name: '7 derniers jours', value: 'week' },
    { name: '30 derniers jours', value: 'month' },
    { name: '90 derniers jours', value: 'quarter' },
    { name: 'Cette année', value: 'year' },
  ];
  
  selectedChartType = 'line';
  selectedPeriod = 'month';
  
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
    this.subscription = this.chartDataService.getSalesPerformanceData().subscribe({
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
      type: this.selectedChartType as 'line' | 'bar',
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
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: function(value) {
                return value + ' €';
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
    changeChartType(): void {
    if (this.chart) {
      // Recreate the chart with the new type instead of trying to change the type directly
      this.createChart();
    }
  }
  
  updateChart(): void {
    // In a real application, you would fetch new data based on the selected period
    // For now, we'll just update the chart with the existing data
    if (this.chart) {
      this.chart.update();
    }
  }
}
