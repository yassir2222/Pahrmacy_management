import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, of, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

// Variable pour suivre l'état du rafraîchissement
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

// Limiter les tentatives de rafraîchissement
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

// Liste des URL à ne pas intercepter (ne pas ajouter de token)
const EXCLUDED_URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token'
];

// Intercepteur fonctionnel pour gérer le rafraîchissement des tokens JWT
export const jwtRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  
  // Ne pas intercepter les requêtes d'authentification
  if (EXCLUDED_URLS.some(url => req.url.includes(url))) {
    console.log(`Requête exclue de l'interception JWT: ${req.url}`);
    return next(req);
  }

  console.log(`Intercepteur JWT traite la requête: ${req.url}`);
  
  // Si le token n'existe pas, continuer sans modification
  const token = authService.token;
  if (!token) {
    console.log('Aucun token trouvé, requête non modifiée');
    return next(req);
  }

  // Ajouter simplement le token à la requête sans vérifier son expiration
  // Ceci évite les boucles de rafraîchissement tout en permettant l'authentification
  req = addToken(req, token);
  console.log('Token ajouté à la requête');
  
  // Continuer avec la requête modifiée
  return next(req).pipe(
    catchError(error => {
      // Gérer uniquement les erreurs critiques
      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.log('Session expirée, redirection vers login');
        authService.logout();
      }
      
      return throwError(() => error);
    })
  );
}

// Fonction pour ajouter le token au header de la requête
function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

// Fonction pour gérer le token expiré
function handleExpiredToken(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn,
  authService: AuthService
): Observable<any> {
  isRefreshing = true;
  refreshTokenSubject.next(null);
  
  return authService.refreshToken().pipe(
    switchMap((newToken: string) => {
      isRefreshing = false;
      refreshAttempts = 0; // Réinitialiser le compteur sur succès
      refreshTokenSubject.next(newToken);
      return next(addToken(request, newToken));
    }),
    catchError((error) => {
      // Si le rafraîchissement échoue, gérer l'erreur
      console.error('Échec du rafraîchissement du token JWT:', error);
      isRefreshing = false;
      
      // En cas d'erreur critique, déconnecter l'utilisateur
      if (error.status === 401 || error.status === 403) {
        console.log('Erreur d\'authentification lors du rafraîchissement, déconnexion...');
        authService.logout();
      }
      
      return throwError(() => new Error('Échec du rafraîchissement du token'));
    }),
    finalize(() => {
      isRefreshing = false;
    })
  );
}