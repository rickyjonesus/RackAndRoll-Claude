import { Routes } from '@angular/router';

export const scheduleRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./schedule-list/schedule-list.component').then((m) => m.ScheduleListComponent),
  },
  {
    path: 'challenge',
    loadComponent: () => import('./challenge/challenge.component').then((m) => m.ChallengeComponent),
  },
];
