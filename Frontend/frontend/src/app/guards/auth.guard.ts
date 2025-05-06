import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  console.log(`========== SÉCURITÉ DÉSACTIVÉE: Accès autorisé à: ${state.url} ==========`);
  
  // SÉCURITÉ DÉSACTIVÉE: Autoriser l'accès à toutes les routes
  return true;
};

export const adminGuard: CanActivateFn = (route, state) => {
  console.log(`========== SÉCURITÉ DÉSACTIVÉE: Accès administrateur autorisé à: ${state.url} ==========`);
  
  // SÉCURITÉ DÉSACTIVÉE: Autoriser l'accès à toutes les routes administrateur
  return true;
};