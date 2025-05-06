import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component'; // Keep as is, usually loaded eagerly
import { LayoutComponent } from './pages/layout/layout.component'; // Keep as is, this is the shell

// Remove direct imports for components that will be lazy-loaded:
// import { DashboardComponent } from './pages/dashboard/dashboard.component';
// import { ProduitComponent } from './pages/produit/produit.component';
// import { StockComponent } from './pages/stock/stock.component';
// import { VenteComponent } from './pages/vente/vente.component';
// import { AlerteComponent } from './pages/alerte/alerte.component';
// import { RapportComponent } from './pages/rapport/rapport.component';
// import { ParametreComponent } from './pages/parametre/parametre.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent, // Or: loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) if you want login to be lazy too
  },
  {
    path: 'app',
    component: LayoutComponent, // The shell/layout is eagerly loaded
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        // component: DashboardComponent, // Old way
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'produits',
        // component: ProduitComponent, // Old way
        loadComponent: () =>
          import('./pages/produit/produit.component').then(
            (m) => m.ProduitComponent
          ),
      },
      {
        path: 'stock',
        // component: StockComponent, // Old way
        loadComponent: () =>
          import('./pages/stock/stock.component').then(
            (m) => m.StockComponent
          ),
      },
      {
        path: 'vente',
        // component: VenteComponent, // Old way
        loadComponent: () =>
          import('./pages/vente/vente.component').then(
            (m) => m.VenteComponent
          ),
      },
      {
        path: 'alertes',
        // component: AlerteComponent, // Old way
        loadComponent: () =>
          import('./pages/alerte/alerte.component').then(
            (m) => m.AlerteComponent
          ),
      },
      {
        path: 'rapports',
        // component: RapportComponent, // Old way
        loadComponent: () =>
          import('./pages/rapport/rapport.component').then(
            (m) => m.RapportComponent
          ),
      },
      {
        path: 'parametres',
        // component: ParametreComponent, // Old way
        loadComponent: () =>
          import('./pages/parametre/parametre.component').then(
            (m) => m.ParametreComponent
          ),
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