import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Intercepteur d'authentification au format fonctionnel pour Angular
 * Ajoute automatiquement le token JWT aux requêtes HTTP sortantes
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  
  // Récupérer le token JWT du localStorage
  const token = localStorage.getItem('authToken');
  
  // Si un token existe, l'ajouter à la requête
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Continuer avec la requête modifiée
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // En cas d'erreur 401 (non authentifié) ou 403 (non autorisé)
        if (error.status === 401 || error.status === 403) {
          console.error('Session expirée ou utilisateur non autorisé');
          // Supprimer le token invalide
          localStorage.removeItem('authToken');
          // Rediriger vers la page de connexion
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  // Si aucun token n'existe, continuer avec la requête d'origine
  return next(req);
};