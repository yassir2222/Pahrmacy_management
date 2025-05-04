export type TypeMouvement = 'Reception' | 'Vente' | 'Perte' | 'Retour';

export interface MouvementStock {
  produitId: number;
  typeMouvement: TypeMouvement;
  quantite: number;
  motif?: string; // Motif est optionnel
  // Ajoutez d'autres champs si le backend les requiert
  // par exemple: numeroLot?: string;
}
