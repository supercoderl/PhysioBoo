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
            {
                path: 'appointment-type',
                data: { breadcrumb: ['appointment type'] },
                loadComponent: () => import('./appointment-type/list.component').then(m => m.CommonCategoryAppointmentTypeListComponent)
            },
            {
                path: 'imaging-modality',
                data: { breadcrumb: ['imaging modality'] },
                loadComponent: () => import('./imaging-modality/list.component').then(m => m.CommonCategoryImagingModalityListComponent)
            },
            {
                path: 'insurance-company',
                data: { breadcrumb: ['insurance company'] },
                loadComponent: () => import('./insurance-company/list.component').then(m => m.CommonCategoryInsuranceCompanyListComponent)
            },
            {
                path: 'manufacturer',
                data: { breadcrumb: ['manufacturer'] },
                loadComponent: () => import('./manufacturer/list.component').then(m => m.CommonCategoryManufacturerListComponent)
            },
            {
                path: 'medicine-category',
                data: { breadcrumb: ['medicine category'] },
                loadComponent: () => import('./medicine-category/list.component').then(m => m.CommonCategoryMedicineCategoryListComponent)
            },
            {
                path: 'supplier',
                data: { breadcrumb: ['supplier'] },
                loadComponent: () => import('./supplier/list.component').then(m => m.CommonCategorySupplierListComponent)
            },
        ]
    }
]