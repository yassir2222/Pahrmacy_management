// This module ensures Chart.js is properly loaded and exports all chart components
import { NgModule } from '@angular/core';
import Chart from 'chart.js/auto';
import { InventoryChartComponent } from './components/charts/inventory-chart.component';
import { SalesChartComponent } from './components/charts/sales-chart.component';
import { SalesHeatmapComponent } from './components/charts/sales-heatmap.component';
import { ExpirationTimelineComponent } from './components/charts/expiration-timeline.component';
import { InventoryForecastComponent } from './components/charts/inventory-forecast.component';

// Make Chart.js available globally
export { Chart };

// Export all chart components
export {
  InventoryChartComponent,
  SalesChartComponent,
  SalesHeatmapComponent,
  ExpirationTimelineComponent,
  InventoryForecastComponent
};

@NgModule({
  imports: [
    InventoryChartComponent,
    SalesChartComponent,
    SalesHeatmapComponent,
    ExpirationTimelineComponent,
    InventoryForecastComponent
  ],
  exports: [
    InventoryChartComponent,
    SalesChartComponent,
    SalesHeatmapComponent,
    ExpirationTimelineComponent,
    InventoryForecastComponent
  ]
})
export class ChartsModule {}