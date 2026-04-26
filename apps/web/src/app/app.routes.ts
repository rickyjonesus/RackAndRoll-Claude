import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'matches',
    canActivate: [authGuard],
    loadChildren: () => import('./features/matches/matches.routes').then((m) => m.matchesRoutes),
  },
  {
    path: 'schedule',
    canActivate: [authGuard],
    loadChildren: () => import('./features/schedule/schedule.routes').then((m) => m.scheduleRoutes),
  },
  {
    path: 'stats',
    canActivate: [authGuard],
    loadChildren: () => import('./features/stats/stats.routes').then((m) => m.statsRoutes),
  },
  {
    path: 'leagues',
    canActivate: [authGuard],
    loadChildren: () => import('./features/leagues/leagues.routes').then((m) => m.leaguesRoutes),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
