import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PharmacieGarde, villesMaroc } from '../models/PharmacieGarde';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PharmacieGardeService {
    private apiUrlRoot = environment.apiUrl;
    private apiUrl = `${this.apiUrlRoot}/pharmacies-garde`;

  // Données de démonstration en attendant l'intégration avec l'API backend
  private mockData: PharmacieGarde[] = [
    {
      id: 1,
      nomPharmacie: 'Pharmacie Al Amal',
      ville: 'Casablanca',
      adresse: '123 Avenue Hassan II, Casablanca',
      telephone: '0522123456',
      periode: 'NUIT',
      dateDebut: new Date('2025-05-06'),
      dateFin: new Date('2025-05-07'),
      isActive: true
    },
    {
      id: 2,
      nomPharmacie: 'Pharmacie Centrale',
      ville: 'Rabat',
      adresse: '45 Avenue Mohammed V, Rabat',
      telephone: '0537123456',
      periode: 'MATIN',
      dateDebut: new Date('2025-05-06'),
      dateFin: new Date('2025-05-07'),
      isActive: true
    },
    {
      id: 3,
      nomPharmacie: 'Pharmacie El Bahja',
      ville: 'Marrakech',
      adresse: '78 Rue Moulay Ismail, Marrakech',
      telephone: '0524123456',
      periode: 'JOURNÉE',
      dateDebut: new Date('2025-05-06'),
      dateFin: new Date('2025-05-07'),
      isActive: true
    },
    {
      id: 4,
      nomPharmacie: 'Pharmacie Assafa',
      ville: 'Tanger',
      adresse: '12 Boulevard Mohammed VI, Tanger',
      telephone: '0539123456',
      periode: 'NUIT',
      dateDebut: new Date('2025-05-06'),
      dateFin: new Date('2025-05-07'),
      isActive: true
    },
    {
      id: 5,
      nomPharmacie: 'Pharmacie Ibn Sina',
      ville: 'Fès',
      adresse: '34 Avenue Hassan II, Fès',
      telephone: '0535123456',
      periode: 'MATIN',
      dateDebut: new Date('2025-05-06'),
      dateFin: new Date('2025-05-07'),
      isActive: true
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les pharmacies de garde
   */
  getAllPharmaciesGarde(): Observable<PharmacieGarde[]> {
    // Utiliser l'API lorsqu'elle sera disponible
    // return this.http.get<PharmacieGarde[]>(`${this.apiUrl}/all`);
    
    // En attendant, utiliser les données mockées
    return of(this.mockData);
  }

  /**
   * Récupère les pharmacies de garde par ville
   */
  getPharmaciesGardeByVille(ville: string): Observable<PharmacieGarde[]> {
    // Utiliser l'API lorsqu'elle sera disponible
    // return this.http.get<PharmacieGarde[]>(`${this.apiUrl}/ville/${ville}`);
    
    // En attendant, filtrer les données mockées
    return of(this.mockData.filter(p => p.ville?.toLowerCase() === ville.toLowerCase()));
  }

  /**
   * Récupère les pharmacies de garde par période (MATIN, NUIT, JOURNÉE)
   */
  getPharmaciesGardeByPeriode(periode: string): Observable<PharmacieGarde[]> {
    // Utiliser l'API lorsqu'elle sera disponible
    // return this.http.get<PharmacieGarde[]>(`${this.apiUrl}/periode/${periode}`);
    
    // En attendant, filtrer les données mockées
    return of(this.mockData.filter(p => p.periode?.toLowerCase() === periode.toLowerCase()));
  }

  /**
   * Récupère les pharmacies de garde actives à la date actuelle
   */
  getActivePharmaciesGarde(): Observable<PharmacieGarde[]> {
    // Utiliser l'API lorsqu'elle sera disponible
    // return this.http.get<PharmacieGarde[]>(`${this.apiUrl}/actives`);
    
    // En attendant, filtrer les données mockées (toutes sont actives pour la démo)
    return of(this.mockData.filter(p => p.isActive));
  }

  /**
   * Récupère les villes disponibles (pour les filtres)
   */
  getVilles(): Observable<string[]> {
    return of(villesMaroc.map(v => v.nom));
  }

  /**
   * Récupère les périodes disponibles (pour les filtres)
   */
  getPeriodes(): Observable<string[]> {
    return of(['MATIN', 'NUIT', 'JOURNÉE']);
  }
}