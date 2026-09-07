import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./patient-tabs/patient-tabs.component').then(m => m.PatientTabsComponent),
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'home' },
            { path: 'home', loadComponent: () => import('./home/patient-home.page').then(m => m.PatientHomePage) },
            { path: 'appointments', loadComponent: () => import('./appointments/appointment-list.page').then(m => m.AppointmentListPage) },
            { path: 'appointments/book', loadComponent: () => import('./appointments/book-appointment.page').then(m => m.BookAppointmentPage) },
            { path: 'appointments/:id', loadComponent: () => import('./appointments/appointment-detail.page').then(m => m.AppointmentDetailPage) },
            { path: 'records', loadComponent: () => import('./records/records.page').then(m => m.RecordsPage) },
            { path: 'profile', loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage) },
            { path: 'profile/edit', loadComponent: () => import('./profile/edit-profile.page').then(m => m.EditProfilePage) },
            { path: 'profile/billing', loadComponent: () => import('./profile/billing-history.page').then(m => m.BillingHistoryPage) },
        ]
    }
];
