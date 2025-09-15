import { Routes } from '@angular/router';

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
        path: 'exception', 
        loadChildren: () => import('./pages/exception/exception.routes').then(m => m.routes) 
    },
    { path: '**', redirectTo: 'exception' }
];
