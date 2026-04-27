import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-league-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .leagues-wrap { padding: 2rem 2.5rem 3rem; max-width: 860px; }
    .leagues-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .leagues-header h2 { margin: 0; }

    .league-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      margin-bottom: 0.6rem;
      background: #fff;
      border-radius: 14px;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
      transition: box-shadow 0.15s, transform 0.1s;
    }
    .league-card:hover { transform: translateY(-1px); box-shadow: 0 4px 0 var(--felt-line); }

    .league-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--felt-green);
      color: var(--felt-lime);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .league-name {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--felt-ink);
      text-decoration: none;
    }
    .league-name:hover { color: var(--felt-green); text-decoration: none; }
    .league-sub { font-size: 0.78rem; color: var(--felt-mute); margin-top: 1px; }

    .status {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      background: var(--felt-paper-2);
      color: var(--felt-mute);
    }
    .status.ACTIVE { background: rgba(31, 107, 80, 0.1); color: var(--felt-green); }
    .status.PENDING { background: rgba(236, 181, 59, 0.15); color: #9a7520; }
    .status.CLOSED { background: var(--felt-paper-2); color: var(--felt-mute); }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--felt-mute);
    }
  `],
  template: `
    <div class="leagues-wrap">
      <div class="leagues-header">
        <h2>Leagues</h2>
        <a routerLink="/leagues/new">+ Create League</a>
      </div>

      @if (leagues().length === 0) {
        <div class="empty-state">No leagues yet. Create one to get started!</div>
      }

      @for (league of leagues(); track league.id) {
        <div class="league-card">
          <div class="league-icon">🏆</div>
          <div style="flex:1">
            <a class="league-name" [routerLink]="['/leagues', league.id, 'standings']">{{ league.name }}</a>
            <div class="league-sub">{{ league.gameType }}</div>
          </div>
          <span class="status" [class]="league.status">{{ league.status }}</span>
        </div>
      }
    </div>
  `,
})
export class LeagueListComponent implements OnInit {
  private api = inject(ApiService);
  leagues = signal<any[]>([]);
  ngOnInit() { this.api.get<any[]>('leagues').subscribe((l) => this.leagues.set(l)); }
}
