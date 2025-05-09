import { PharmacieGarde } from './PharmacieGarde';

// Extended interface for the map component to include location and display properties
export interface PharmacieGardeWithLocation {
  // Original PharmacieGarde properties
  id?: number;
  nomPharmacie?: string;
  ville?: string;
  adresse?: string;
  telephone?: string;
  periode?: 'MATIN' | 'NUIT' | 'JOURNÉE';
  dateDebut?: Date | string;
  dateFin?: Date | string;
  isActive?: boolean;
  
  // Added properties for map display
  latitude?: number;
  longitude?: number;
  distance?: number;
  isOnDuty?: boolean;
}
