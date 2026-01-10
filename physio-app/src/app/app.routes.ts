import { Routes } from '@angular/router';
import { authGuardFn } from './services/auth/auth-guard.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/client/client.routes').then(m => m.routes)
    },
    {
        path: 'auth',
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.routes)
    },
    {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.routes').then(m => m.routes),
        canActivate: [authGuardFn]
    },
    {
        path: 'exception',
        loadChildren: () => import('./pages/exception/exception.routes').then(m => m.routes)
    },
    { path: '**', redirectTo: 'exception' }
];
