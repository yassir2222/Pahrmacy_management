import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const customInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  // Vérifier si on est dans un navigateur avant d'accéder à localStorage
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    
    // Seulement ajouter le header si un token existe
    if (token) {
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      // Utiliser la requête clonée et non l'originale
      return next(clonedReq);
    }
  }
  
  // Si non dans un navigateur ou pas de token, passer la requête originale
  return next(req);
};
