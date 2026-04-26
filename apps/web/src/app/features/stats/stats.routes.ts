import { Routes } from '@angular/router';

export const statsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./stats-dashboard/stats-dashboard.component').then((m) => m.StatsDashboardComponent),
  },
  {
    path: 'h2h/:opponentId',
    loadComponent: () => import('./head-to-head/head-to-head.component').then((m) => m.HeadToHeadComponent),
  },
];
