import { Routes } from '@angular/router';
import { authGuardFn } from './services/auth/auth-guard.guard';
import { patientGuardFn } from './services/auth/patient-guard.guard';
import { superadminGuardFn } from './services/auth/superadmin-guard.guard';
import { userResolverFn } from './shared/resolvers/user.resolver';

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
        path: 'patient',
        loadChildren: () => import('./pages/patient/patient.routes').then(m => m.routes),
        canActivate: [patientGuardFn],
        resolve: { user: userResolverFn }
    },
    {
        path: 'admin',
        loadChildren: () => import('./pages/admin/admin.routes').then(m => m.routes),
        canActivate: [authGuardFn],
        resolve: { user: userResolverFn }
    },
    {
        path: 'superadmin',
        loadChildren: () => import('./pages/superadmin/superadmin.routes').then(m => m.routes),
        canActivate: [superadminGuardFn],
        resolve: { user: userResolverFn }
    },
    {
        path: 'exception',
        loadChildren: () => import('./pages/exception/exception.routes').then(m => m.routes)
    },
    {
        path: '**',
        loadChildren: () => import('./pages/exception/exception.routes').then(m => m.notFoundRoutes)
    }
];
