import { Routes } from "@angular/router";
import { permissionGuard } from "src/app/services/auth/permission-guard.guard";
import { Permissions } from "src/app/shared/constants/permission.constant";

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
                data: { breadcrumb: ['medical specialty'], permission: Permissions.Admin.MedicalSpecialtyRead },
                loadComponent: () => import('./medical-specialty/list.component').then(m => m.CommonCategoryMedicalSpecialtyListComponent),
                canActivate: [permissionGuard(Permissions.Admin.MedicalSpecialtyRead)]
            },
            {
                path: 'appointment-type',
                data: { breadcrumb: ['appointment type'], permission: Permissions.Scheduling.AppointmentTypeRead },
                loadComponent: () => import('./appointment-type/list.component').then(m => m.CommonCategoryAppointmentTypeListComponent),
                canActivate: [permissionGuard(Permissions.Scheduling.AppointmentTypeRead)]
            },
            {
                path: 'imaging-modality',
                data: { breadcrumb: ['imaging modality'], permission: Permissions.Imaging.ImagingModalityRead },
                loadComponent: () => import('./imaging-modality/list.component').then(m => m.CommonCategoryImagingModalityListComponent),
                canActivate: [permissionGuard(Permissions.Imaging.ImagingModalityRead)]
            },
            {
                path: 'insurance-company',
                data: { breadcrumb: ['insurance company'], permission: Permissions.Admin.InsuranceCompanyRead },
                loadComponent: () => import('./insurance-company/list.component').then(m => m.CommonCategoryInsuranceCompanyListComponent),
                canActivate: [permissionGuard(Permissions.Admin.InsuranceCompanyRead)]
            },
            {
                path: 'manufacturer',
                data: { breadcrumb: ['manufacturer'], permission: Permissions.Pharmacy.ManufacturerRead },
                loadComponent: () => import('./manufacturer/list.component').then(m => m.CommonCategoryManufacturerListComponent),
                canActivate: [permissionGuard(Permissions.Pharmacy.ManufacturerRead)]
            },
            {
                path: 'medicine-category',
                data: { breadcrumb: ['medicine category'], permission: Permissions.Pharmacy.MedicineCategoryRead },
                loadComponent: () => import('./medicine-category/list.component').then(m => m.CommonCategoryMedicineCategoryListComponent),
                canActivate: [permissionGuard(Permissions.Pharmacy.MedicineCategoryRead)]
            },
            {
                path: 'supplier',
                data: { breadcrumb: ['supplier'], permission: Permissions.Pharmacy.SupplierRead },
                loadComponent: () => import('./supplier/list.component').then(m => m.CommonCategorySupplierListComponent),
                canActivate: [permissionGuard(Permissions.Pharmacy.SupplierRead)]
            },
            {
                path: 'lab-test',
                data: { breadcrumb: ['lab test'], permission: Permissions.Lab.LabTestRead },
                loadComponent: () => import('./lab-test/list.component').then(m => m.CommonCategoryLabTestListComponent),
                canActivate: [permissionGuard(Permissions.Lab.LabTestRead)]
            },
            {
                path: 'lab-test-category',
                data: { breadcrumb: ['lab test category'], permission: Permissions.Lab.LabTestCategoryRead },
                loadComponent: () => import('./lab-test-category/list.component').then(m => m.CommonCategoryLabTestCategoryListComponent),
                canActivate: [permissionGuard(Permissions.Lab.LabTestCategoryRead)]
            },
            {
                path: 'department',
                data: { breadcrumb: ['department'], permission: Permissions.Admin.DepartmentRead },
                loadComponent: () => import('./department/list.component').then(m => m.CommonCategoryDepartmentListComponent),
                canActivate: [permissionGuard(Permissions.Admin.DepartmentRead)]
            },
        ]
    }
]
