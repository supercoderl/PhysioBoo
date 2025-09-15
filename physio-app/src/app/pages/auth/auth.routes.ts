import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./auth.component').then(m => m.AuthComponent),
        children: [
            { 
                path: 'login', 
                loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
                data: { breadcrumbs: ['login'] } 
            },
        ],
    },
];
