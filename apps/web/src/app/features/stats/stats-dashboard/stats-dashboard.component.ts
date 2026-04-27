import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  styles: [`
    .stats-wrap { padding: 2rem 2.5rem 3rem; max-width: 900px; }
    .stats-wrap h2 { margin-bottom: 1.5rem; }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.75rem;
    }
    .stat-tile {
      background: #fff;
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
    }
    .stat-tile.lime  { background: var(--felt-lime); border-color: var(--felt-lime-2); }
    .stat-tile.green { background: var(--felt-green); border-color: var(--felt-green-2); color: #f4ede0; }
    .stat-tile.tomato { background: var(--felt-tomato); border-color: var(--felt-tomato-2); color: #fff; }
    .stat-label {
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--felt-mute);
      margin-bottom: 0.35rem;
    }
    .stat-tile.green .stat-label,
    .stat-tile.tomato .stat-label { color: rgba(255,255,255,0.65); }
    .stat-value {
      font-family: 'Boldonse', sans-serif;
      font-weight: 400;
      font-size: 2rem;
      line-height: 1;
      letter-spacing: -0.02em;
    }

    .form-card {
      background: #fff;
      border-radius: 18px;
      padding: 1.25rem 1.5rem;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
      margin-bottom: 1.5rem;
    }
    .form-card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--felt-mute);
      margin-bottom: 1rem;
    }
    .form-bars {
      display: flex;
      gap: 5px;
      height: 48px;
      align-items: flex-end;
    }
    .form-bar {
      flex: 1;
      border-radius: 4px;
      min-width: 8px;
    }
    .form-bar.w { background: var(--felt-green); }
    .form-bar.l { background: var(--felt-tomato); opacity: 0.7; height: 40%; }

    .h2h-section { margin-top: 1.5rem; }
    .h2h-section h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: var(--felt-mute);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-bottom: 0.75rem;
    }
  `],
  template: `
    <div class="stats-wrap">
      <h2>Stats</h2>
      @if (summary()) {
        <div class="stat-grid">
          <div class="stat-tile lime">
            <div class="stat-label">Wins</div>
            <div class="stat-value">{{ summary()!.wins }}</div>
          </div>
          <div class="stat-tile">
            <div class="stat-label">Losses</div>
            <div class="stat-value">{{ summary()!.losses }}</div>
          </div>
          <div class="stat-tile green">
            <div class="stat-label">Win %</div>
            <div class="stat-value">{{ (summary()!.winPct * 100) | number:'1.1-1' }}%</div>
          </div>
          <div class="stat-tile">
            <div class="stat-label">Played</div>
            <div class="stat-value">{{ summary()!.played }}</div>
          </div>
          <div class="stat-tile tomato">
            <div class="stat-label">Streak</div>
            <div class="stat-value">{{ summary()!.streak }}</div>
          </div>
        </div>

        @if (formBars().length > 0) {
          <div class="form-card">
            <div class="form-card-head">
              <span>Recent form</span>
              <span>{{ summary()!.wins }}W – {{ summary()!.losses }}L</span>
            </div>
            <div class="form-bars">
              @for (bar of formBars(); track $index) {
                <div class="form-bar" [class]="bar === 'w' ? 'w' : 'l'" [style.height]="bar === 'w' ? '100%' : '40%'"></div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class StatsDashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary = signal<any>(null);

  formBars = computed<string[]>(() => {
    const s = this.summary();
    if (!s) return [];
    const w = s.wins ?? 0;
    const l = s.losses ?? 0;
    const bars: string[] = [];
    for (let i = 0; i < w; i++) bars.push('w');
    for (let i = 0; i < l; i++) bars.push('l');
    return bars.slice(0, 20);
  });

  ngOnInit() { this.api.get<any>('stats/summary').subscribe((s) => this.summary.set(s)); }
}
