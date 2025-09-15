import { Routes } from '@angular/router';
import { ExceptionComponent } from './exception.component';

export const routes: Routes = [
  { path: ':code', component: ExceptionComponent },
  { path: '', redirectTo: '404', pathMatch: 'full' }
];
