import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface Summary { played: number; wins: number; losses: number; winPct: number; streak: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  styles: [`
    .dash-wrap { padding: 2rem 2.5rem 3rem; max-width: 1000px; }

    .dash-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .dash-eyebrow {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--felt-mute);
      margin-bottom: 4px;
    }
    .dash-header h1 { margin: 0; }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .card { display: flex; flex-direction: column; gap: 0.3rem; }
    .card.card-lime { background: var(--felt-lime); }
    .card.card-green { background: var(--felt-green); color: #f4ede0; }
    .card.card-green .label { color: rgba(244,237,224,0.65); }
    .card.card-dark { background: var(--felt-ink); color: #f4ede0; }
    .card.card-dark .label { color: rgba(244,237,224,0.55); }
    .card.card-dark .value { color: #f4ede0; }

    .section-label {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--felt-mute);
      margin-bottom: 0.85rem;
    }

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.9rem;
      margin-bottom: 2rem;
    }
    .action-tile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: #fff;
      border-radius: 14px;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
      color: var(--felt-ink);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.88rem;
      transition: all 0.15s;
    }
    .action-tile:hover {
      background: var(--felt-green);
      border-color: var(--felt-green);
      color: #f4ede0;
      text-decoration: none;
      transform: translateY(-1px);
    }
    .action-tile .tile-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--felt-paper-2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
      transition: background 0.15s;
    }
    .action-tile:hover .tile-icon { background: rgba(255,255,255,0.15); }
    .action-tile.primary {
      background: var(--felt-lime);
      border-color: var(--felt-lime);
      box-shadow: 0 3px 0 var(--felt-lime-2);
    }
    .action-tile.primary:hover {
      background: var(--felt-lime-2);
      border-color: var(--felt-lime-2);
      color: var(--felt-ink);
    }
    .action-tile.primary .tile-icon { background: rgba(0,0,0,0.1); }
  `],
  template: `
    <div class="dash-wrap">
      <div class="dash-header">
        <div>
          <div class="dash-eyebrow">Your dashboard</div>
          <h1>Welcome back.</h1>
        </div>
      </div>

      @if (summary()) {
        <div class="section-label">Your stats</div>
        <div class="stats-cards">
          <div class="card card-lime">
            <span class="label">Wins</span>
            <span class="value">{{ summary()!.wins }}</span>
          </div>
          <div class="card">
            <span class="label">Losses</span>
            <span class="value">{{ summary()!.losses }}</span>
          </div>
          <div class="card card-green">
            <span class="label">Win %</span>
            <span class="value">{{ (summary()!.winPct * 100) | number:'1.0-1' }}%</span>
          </div>
          <div class="card card-dark">
            <span class="label">Streak</span>
            <span class="value">{{ summary()!.streak }}</span>
          </div>
        </div>
      }

      <div class="section-label">Quick actions</div>
      <div class="action-grid">
        <a routerLink="/matches/new" class="action-tile primary">
          <div class="tile-icon">🎱</div>
          <span>Log Match</span>
        </a>
        <a routerLink="/schedule/challenge" class="action-tile">
          <div class="tile-icon">⚡</div>
          <span>Challenge Player</span>
        </a>
        <a routerLink="/stats" class="action-tile">
          <div class="tile-icon">📈</div>
          <span>View Stats</span>
        </a>
        <a routerLink="/leagues" class="action-tile">
          <div class="tile-icon">🏆</div>
          <span>Leagues</span>
        </a>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary = signal<Summary | null>(null);
  ngOnInit() { this.api.get<Summary>('stats/summary').subscribe((s) => this.summary.set(s)); }
}
