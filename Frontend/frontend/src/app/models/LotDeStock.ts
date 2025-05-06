import { Produit } from './Produit';

export interface LotDeStock {
  id: number;
  numeroLot: string;
  dateExpiration: string | Date; // Utiliser string si l'API renvoie une chaîne, Date sinon
  quantite: number;  // Renommé de quantiteActuelle à quantite pour correspondre au backend
  prixAchatHT?: number;
  produit?: Produit;
  dateReception?: string | Date;
}
