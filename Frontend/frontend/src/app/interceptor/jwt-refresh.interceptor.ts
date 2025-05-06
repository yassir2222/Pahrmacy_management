import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JwtRefreshInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Ignorer les requêtes de rafraîchissement pour éviter les boucles infinies
    if (request.url.includes('/auth/refresh-token')) {
      return next.handle(request);
    }
    
    // Vérifier si le token est expiré ou va bientôt expirer (avec une marge de 60 secondes)
    if (this.authService.isAuthenticated && this.authService.isTokenExpired(60)) {
      if (!this.isRefreshing) {
        console.log('Le token JWT va bientôt expirer, tentative de rafraîchissement');
        return this.handleExpiredToken(request, next);
      } else {
        // Si un rafraîchissement est déjà en cours, attendre qu'il soit terminé
        return this.refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token => {
            return next.handle(this.addToken(request, token!));
          })
        );
      }
    }
    
    // Si le token n'est pas expiré, ajouter simplement le token à la requête
    const token = this.authService.token;
    if (token) {
      request = this.addToken(request, token);
    }
    
    // Continuer avec la requête normale
    return next.handle(request).pipe(
      catchError(error => {
        // Si on reçoit une erreur 401 ou 403, essayer de rafraîchir le token
        if (error instanceof HttpErrorResponse && 
           (error.status === 401 || error.status === 403) && 
            this.authService.isAuthenticated) {
          return this.handleExpiredToken(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  private handleExpiredToken(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);
    
    return this.authService.refreshToken().pipe(
      switchMap((newToken: string) => {
        this.refreshTokenSubject.next(newToken);
        return next.handle(this.addToken(request, newToken));
      }),
      catchError((error) => {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur et renvoyer l'erreur
        console.error('Échec du rafraîchissement du token JWT:', error);
        this.authService.logout();
        return throwError(() => error);
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }
}