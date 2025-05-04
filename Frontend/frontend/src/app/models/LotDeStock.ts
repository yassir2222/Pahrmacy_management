import { Produit } from './Produit';

export interface LotDeStock {
  id: number;
  numeroLot: string;
  dateExpiration: string | Date; // Utiliser string si l'API renvoie une chaîne, Date sinon
  quantiteActuelle: number;
  prixAchatHT?: number; // Ajouté car mentionné pour le détail
  produit?: Produit; // Peut être utile si l'API renvoie l'objet produit imbriqué
  // Ajoutez d'autres champs si nécessaire selon votre API
}
