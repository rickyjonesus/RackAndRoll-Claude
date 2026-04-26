import { Routes } from '@angular/router';

export const matchesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./match-list/match-list.component').then((m) => m.MatchListComponent),
  },
  {
    path: 'live/:id',
    loadComponent: () => import('./live-scoring/live-scoring.component').then((m) => m.LiveScoringComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./new-match/new-match.component').then((m) => m.NewMatchComponent),
  },
];
