import { Produit } from "./Produit";

export interface LigneVente {
  id?: number; // L'ID sera fourni par le backend
  produit: Produit; // Le backend renvoie l'objet Produit
  quantite: number;
  prixVenteTTC: number; // Prix unitaire au moment de la vente pour cette ligne
  montantTotalLigne: number; // Calculé par le backend

}
