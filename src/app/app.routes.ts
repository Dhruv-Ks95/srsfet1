import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'user',
    loadComponent: () => import('./features/user/user-home/user-home.component')
      .then(m => m.UserHomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-home/admin-home.component')
      .then(m => m.AdminHomeComponent),
    canActivate: [authGuard, AdminGuard]
  },
  {
    path: 'add-booking',
    loadComponent: () => import('./features/user/add-booking/add-booking.component')
      .then(m => m.AddBookingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'cancel-booking',
    loadComponent: () => import('./features/user/cancel-booking/cancel-booking.component')
      .then(m => m.CancelBookingComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
