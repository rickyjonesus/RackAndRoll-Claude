import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .history-wrap { padding: 2rem 2.5rem 3rem; max-width: 860px; }

    .history-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }
    .history-header h2 { margin: 0; }

    .history-subtitle {
      font-size: 0.85rem;
      color: var(--felt-mute);
      margin-bottom: 1.75rem;
    }

    .timeline {
      position: relative;
      padding-left: 50px;
    }
    .timeline::before {
      content: '';
      position: absolute;
      left: 16px;
      top: 12px;
      bottom: 12px;
      width: 2px;
      background: var(--felt-line);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 12px;
    }
    .timeline-dot {
      position: absolute;
      left: -42px;
      top: 50%;
      transform: translateY(-50%);
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Boldonse', sans-serif;
      font-size: 0.72rem;
      font-weight: 400;
      border: 2px solid var(--felt-paper);
      z-index: 1;
    }
    .timeline-dot.win  { background: var(--felt-green); color: #f4ede0; }
    .timeline-dot.loss { background: var(--felt-tomato); color: #fff; }
    .timeline-dot.live { background: var(--felt-tomato); color: #fff; font-size: 0.55rem; }

    .match-entry {
      background: #fff;
      border-radius: 14px;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
      padding: 0.9rem 1.25rem;
    }
    .match-entry-top {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .match-vs {
      flex: 1;
      font-weight: 700;
      font-size: 0.95rem;
    }
    .match-meta {
      font-size: 0.75rem;
      color: var(--felt-mute);
      margin-top: 2px;
    }
    .match-score {
      font-family: 'Boldonse', sans-serif;
      font-weight: 400;
      font-size: 1.3rem;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .match-score.win  { color: var(--felt-green); }
    .match-score.loss { color: var(--felt-tomato); }
    .match-score.live { color: var(--felt-tomato); }

    .match-game-type {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 9px;
      border-radius: 999px;
      background: var(--felt-paper-2);
      color: var(--felt-mute);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--felt-mute);
    }
    .empty-state p { margin-bottom: 1rem; }
  `],
  template: `
    <div class="history-wrap">
      <div class="history-header">
        <h2>Match History</h2>
        <a routerLink="/matches/new">+ Log Match</a>
      </div>
      @if (matches().length > 0) {
        <div class="history-subtitle">{{ wins() }}W – {{ losses() }}L · {{ matches().length }} matches total</div>
      }

      @if (matches().length === 0) {
        <div class="empty-state">
          <p>No matches yet. Log your first game!</p>
          <a routerLink="/matches/new" class="action-link">+ Log Match</a>
        </div>
      } @else {
        <div class="timeline">
          @for (match of matches(); track match.id) {
            <div class="timeline-item">
              <div class="timeline-dot" [class]="dotClass(match)">
                {{ dotLabel(match) }}
              </div>
              <div class="match-entry">
                <div class="match-entry-top">
                  <div style="flex:1">
                    <div class="match-vs">
                      {{ match.homePlayer.displayName }} vs {{ match.awayPlayer?.displayName ?? 'Guest' }}
                    </div>
                    <div class="match-meta">{{ match.gameType }}</div>
                  </div>
                  <span class="match-game-type">{{ match.gameType }}</span>
                  <div class="match-score" [class]="dotClass(match)">
                    {{ match.homeScore }} – {{ match.awayScore }}
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class MatchListComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  matches = signal<any[]>([]);

  wins = computed(() => this.matches().filter(m => this.isWin(m)).length);
  losses = computed(() => this.matches().filter(m => !this.isWin(m)).length);

  ngOnInit() { this.api.get<any[]>('matches/history').subscribe((m) => this.matches.set(m)); }

  private isWin(match: any): boolean {
    return match.homeScore > match.awayScore;
  }

  dotClass(match: any): string {
    if (!match.finalized) return 'live';
    return this.isWin(match) ? 'win' : 'loss';
  }

  dotLabel(match: any): string {
    if (!match.finalized) return '●';
    return this.isWin(match) ? 'W' : 'L';
  }
}
