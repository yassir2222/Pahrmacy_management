export interface User {
  id?: number;
  username: string;
  email?: string;
  password?: string;  // Optional in responses
  nom?: string;
  prenom?: string;
  role?: string;      // ADMIN, USER, etc.
  dateCreation?: Date;
  derniereConnexion?: Date;
  actif?: boolean;
}
