import { Routes } from '@angular/router';
import { permissionGuard } from 'src/app/services/auth/permission-guard.guard';
import { Permissions } from 'src/app/shared/constants/permission.constant';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./superadmin.component').then(m => m.SuperadminComponent),
        children: [
            {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
            },
            {
                path: 'overview',
                children: [
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    },
                    {
                        path: 'dashboard',
                        loadComponent: () => import('./overview/dashboard/dashboard.component').then(m => m.SuperadminDashboardComponent),
                        data: { breadcrumb: ['dashboard'] }
                    }
                ]
            },
            {
                path: 'tenants',
                children: [
                    {
                        path: '',
                        redirectTo: 'hospital-group',
                        pathMatch: 'full'
                    },
                    {
                        path: 'hospital-group',
                        loadComponent: () => import('../admin/system/common-category/hospital-group/list.component').then(m => m.CommonCategoryHospitalGroupListComponent),
                        data: { breadcrumb: ['hospital groups'] },
                        canActivate: [permissionGuard(Permissions.Admin.HospitalGroupRead)]
                    },
                    {
                        path: 'hospital',
                        loadComponent: () => import('../admin/system/common-category/hospital/list.component').then(m => m.CommonCategoryHospitalListComponent),
                        data: { breadcrumb: ['hospitals'] },
                        canActivate: [permissionGuard(Permissions.Admin.HospitalRead)]
                    }
                ]
            },
            {
                path: 'billing',
                data: { breadcrumb: ['billing'] },
                loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./users/list.component').then(m => m.SuperadminUserListComponent),
                data: { breadcrumb: ['users'] },
                canActivate: [permissionGuard(Permissions.Iam.UserRead)]
            },
            {
                path: 'roles',
                loadComponent: () => import('./roles/list.component').then(m => m.SuperadminRoleListComponent),
                data: { breadcrumb: ['roles'] },
                canActivate: [permissionGuard(Permissions.Iam.RoleRead)]
            }
        ]
    }
];
