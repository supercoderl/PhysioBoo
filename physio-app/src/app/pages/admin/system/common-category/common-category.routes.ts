import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: '',
        data: { breadcrumb: ['general'] },
        loadComponent: () => import('./common-category.component').then(m => m.AdminCommonCategoryComponent),
        children: [
            {
                path: '',
                redirectTo: 'medical-specialty',
                pathMatch: 'full'
            },
            {
                path: 'medical-specialty',
                data: { breadcrumb: ['medical specialty'] },
                loadComponent: () => import('./medical-specialty/list.component').then(m => m.CommonCategoryMedicalSpecialtyListComponent)
            },
        ]
    }
]