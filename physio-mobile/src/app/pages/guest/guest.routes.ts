import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./guest-tabs/guest-tabs.component').then(m => m.GuestTabsComponent),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'home' },
            { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
            { path: 'doctors', loadComponent: () => import('./doctors/doctor-list.page').then(m => m.DoctorListPage) },
            { path: 'doctors/:id', loadComponent: () => import('./doctors/doctor-detail.page').then(m => m.DoctorDetailPage) },
            { path: 'hospitals', loadComponent: () => import('./hospitals/facility-list.page').then(m => m.FacilityListPage) },
            { path: 'hospitals/:id', loadComponent: () => import('./hospitals/facility-detail.page').then(m => m.FacilityDetailPage) },
            { path: 'news', loadComponent: () => import('./news/news-list.page').then(m => m.NewsListPage) },
            { path: 'news/:id', loadComponent: () => import('./news/news-detail.page').then(m => m.NewsDetailPage) },
            { path: 'more', loadComponent: () => import('./more/more.page').then(m => m.MorePage) },
            { path: 'more/about', loadComponent: () => import('./more/about.page').then(m => m.AboutPage) },
            { path: 'more/contact', loadComponent: () => import('./more/contact.page').then(m => m.ContactPage) },
            { path: 'more/terms', loadComponent: () => import('./more/terms.page').then(m => m.TermsPage) },
            { path: 'more/privacy', loadComponent: () => import('./more/privacy.page').then(m => m.PrivacyPage) },
        ]
    }
];
