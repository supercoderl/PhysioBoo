import { Routes } from '@angular/router';
import { authGuardFn } from './services/auth/auth-guard.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/guest/guest.routes').then(m => m.routes)
    },
    {
        path: 'auth',
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.routes)
    },
    {
        path: 'patient',
        loadChildren: () => import('./pages/patient/patient.routes').then(m => m.routes),
        canActivate: [authGuardFn]
    },
    {
        path: 'unsupported-role',
        loadComponent: () => import('./pages/unsupported-role/unsupported-role.component').then(m => m.UnsupportedRoleComponent)
    },
    { path: '**', redirectTo: '' }
];
