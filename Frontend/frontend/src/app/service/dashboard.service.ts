import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  totalProducts: number;
  todaySales: number;
  activeAlerts: number;
  expiringThisWeek: number;
  salesTrend: number; // pourcentage de changement
  alertsTrend: number;
  stockTrend: number;
  expirationsTrend: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private apiUrlRoot = environment.apiUrl;
    private baseApiUrl = `${this.apiUrlRoot}`;

    constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les statistiques du tableau de bord
   */
  getDashboardStats(): Observable<DashboardStats> {
    // On utilise forkJoin pour combiner plusieurs appels API en un seul résultat
    return forkJoin({
      products: this.getTotalProducts(),
      sales: this.getTodaySales(),
      alerts: this.getActiveAlerts(),
      expirations: this.getExpiringProducts()
    }).pipe(
      map(results => ({
        totalProducts: results.products.total,
        todaySales: results.sales.count,
        activeAlerts: results.alerts.count,
        expiringThisWeek: results.expirations.count,
        salesTrend: results.sales.trend,
        alertsTrend: results.alerts.trend,
        stockTrend: results.products.trend,
        expirationsTrend: results.expirations.trend
      })),
      tap(stats => console.log('Statistiques du dashboard récupérées:', stats)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère le nombre total de produits et la tendance
   */
  private getTotalProducts(): Observable<{total: number, trend: number}> {
    return this.http.get<{total: number, trend: number}>(`${this.baseApiUrl}/stats/products`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération du nombre de produits:', error);
          // Valeurs par défaut en cas d'erreur
          return of({total: 0, trend: 0});
        })
      );
  }

  /**
   * Récupère le nombre de ventes du jour et la tendance
   */
  private getTodaySales(): Observable<{count: number, trend: number}> {
    return this.http.get<{count: number, trend: number}>(`${this.baseApiUrl}/stats/today-sales`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des ventes du jour:', error);
          return of({count: 0, trend: 0});
        })
      );
  }

  /**
   * Récupère le nombre d'alertes actives et la tendance
   */
  private getActiveAlerts(): Observable<{count: number, trend: number}> {
    return this.http.get<{count: number, trend: number}>(`${this.baseApiUrl}/stats/active-alerts`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des alertes:', error);
          return of({count: 0, trend: 0});
        })
      );
  }

  /**
   * Récupère le nombre de produits qui expirent cette semaine et la tendance
   */
  private getExpiringProducts(): Observable<{count: number, trend: number}> {
    return this.http.get<{count: number, trend: number}>(`${this.baseApiUrl}/stats/expiring-products`)
      .pipe(
        catchError(error => {
          console.error('Erreur lors de la récupération des produits expirants:', error);
          return of({count: 0, trend: 0});
        })
      );
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}, Message: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}