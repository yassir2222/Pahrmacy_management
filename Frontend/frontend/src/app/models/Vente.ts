import { LigneVente } from './LigneVente';
import { User } from './User';

export interface Vente {
  id: number; // L'ID sera fourni par le backend
  dateVente: string; // ou Date, le backend renvoie LocalDateTime
  montantTotal: number;
  utilisateur?: User; // Le backend renvoie l'objet User
  lignesVente: LigneVente[];
}
