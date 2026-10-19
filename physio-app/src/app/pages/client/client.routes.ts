import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./client.component').then(m => m.ClientComponent),
        children: [
            { 
                path: '', 
                loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
                data: { breadcrumbs: ['home'] } 
            },
            { 
                path: 'contact', 
                loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent),
                data: { breadcrumbs: ['contact'] }  
            },
            { 
                path: 'doctor', 
                loadComponent: () => import('./doctor/doctor.component').then(m => m.DoctorComponent),
                data: { breadcrumbs: ['doctor'] }  
            },
            {
                path: 'doctor/:id',
                loadComponent: () => import('./doctor/detail/doctor-detail.component').then(m => m.DoctorDetailComponent),
                data: { breadcrumbs: ['doctor'] }
            },
            { 
                path: 'about-us', 
                loadComponent: () => import('./about-us/about-us.component').then(m => m.AboutUsComponent),
                data: { breadcrumbs: ['about-us'] }  
            },
            { 
                path: 'term', 
                loadComponent: () => import('./term/term.component').then(m => m.TermComponent),
                data: { breadcrumbs: ['term'] }  
            },
            { 
                path: 'privacy', 
                loadComponent: () => import('./privacy/privacy.component').then(m => m.PrivacyComponent),
                data: { breadcrumbs: ['privacy'] }  
            },
            { 
                path: 'hospitals', 
                loadComponent: () => import('./hospital/hospital.component').then(m => m.HospitalComponent),
                data: { breadcrumbs: ['hospitals'] }  
            },
            {
                path: 'hospitals/:id',
                loadComponent: () => import('./hospital/detail/hospital-detail.component').then(m => m.HospitalDetailComponent),
                data: { breadcrumbs: ['hospitals'] }
            },
            {
                path: 'services',
                loadComponent: () => import('./service/service.component').then(m => m.ServiceComponent),
                data: { breadcrumbs: ['services'] }
            },
            {
                path: 'services/:id',
                loadComponent: () => import('./service/detail/service-detail.component').then(m => m.ServiceDetailComponent),
                data: { breadcrumbs: ['services'] }
            },
            { 
                path: 'blog', 
                loadComponent: () => import('./blog/blog.component').then(m => m.BlogComponent),
                data: { breadcrumbs: ['blog'] }  
            },
            {
                path: 'search',
                loadComponent: () => import('./search/search.component').then(m => m.SearchComponent),
                data: { breadcrumbs: ['search'] }
            },
            {
                path: 'blog/:id',
                loadComponent: () => import('./blog/detail/article-detail.component').then(m => m.ArticleDetailComponent),
                data: { breadcrumbs: ['blog'] }
            },
        ],
    },
];
