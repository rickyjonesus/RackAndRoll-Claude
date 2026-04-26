import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-league-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Leagues</h2>
    <a routerLink="/leagues/new">+ Create League</a>
    @for (league of leagues(); track league.id) {
      <div class="league-card">
        <a [routerLink]="['/leagues', league.id, 'standings']">{{ league.name }}</a>
        <span>{{ league.gameType }}</span>
        <span class="status">{{ league.status }}</span>
      </div>
    }
  `,
})
export class LeagueListComponent implements OnInit {
  private api = inject(ApiService);
  leagues = signal<any[]>([]);
  ngOnInit() { this.api.get<any[]>('leagues').subscribe((l) => this.leagues.set(l)); }
}
