export interface LigneVente {
  produitId: number;
  quantite: number;
  prixUnitaire: number; // TTC généralement pour la vente
  prixTotalLigne: number;
  // Optionnel: Ajoutez d'autres champs si l'API les requiert ou les retourne
  // nomMedicament?: string; // Pour affichage facile peut-être?
}
