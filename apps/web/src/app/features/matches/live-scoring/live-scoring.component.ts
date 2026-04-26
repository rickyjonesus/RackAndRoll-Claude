import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ActiveMatchService } from '../../../core/services/active-match.service';

@Component({
  selector: 'app-live-scoring',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .scoring-layout {
      max-width: 600px;
      margin: 1.5rem auto;
      padding: 0 1rem;
    }
    .scoreboard {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .player-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      background: var(--color-surface);
      border-radius: var(--radius);
      padding: 1.25rem 1rem;
    }
    .player-name {
      font-weight: 600;
      font-size: 1rem;
      text-align: center;
      color: var(--color-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }
    .score-display {
      font-size: 3.5rem;
      font-weight: 800;
      color: var(--color-primary);
      line-height: 1;
      transition: color 0.15s;
    }
    .score-display.popped {
      animation: rack-pop 0.4s ease-out;
    }
    @keyframes rack-pop {
      0%   { transform: scale(1);    color: var(--color-primary); }
      40%  { transform: scale(1.35); color: #fff; }
      100% { transform: scale(1);    color: var(--color-primary); }
    }
    .rack-btn {
      width: 100%;
      min-height: 80px;
      font-size: 1.6rem;
      font-weight: 800;
      border-radius: var(--radius);
      background: var(--color-primary);
      color: #000;
      border: none;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      touch-action: manipulation;
    }
    .rack-btn:active { transform: scale(0.96); background: var(--color-primary-dark); }
    .match-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .btn-secondary {
      background: var(--color-surface-2);
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }
    .btn-secondary:hover { background: var(--color-surface); }
    .btn-danger { background: var(--color-accent); color: #fff; }
    .btn-danger:hover { background: #e64a19; }
    .undo-dialog {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: 1.25rem;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .undo-dialog p { margin: 0; font-size: 1rem; }
    .undo-dialog .actions { display: flex; gap: 0.75rem; }
  `],
  template: `
    <div class="scoring-layout">
      <h2>Live Scoring</h2>

      @if (match()) {
        <div class="scoreboard">
          <div class="player-col">
            <div class="player-name">{{ match().homePlayer.displayName }}</div>
            <div class="score-display" [class.popped]="poppedId() === match().homePlayer.id">
              {{ homeScore() }}
            </div>
            <button class="rack-btn" (click)="addRack(match().homePlayer.id)">+Rack</button>
          </div>
          <div class="player-col">
            <div class="player-name">{{ match().awayPlayer.displayName }}</div>
            <div class="score-display" [class.popped]="poppedId() === match().awayPlayer.id">
              {{ awayScore() }}
            </div>
            <button class="rack-btn" (click)="addRack(match().awayPlayer.id)">+Rack</button>
          </div>
        </div>

        @if (undoPending()) {
          <div class="undo-dialog">
            <p>Undo last rack by <strong>{{ lastRackWinnerName() }}</strong>?</p>
            <div class="actions">
              <button class="btn-danger" (click)="confirmUndo()">Yes, undo</button>
              <button class="btn-secondary" (click)="undoPending.set(false)">Cancel</button>
            </div>
          </div>
        }

        <div class="match-actions">
          <button class="btn-secondary" (click)="requestUndo()" [disabled]="undoPending()">
            Undo Last Rack
          </button>
          <button (click)="finalize()">Finalize Match</button>
        </div>
      }
    </div>
  `,
})
export class LiveScoringComponent implements OnInit {
  @Input() id!: string;
  private api = inject(ApiService);
  private router = inject(Router);
  private activeMatch = inject(ActiveMatchService);

  match = signal<any>(null);
  homeScore = signal(0);
  awayScore = signal(0);
  poppedId = signal<string | null>(null);
  undoPending = signal(false);
  lastRackWinnerId = signal<string | null>(null);

  lastRackWinnerName = () => {
    const m = this.match();
    const id = this.lastRackWinnerId();
    if (!m || !id) return '';
    return m.homePlayer.id === id ? m.homePlayer.displayName : m.awayPlayer.displayName;
  };

  ngOnInit() {
    this.api.get<any>(`matches/${this.id}`).subscribe((m) => {
      this.match.set(m);
      this.homeScore.set(m.homeScore ?? 0);
      this.awayScore.set(m.awayScore ?? 0);
      this.activeMatch.set(
        m.id,
        `${m.homePlayer.displayName} vs ${m.awayPlayer.displayName}`,
      );
    });
  }

  addRack(winnerId: string) {
    const m = this.match();
    const rackNum = this.homeScore() + this.awayScore() + 1;
    this.api.post(`matches/${this.id}/racks`, { winnerId, rackNum }).subscribe(() => {
      if (winnerId === m.homePlayer.id) this.homeScore.update((n) => n + 1);
      else this.awayScore.update((n) => n + 1);
      this.lastRackWinnerId.set(winnerId);
      this.triggerPop(winnerId);
    });
  }

  private triggerPop(playerId: string) {
    this.poppedId.set(playerId);
    setTimeout(() => this.poppedId.set(null), 450);
  }

  requestUndo() {
    if (!this.lastRackWinnerId()) return;
    this.undoPending.set(true);
  }

  confirmUndo() {
    const lastWinnerId = this.lastRackWinnerId();
    this.api.patch(`matches/${this.id}/racks/undo`, {}).subscribe(() => {
      const m = this.match();
      if (lastWinnerId === m.homePlayer.id) this.homeScore.update((n) => Math.max(0, n - 1));
      else this.awayScore.update((n) => Math.max(0, n - 1));
      this.lastRackWinnerId.set(null);
      this.undoPending.set(false);
    });
  }

  finalize() {
    this.api.patch(`matches/${this.id}/finalize`, {}).subscribe(() => {
      this.activeMatch.clear();
      this.router.navigate(['/matches']);
    });
  }
}
