import { Routes } from '@angular/router';

import { LayoutComponent } from './pages/layout/layout.component'; 

import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: 'app',
    component: LayoutComponent, 
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',

        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) // Lazy loading
      },
      {
        path: 'produits',

        loadComponent: () => import('./pages/produit/produit.component').then(m => m.ProduitComponent) // Lazy loading
      },
      {
        path: 'stock',

        loadComponent: () => import('./pages/stock/stock.component').then(m => m.StockComponent) // Lazy loading
      },
      {
        path: 'vente',
        loadComponent: () => import('./pages/vente/vente.component').then(m => m.VenteComponent) // Lazy loading
      },
      {
        path: 'alertes',
        loadComponent: () => import('./pages/alerte/alerte.component').then(m => m.AlerteComponent) // Lazy loading
      },
      {
        path: 'rapports',
        loadComponent: () => import('./pages/rapport/rapport.component').then(m => m.RapportComponent) // Lazy loading
      },
      {
        path: 'parametres',
        loadComponent: () => import('./pages/parametre/parametre.component').then(m => m.ParametreComponent), // Lazy loading
        canActivate: [adminGuard]
      },
      {
        path: 'pharmacies-garde',
        loadComponent: () => import('./pages/pharmacie-garde/pharmacie-garde.component').then(m => m.PharmacieGardeComponent) // Lazy loading
      },
    ],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'login' },
];