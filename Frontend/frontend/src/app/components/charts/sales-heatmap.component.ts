import { Component, OnInit, AfterViewInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Chart, registerables } from 'chart.js';
import { ChartDataService, SalesTimeHeatmapData } from '../../service/chart-data.service';
import { Subscription } from 'rxjs';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-sales-heatmap',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card class="heatmap-chart-card" [style]="{ width: '100%', marginBottom: '1rem' }">
      <ng-template pTemplate="header">
        <div class="flex justify-content-between align-items-center p-3">
          <h3>Heures d'affluence</h3>
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
export class SalesHeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chartDataService = inject(ChartDataService);
  
  private chart: Chart | undefined;
  private subscription: Subscription | undefined;
  
  chartData: SalesTimeHeatmapData | null = null;
  
  ngOnInit(): void {
    this.loadChartData();
  }
    ngAfterViewInit(): void {
    if (this.chartData) {
      this.createChart();
    }
  }
  
  private createChart(): void {
    if (this.chartData) {
      this.createHeatmapChart();
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
    this.subscription = this.chartDataService.getSalesTimeHeatmapData().subscribe({
      next: (data) => {
        this.chartData = data;
        if (this.chartCanvas) {
          this.createHeatmapChart();
        }
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
      }
    });
  }
  
  private createHeatmapChart(): void {
    if (!this.chartData || !this.chartCanvas) return;
    
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    
    if (this.chart) {
      this.chart.destroy();
    }
    
    // Transform heatmap data into format suitable for Chart.js
    const datasets = this.chartData.days.map((day, index) => {
      return {
        label: day,
        data: this.chartData!.data[index],
        backgroundColor: this.getBackgroundColor(this.chartData!.data[index]),
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        barPercentage: 1,
        categoryPercentage: 0.95,
      };
    });
    
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.chartData.hours,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const dayIndex = context.datasetIndex || 0;
                const hourIndex = context.dataIndex || 0;
                const day = datasets[dayIndex].label;
                const hour = context.chart.data.labels?.[hourIndex];
                const value = context.raw as number;
                return `${day}, ${hour}: ${value} ventes`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'Heures'
            }
          },
          y: {
            stacked: true,
            grid: {
              display: false
            },
            title: {
              display: true,
              text: 'Jours de la semaine'
            }
          }
        }
      }
    });
  }
  
  private getBackgroundColor(values: number[]): string[] {
    // Generate a color gradient based on the value
    // Higher values will be darker red, lower values will be lighter
    return values.map(value => {
      // Normalize the value between 0 and 1 based on a reasonable max value
      const maxExpected = 70; // Adjust this based on your data
      const normalized = Math.min(value / maxExpected, 1);
      
      // Calculate RGB values for a red gradient
      const r = 255;
      const g = Math.round(255 * (1 - normalized));
      const b = Math.round(255 * (1 - normalized));
      
      return `rgba(${r}, ${g}, ${b}, 0.7)`;
    });
  }
}
