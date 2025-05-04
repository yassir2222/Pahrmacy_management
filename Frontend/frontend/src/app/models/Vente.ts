import { LigneVente } from './LigneVente';

export interface Vente {
  id?: number; // Optionnel, l'ID sera attribué par le backend
  utilisateurId: number; // Ou userId, ajustez selon votre modèle User/Utilisateur
  dateVente: string | Date; // Date de la vente
  lignesVente: LigneVente[]; // Tableau des lignes de vente
  montantTotal: number; // Montant total calculé
  // Ajoutez d'autres champs si nécessaire (ex: client, modePaiement)
}
