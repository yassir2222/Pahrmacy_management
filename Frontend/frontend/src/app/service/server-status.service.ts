import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {
  private baseApiUrl = 'http://localhost:8083/api';
  private checkInterval = 30000; // 30 secondes
  private serverStatusSubject = new BehaviorSubject<boolean>(true);
  public serverStatus$ = this.serverStatusSubject.asObservable();

  constructor(private http: HttpClient) {
    // Lancer la vérification périodique de l'état du serveur
    this.startPeriodicCheck();
  }

  /**
   * Démarre la vérification périodique de la disponibilité du serveur
   */
  startPeriodicCheck() {
    timer(0, this.checkInterval).pipe(
      switchMap(() => this.checkServerStatus())
    ).subscribe(isOnline => {
      // Mettre à jour le statut du serveur seulement s'il a changé
      if (this.serverStatusSubject.value !== isOnline) {
        console.log(`Serveur backend est ${isOnline ? 'en ligne' : 'hors ligne'}`);
        this.serverStatusSubject.next(isOnline);
      }
    });
  }

  /**
   * Vérifie si le serveur backend est disponible
   * @returns Observable<boolean> - true si le serveur est disponible, false sinon
   */
  checkServerStatus(): Observable<boolean> {
    // Utiliser un endpoint qui devrait toujours être disponible et léger à appeler
    // On pourrait utiliser un endpoint spécifique comme /api/health si disponible
    return this.http.get(`${this.baseApiUrl}/produits/all`, { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(error => {
          console.error('Erreur de connexion au serveur backend:', error);
          return of(false);
        })
      );
  }
  
  /**
   * Teste immédiatement la connexion au serveur
   * @returns Observable<boolean>
   */
  testConnection(): Observable<boolean> {
    return this.checkServerStatus();
  }
}