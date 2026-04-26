import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Match History</h2>
    <a routerLink="/matches/new">+ Log Match</a>
    @for (match of matches(); track match.id) {
      <div class="match-card">
        <span>{{ match.homePlayer.displayName }} vs {{ match.awayPlayer.displayName }}</span>
        <span>{{ match.homeScore }} – {{ match.awayScore }}</span>
        <span>{{ match.gameType }}</span>
      </div>
    }
  `,
})
export class MatchListComponent implements OnInit {
  private api = inject(ApiService);
  matches = signal<any[]>([]);
  ngOnInit() { this.api.get<any[]>('matches/history').subscribe((m) => this.matches.set(m)); }
}
