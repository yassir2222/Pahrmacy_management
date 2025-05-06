import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../models/User';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  nom?: string;
  prenom?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8083/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize from localStorage if available
    const storedUser = localStorage.getItem(this.userKey);
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Get the current authenticated user
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get the JWT token
   */
  public get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Check if user is authenticated
   */
  public get isAuthenticated(): boolean {
    const hasToken = !!this.token;
    const hasUser = !!this.currentUserValue;
    const tokenExpired = this.isTokenExpiredSafe();
    
    console.log('Vérification d\'authentification:');
    console.log('- Token présent:', hasToken);
    console.log('- User présent:', hasUser);
    console.log('- Token expiré:', tokenExpired);
    
    // L'utilisateur est authentifié s'il a un token valide et des informations utilisateur
    const isAuth = hasToken && hasUser && !tokenExpired;
    console.log('→ Authentifié:', isAuth);
    
    return isAuth;
  }
  
  /**
   * Safely check if token is expired without throwing errors
   * Separate from isTokenExpired to avoid logging during every auth check
   */
  private isTokenExpiredSafe(): boolean {
    try {
      return this.isTokenExpired();
    } catch (error) {
      console.error('Erreur lors de la vérification d\'expiration du token:', error);
      return true; // En cas d'erreur, on considère le token comme expiré par sécurité
    }
  }

  /**
   * Navigate to dashboard after successful authentication
   * @param returnUrl Optional URL to navigate to instead of dashboard
   */
  navigateToDashboard(returnUrl?: string): void {
    this.router.navigate([returnUrl || '/app/dashboard']);
  }

  /**
   * Log in a user
   */
  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => this.setSession(response)),
        map(response => response.user),
        catchError(this.handleError)
      );
  }

  /**
   * Register a new user
   */
  register(registerRequest: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        tap(response => this.setSession(response)),
        map(response => response.user),
        catchError(this.handleError)
      );
  }

  /**
   * Log out the current user
   */
  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  /**
   * Store authentication data in localStorage
   */
  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResult.token);
    localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    return user.role === role;
  }

  /**
   * Refresh the current user's information
   */
  refreshUserInfo(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => {
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Refresh the JWT token
   */
  refreshToken(): Observable<string> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/refresh-token`, {})
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            console.log('Token refreshed successfully');
          }
        }),
        map(response => response.token),
        catchError(error => {
          console.error('Failed to refresh token:', error);
          // Si le refresh échoue, déconnecter l'utilisateur
          if (error.status === 401 || error.status === 403) {
            this.logout();
          }
          return throwError(() => new Error('Failed to refresh token'));
        })
      );
  }

  /**
   * Decode JWT token to get expiration time
   */
  getTokenExpirationDate(): Date | null {
    const token = this.token;
    if (!token) return null;
    
    try {
      // Décoder le token JWT (le token est divisé en 3 parties séparées par des points)
      const payload = token.split('.')[1];
      // Décoder la partie payload qui est en base64
      const decoded = JSON.parse(atob(payload));
      
      // La propriété exp contient le timestamp d'expiration
      if (decoded && decoded.exp) {
        // Convertir le timestamp en date
        return new Date(decoded.exp * 1000);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    
    return null;
  }

  /**
   * Check if token is expired or will expire soon
   */
  isTokenExpired(buffer = 60): boolean {
    const expirationDate = this.getTokenExpirationDate();
    if (!expirationDate) return true;
    
    // Ajouter un buffer (en secondes) pour rafraîchir le token avant qu'il n'expire
    const bufferTime = buffer * 1000;
    return expirationDate.getTime() - bufferTime < Date.now();
  }

  /**
   * Error handling
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue lors de l\'authentification';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
      
      // Add more specific error messages based on status codes
      if (error.status === 401) {
        errorMessage = 'Identifiants incorrects. Veuillez réessayer.';
      } else if (error.status === 403) {
        errorMessage = 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
      } else if (error.status === 409) {
        errorMessage = 'Cet utilisateur existe déjà.';
      } else if (error.status === 0) {
        errorMessage = 'Impossible de joindre le serveur. Veuillez vérifier votre connexion.';
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}