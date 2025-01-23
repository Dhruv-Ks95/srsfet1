import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'user',
    loadComponent: () => import('./features/user/user-home/user-home.component')
      .then(m => m.UserHomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-home/admin-home.component')
      .then(m => m.AdminHomeComponent),
    canActivate: [AuthGuard, AdminGuard]
  }
];