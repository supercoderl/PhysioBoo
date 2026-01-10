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
                path: 'register-employee', 
                loadComponent: () => import('./register-employee/register-employee.component').then(m => m.RegisterEmployeeComponent),
                data: { breadcrumbs: ['register-employee'] } 
            },
            { 
                path: 'verify-required', 
                loadComponent: () => import('./verify-required/verify-required.component').then(m => m.VerifyRequiredComponent),
                data: { breadcrumbs: ['verify-required'] } 
            },
            { 
                path: 'verification-status', 
                loadComponent: () => import('./verification-status/verification-status.component').then(m => m.VerificationStatusComponent),
                data: { breadcrumbs: ['verification-status'] } 
            },
            { 
                path: 'forgot', 
                loadComponent: () => import('./forgot/forgot.component').then(m => m.ForgotComponent),
                data: { breadcrumbs: ['forgot'] } 
            },
            { 
                path: 'reset-password', 
                loadComponent: () => import('./reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
                data: { breadcrumbs: ['reset-password'] } 
            }
        ],
    },
];
