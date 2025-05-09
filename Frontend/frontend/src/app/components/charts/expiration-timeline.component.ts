import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Chart, registerables } from 'chart.js';
import { ChartDataService, ExpirationTimelineData } from '../../service/chart-data.service';
import { Subscription } from 'rxjs';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-expiration-timeline',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card class="expiration-chart-card" [style]="{ width: '100%', marginBottom: '1rem' }">
      <ng-template pTemplate="header">
        <div class="flex justify-content-between align-items-center p-3">
          <h3>Chronologie des expirations</h3>
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
export class ExpirationTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chartDataService = inject(ChartDataService);
  
  private chart: Chart | undefined;
  private subscription: Subscription | undefined;
  
  chartData: ExpirationTimelineData | null = null;
  
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
    this.subscription = this.chartDataService.getExpirationTimelineData().subscribe({
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
    
    // Using a horizontal bar chart for the timeline
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.chartData.labels,
        datasets: [{
          label: this.chartData.datasets[0].label,
          data: this.chartData.datasets[0].data,
          backgroundColor: this.chartData.datasets[0].backgroundColor,
          borderColor: this.chartData.datasets[0].borderColor,
          borderWidth: this.chartData.datasets[0].borderWidth
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', // Make it a horizontal bar chart
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw as number;
                return `${value} produits`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Nombre de produits'
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            }
          },
          y: {
            title: {
              display: true,
              text: 'Délai avant expiration'
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
  }
}