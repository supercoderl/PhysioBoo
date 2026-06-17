import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: '',
        data: { breadcrumb: ['general'] },
        loadComponent: () => import('./setting.component').then(m => m.AdminSystemSettingComponent),
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
                path: 'notification',
                data: { breadcrumb: ['notification'] },
                loadComponent: () => import('./notification/notification.component').then(m => m.NotificationComponent)
            },
            {
                path: 'team',
                data: { breadcrumb: ['team'] },
                loadComponent: () => import('./team/team.component').then(m => m.TeamComponent)
            },
            {
                path: 'theme',
                data: { breadcrumb: ['theme'] },
                loadComponent: () => import('./theme/theme.component').then(m => m.AdminSystemSettingThemeComponent)
            },
            {
                path: 'billing',
                data: { breadcrumb: ['plan & billing'] },
                loadComponent: () => import('./billing/billing.component').then(m => m.SettingBillingComponent)
            },
            {
                path: 'sequence-tracker',
                data: { breadcrumb: ['sequence tracker'] },
                loadComponent: () => import('./sequence-tracker/list.component').then(m => m.SettingSequenceTrackerListComponent)
            },
            {
                path: 'admin-menu',
                data: { breadcrumb: ['admin menu'] },
                loadComponent: () => import('./admin-menu/admin-menu.component').then(m => m.SettingAdminMenuComponent)
            }
        ]
    }
]