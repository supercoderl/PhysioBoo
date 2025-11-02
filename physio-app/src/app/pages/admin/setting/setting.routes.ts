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
            }
        ]
    }
]