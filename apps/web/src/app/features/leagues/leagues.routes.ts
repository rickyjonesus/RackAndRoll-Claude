import { Routes } from '@angular/router';

export const leaguesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./league-list/league-list.component').then((m) => m.LeagueListComponent),
  },
  {
    path: ':id/standings',
    loadComponent: () => import('./standings/standings.component').then((m) => m.StandingsComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./create-league/create-league.component').then((m) => m.CreateLeagueComponent),
  },
];
