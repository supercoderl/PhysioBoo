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
            { 
                path: 'register', 
                loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
                data: { breadcrumbs: ['register'] } 
            },
            { 
                path: 'verify-required', 
                loadComponent: () => import('./verify-required/verify-required.component').then(m => m.VerifyRequiredComponent),
                data: { breadcrumbs: ['verify-required'] } 
            }
        ],
    },
];
