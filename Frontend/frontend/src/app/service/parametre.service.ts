import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
}

export interface AppPreferences {
  theme: 'light' | 'dark';
  langue: 'fr' | 'en';
  notifications: boolean;
}

export interface AlertSettings {
  stockMinimumDefaut: number;
  joursAvantExpiration: number;
}

export interface ParametresUtilisateur {
  profile: UserProfile;
  preferences: AppPreferences;
  alertSettings: AlertSettings;
}

@Injectable({
  providedIn: 'root',
})
export class ParametreService {
    private apiUrlRoot = environment.apiUrl;
    private apiUrl = `${this.apiUrlRoot}/api`;

  // Valeurs par défaut simulées - en production, ces données viendraient du backend
  private defaultParams: ParametresUtilisateur = {
    profile: {
      id: 1,
      nom: 'Martin',
      prenom: 'Sophie',
      email: 'sophie.martin@pharmacie.fr',
    },
    preferences: {
      theme: 'light',
      langue: 'fr',
      notifications: true,
    },
    alertSettings: {
      stockMinimumDefaut: 10,
      joursAvantExpiration: 30,
    },
  };

  constructor(private http: HttpClient) {}

  /**
   * Récupère les paramètres actuels de l'utilisateur
   */
  getParametresUtilisateur(): Observable<ParametresUtilisateur> {
    // En environnement réel, ce serait:
    // return this.http.get<ParametresUtilisateur>(`${this.apiUrl}/parametres`)
    //   .pipe(catchError(this.handleError));

    // Simulation - remplacer par l'appel API réel quand disponible
    return of(this.defaultParams);
  }

  /**
   * Met à jour les paramètres de l'utilisateur
   */
  updateParametres(
    data: ParametresUtilisateur
  ): Observable<ParametresUtilisateur> {
    // En environnement réel, ce serait:
    // return this.http.put<ParametresUtilisateur>(`${this.apiUrl}/parametres`, data)
    //   .pipe(catchError(this.handleError));

    // Simulation - remplacer par l'appel API réel quand disponible
    this.defaultParams = { ...data };
    return of(this.defaultParams);
  }

  /**
   * Met à jour le profil utilisateur
   */
  updateProfile(profile: UserProfile): Observable<UserProfile> {
    // En environnement réel:
    // return this.http.put<UserProfile>(`${this.apiUrl}/users/${profile.id}`, profile)
    //   .pipe(catchError(this.handleError));

    // Simulation
    this.defaultParams.profile = { ...profile };
    return of(this.defaultParams.profile);
  }

  /**
   * Met à jour les préférences de l'application
   */
  updatePreferences(preferences: AppPreferences): Observable<AppPreferences> {
    // En environnement réel:
    // return this.http.put<AppPreferences>(`${this.apiUrl}/parametres/preferences`, preferences)
    //   .pipe(catchError(this.handleError));

    // Simulation
    this.defaultParams.preferences = { ...preferences };
    return of(this.defaultParams.preferences);
  }

  /**
   * Met à jour les paramètres d'alerte
   */
  updateAlertSettings(settings: AlertSettings): Observable<AlertSettings> {
    // En environnement réel:
    // return this.http.put<AlertSettings>(`${this.apiUrl}/parametres/alertes`, settings)
    //   .pipe(catchError(this.handleError));

    // Simulation
    this.defaultParams.alertSettings = { ...settings };
    return of(this.defaultParams.alertSettings);
  }

  /**
   * Gestion des erreurs HTTP
   */
  private handleError(error: any) {
    console.error('Une erreur est survenue', error);
    return throwError(
      () =>
        new Error(
          'Erreur lors de la communication avec le serveur. Veuillez réessayer plus tard.'
        )
    );
  }
}
