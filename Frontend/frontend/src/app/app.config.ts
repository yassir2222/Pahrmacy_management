import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// Utiliser seulement un intercepteur pour l'authentification
// import { customInterceptor } from './interceptor/custom.interceptor';
import { jwtRefreshInterceptor } from './interceptor/jwt-refresh.function';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([
      // customInterceptor, // Commenté pour éviter les conflits d'intercepteurs
      jwtRefreshInterceptor  // Utiliser seulement l'intercepteur JWT refresh
    ])),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    })
  ]
};
