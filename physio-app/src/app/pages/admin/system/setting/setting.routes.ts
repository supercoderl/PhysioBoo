import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: '',
        data: { breadcrumb: ['setting'] },
        loadComponent: () => import('./setting.component').then(m => m.AdminSystemSettingComponent),
        children: [
            {
                path: '',
                redirectTo: 'general',
                pathMatch: 'full'
            },
            {
                path: 'general',
                data: { breadcrumb: 'general' },
                loadComponent: () => import('./general/general-setting.component').then(m => m.AdminSystemGeneralSettingComponent)
            }
        ]
    }
]