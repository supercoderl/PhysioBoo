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
                        loadComponent: () => import('./tenants/hospital-group/list.component').then(m => m.SuperadminTenantListComponent),
                        data: { breadcrumb: ['hospital groups'] },
                        canActivate: [permissionGuard(Permissions.Admin.HospitalGroupRead)]
                    },
                    {
                        path: 'hospital-group/:id',
                        loadComponent: () => import('./tenants/hospital-group/detail.component').then(m => m.SuperadminTenantDetailComponent),
                        data: { breadcrumb: ['hospital groups', 'detail'] },
                        canActivate: [permissionGuard(Permissions.Admin.HospitalGroupRead)]
                    }
                ]
            },
            {
                path: 'billing',
                data: { breadcrumb: ['billing'] },
                loadComponent: () => import('./billing/billing.component').then(m => m.BillingComponent)
            },
            {
                path: 'master-data',
                children: [
                    {
                        path: '',
                        data: { breadcrumb: ['master data'] },
                        loadComponent: () => import('./master-data/master-data-hub.component').then(m => m.SuperadminMasterDataHubComponent)
                    },
                    {
                        // Catalog, permission and drawer are resolved from MasterDataRegistry by the :catalog slug.
                        path: ':catalog',
                        data: { breadcrumb: ['master data', 'catalog'] },
                        loadComponent: () => import('./master-data/master-data-list.component').then(m => m.SuperadminMasterDataListComponent)
                    }
                ]
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
            },
            {
                path: 'platform',
                children: [
                    {
                        path: 'sequence-rules',
                        data: { breadcrumb: ['platform', 'sequence rules'], catalog: 'sequence-rules' },
                        loadComponent: () => import('./master-data/master-data-list.component').then(m => m.SuperadminMasterDataListComponent)
                    },
                    {
                        path: 'dev-data',
                        data: { breadcrumb: ['platform', 'dev data'] },
                        loadComponent: () => import('./platform/dev-data/dev-data.component').then(m => m.SuperadminDevDataComponent)
                    },
                    {
                        path: 'icons',
                        data: { breadcrumb: ['platform', 'icons'] },
                        loadComponent: () => import('./platform/icons/icon-library.component').then(m => m.SuperadminIconLibraryComponent)
                    },
                    {
                        path: 'localization',
                        data: { breadcrumb: ['platform', 'localization'] },
                        loadComponent: () => import('./platform/localization/localization.component').then(m => m.SuperadminLocalizationComponent),
                        canActivate: [permissionGuard(Permissions.System.ResourceRead)]
                    }
                ]
            },
            {
                path: 'security',
                children: [
                    {
                        path: '',
                        redirectTo: 'audit-logs',
                        pathMatch: 'full'
                    },
                    {
                        path: 'audit-logs',
                        loadComponent: () => import('./security/audit-logs/audit-logs.component').then(m => m.SuperadminAuditLogsComponent),
                        data: { breadcrumb: ['security', 'audit logs'] },
                        canActivate: [permissionGuard(Permissions.System.AuditLogRead)]
                    },
                    {
                        path: 'ip-access',
                        loadComponent: () => import('./security/ip-access/ip-access.component').then(m => m.SuperadminIpAccessComponent),
                        data: { breadcrumb: ['security', 'ip access'] },
                        canActivate: [permissionGuard(Permissions.System.SecurityBlockIp)]
                    }
                ]
            },
            {
                path: 'menus',
                loadComponent: () => import('./menus/menu-management.component').then(m => m.SuperadminMenuManagementComponent),
                data: { breadcrumb: ['menu management'] },
                canActivate: [permissionGuard(Permissions.Admin.AdminMenuRead)]
            }
        ]
    }
];
