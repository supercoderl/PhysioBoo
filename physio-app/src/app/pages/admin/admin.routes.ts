import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
        data: { breadcrumb: ['admin'] },
        children: [
            {
                path: 'doctor',
                data: { breadcrumb: ['doctor'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'list',
                        pathMatch: 'full'
                    },
                    {
                        path: 'list',
                        loadComponent: () => import('./doctor/list/doctor-list.component').then(m => m.DoctorListComponent),
                        data: { breadcrumb: ['list'] },
                    }
                ]
            },
            {
                path: 'academy',
                data: { breadcrumb: ['academy'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'list',
                        pathMatch: 'full'
                    },
                    {
                        path: 'list',
                        loadComponent: () => import('./academy/list/academy-list.component').then(m => m.AcademyListComponent),
                        data: { breadcrumb: ['list'] },
                    }
                ]
            },
            {
                path: 'system',
                data: { breadcrumb: ['system'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'file-manager',
                        pathMatch: 'full'
                    },
                    {
                        path: 'file-manager',
                        loadComponent: () => import('./system/file-manager/file-manager.component').then(m => m.FileManagerComponent),
                        data: { breadcrumb: ['file manager'] },
                    },
                    {
                        path: 'note',
                        data: { breadcrumb: ['note'] },
                        children: [
                            {
                                path: '',
                                redirectTo: 'all',
                                pathMatch: 'full'
                            },
                            {
                                path: 'all',
                                data: { breadcrumb: ['all'] },
                                loadComponent: () => import('./system/note/all/all.component').then(m => m.AllNoteComponent),
                            }
                        ]
                    },
                    {
                        path: 'scrumboard',
                        data: { breadcrumb: ['scrumboard'] },
                        children: [
                            {
                                path: '',
                                redirectTo: 'list',
                                pathMatch: 'full'
                            },
                            {
                                path: 'list',
                                data: { breadcrumb: ['list'] },
                                loadComponent: () => import('./system/scrumboard/list/list.component').then(m => m.ListScrumboardComponent),
                            }
                        ]
                    }
                ]
            },
            {
                path: 'profile',
                data: { breadcrumb: ['profile'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'general',
                        pathMatch: 'full'
                    },
                    {
                        path: 'general',
                        loadComponent: () => import('./user/profile/profile.component').then(m => m.ProfileComponent),
                        data: { breadcrumb: ['general'] },
                    }
                ]
            },
            {
                path: 'setting',
                data: { breadcrumb: ['setting'] },
                loadChildren: () => import('./setting/setting.routes').then(r => r.routes)
            }
        ],
    },
];
