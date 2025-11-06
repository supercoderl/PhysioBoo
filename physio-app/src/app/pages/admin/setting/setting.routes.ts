import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: '',
        data: { breadcrumb: ['general'] },
        loadComponent: () => import('./setting.component').then(m => m.SettingGeneralComponent),
        children: [
            {
                path: '',
                redirectTo: 'account',
                pathMatch: 'full'
            },
            {
                path: 'account',
                data: { breadcrumb: ['account'] },
                loadComponent: () => import('./account/account.component').then(m => m.SettingAccountComponent)
            },
            {
                path: 'security',
                data: { breadcrumb: ['security'] },
                loadComponent: () => import('./security/security.component').then(m => m.SecurityComponent)
            },
            {
                path: 'billing',
                data: { breadcrumb: ['billing'] },
                loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent)
            },
            {
                path: 'notification',
                data: { breadcrumb: ['notification'] },
                loadComponent: () => import('./notification/notification.component').then(m => m.NotificationComponent)
            },
            {
                path: 'team',
                data: { breadcrumb: ['team'] },
                loadComponent: () => import('./team/team.component').then(m => m.TeamComponent)
            }
        ]
    }
]