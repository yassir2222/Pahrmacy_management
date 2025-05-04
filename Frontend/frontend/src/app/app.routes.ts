import { Routes } from '@angular/router';
import path from 'path';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProduitComponent } from './pages/produit/produit.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'produit',
        component:ProduitComponent
    },
    {
        path: '',
        component:DashboardComponent,
        children: [
            {
                path:'dashboard',
                component:DashboardComponent
            }
        ]
    }
];
