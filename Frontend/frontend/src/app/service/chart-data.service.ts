import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface InventoryLevelData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface SalesPerformanceData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    fill: boolean;
    tension?: number;
  }[];
}

export interface SalesTimeHeatmapData {
  days: string[];
  hours: string[];
  data: number[][];
}

export interface ExpirationTimelineData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor: string | string[];
    borderWidth: number;
  }[];
}

export interface InventoryForecastData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    fill: boolean;
    tension: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class ChartDataService {
  private apiUrlRoot = environment.apiUrl;
  private apiUrl = `${this.apiUrlRoot}/api`;

  constructor(private http: HttpClient) {}

  // Get inventory level data for the chart
  getInventoryLevelData(): Observable<InventoryLevelData> {
    // In a real application, you'd fetch this from the backend
    // For now we'll return mock data
    return this.http.get<InventoryLevelData>(`${this.apiUrl}/charts/inventory-levels`).pipe(
      catchError(() => {
        // Return mock data if API call fails
        return of({
          labels: ['Antibiotiques', 'Analgésiques', 'Anti-inflammatoires', 'Antihistaminiques', 'Antidépresseurs', 'Vitamines'],
          datasets: [
            {
              label: 'Niveaux de stock',
              data: [65, 42, 38, 91, 35, 27],
              backgroundColor: [
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 99, 132, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      })
    );
  }

  // Get sales performance data by month
  getSalesPerformanceData(): Observable<SalesPerformanceData> {
    return this.http.get<SalesPerformanceData>(`${this.apiUrl}/charts/sales-performance`).pipe(
      catchError(() => {
        // Return mock data if API call fails
        return of({
          labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet'],
          datasets: [
            {
              label: 'Ventes 2025',
              data: [12500, 19200, 15700, 16800, 23600, 18100, 22400],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Ventes 2024',
              data: [11200, 15700, 14200, 15500, 19800, 16400, 20100],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }
          ],
        });
      })
    );
  }

  // Get sales time heatmap data
  getSalesTimeHeatmapData(): Observable<SalesTimeHeatmapData> {
    return this.http.get<SalesTimeHeatmapData>(`${this.apiUrl}/charts/sales-heatmap`).pipe(
      catchError(() => {
        // Return mock data if API call fails
        return of({
          days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
          hours: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
          data: [
            [13, 25, 38, 52, 48, 24, 33, 46, 42, 28, 14, 7],
            [11, 28, 42, 53, 44, 26, 36, 48, 45, 31, 17, 9],
            [14, 31, 46, 55, 42, 25, 38, 51, 43, 29, 16, 8],
            [15, 32, 45, 58, 46, 27, 41, 52, 48, 34, 19, 10],
            [18, 35, 49, 62, 54, 32, 39, 54, 49, 36, 21, 12],
            [21, 38, 53, 65, 58, 35, 33, 47, 41, 27, 15, 8],
            [9, 21, 34, 42, 38, 21, 24, 33, 28, 19, 11, 5]
          ]
        });
      })
    );
  }

  // Get expiration timeline data
  getExpirationTimelineData(): Observable<ExpirationTimelineData> {
    return this.http.get<ExpirationTimelineData>(`${this.apiUrl}/charts/expiration-timeline`).pipe(
      catchError(() => {
        // Return mock data if API call fails
        return of({
          labels: ['1 mois', '3 mois', '6 mois', '12 mois', '18 mois', '24 mois+'],
          datasets: [
            {
              label: 'Produits expirant',
              data: [23, 45, 87, 126, 95, 62],
              backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(153, 102, 255, 0.7)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1
            }
          ]
        });
      })
    );
  }

  // Get inventory forecast data
  getInventoryForecastData(): Observable<InventoryForecastData> {
    return this.http.get<InventoryForecastData>(`${this.apiUrl}/charts/inventory-forecast`).pipe(
      catchError(() => {
        // Return mock data if API call fails
        return of({
          labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5', 'Semaine 6', 'Semaine 7', 'Semaine 8'],
          datasets: [
            {
              label: 'Niveau actuel',
              data: [438, 412, 387, 362, 335, 308, 282, 256],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Prévision',
              data: [438, 412, 387, 362, 335, 308, 282, 256, 231, 205, 180, 154],
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            },
            {
              label: 'Seuil critique',
              data: [150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: false,
              tension: 0
            }
          ]
        });
      })
    );
  }
}
