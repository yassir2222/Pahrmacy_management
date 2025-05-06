import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupérer le token JWT du localStorage
    const token = localStorage.getItem('authToken');
    
    // Si un token existe, l'ajouter à toutes les requêtes
    if (token) {
      const authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Continuer avec la requête modifiée
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // En cas d'erreur 401 (non authentifié) ou 403 (non autorisé)
          if (error.status === 401 || error.status === 403) {
            console.error('Session expirée ou utilisateur non autorisé');
            // Supprimer le token invalide
            localStorage.removeItem('authToken');
            // Rediriger vers la page de connexion
            this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    }
    
    // Si aucun token n'existe, continuer avec la requête d'origine
    return next.handle(request);
  }
}