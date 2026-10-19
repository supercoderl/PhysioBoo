import { Routes } from '@angular/router';

// Both sit inside the client layout so error pages keep the shared header and footer.
const clientLayout = () => import('../client/client.component').then(m => m.ClientComponent);
const exceptionPage = () => import('./exception.component').then(m => m.ExceptionComponent);

/** Mounted at `/exception`. */
export const routes: Routes = [
  {
    path: '',
    loadComponent: clientLayout,
    children: [
      { path: ':code', loadComponent: exceptionPage },
      { path: '', redirectTo: '404', pathMatch: 'full' }
    ]
  }
];

/** Mounted at `**`: renders the 404 in place, so the visitor keeps the URL they typed. */
export const notFoundRoutes: Routes = [
  {
    path: '',
    loadComponent: clientLayout,
    children: [
      { path: '', loadComponent: exceptionPage, data: { code: '404' } }
    ]
  }
];
