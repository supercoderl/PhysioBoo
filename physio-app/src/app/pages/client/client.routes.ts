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
                path: 'blog', 
                loadComponent: () => import('./blog/blog.component').then(m => m.BlogComponent),
                data: { breadcrumbs: ['blog'] }  
            },
        ],
    },
];
