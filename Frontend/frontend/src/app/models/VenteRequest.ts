import { LigneVenteRequest } from './LigneVenteRequest';

export interface VenteRequest {
  userId?: number; 
  lignesVente: LigneVenteRequest[];
}