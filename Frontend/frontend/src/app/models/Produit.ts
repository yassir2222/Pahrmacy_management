import { FormeEnum } from "./enums/FormeEnum";


export interface Produit {
  id?: number; // Use number for backend Long ID, make optional for creation
  nomMedicament?: string;
  lotDeStocks?: any[]; // Keep simple for now, or define a LotDeStock interface if needed
  codeEAN?: string | null; // Allow null
  prixVenteTTC?: number | null; // BigDecimal maps to number
  prixAchatHT?: number | null;  // BigDecimal maps to number
  seuilStock?: number;
  forme?: FormeEnum; // Use the enum
  dosage?: string | null; // Allow null
  quantiteTotaleEnStock?: number;

}