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
    :host {
      display: block;
      background: #0b0d10;
      min-height: 100%;
    }
    .scoring-layout {
      max-width: 600px;
      margin: 0 auto;
      padding: 1.5rem 1rem;
    }
    h2 {
      color: #fff;
      font-family: 'Boldonse', sans-serif;
      font-weight: 400;
      font-size: 1.4rem;
      letter-spacing: -0.02em;
      margin-bottom: 1.5rem;
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
      background: #161920;
      border-radius: 16px;
      padding: 1.5rem 1rem;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .player-name {
      font-weight: 600;
      font-size: 0.9rem;
      text-align: center;
      color: rgba(255,255,255,0.45);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .score-display {
      font-family: 'Boldonse', sans-serif;
      font-weight: 400;
      font-size: 5rem;
      color: #00e5ff;
      line-height: 1;
      letter-spacing: -0.03em;
      transition: color 0.15s;
    }
    .score-display.popped {
      animation: rack-pop 0.4s ease-out;
    }
    @keyframes rack-pop {
      0%   { transform: scale(1);    color: #00e5ff; }
      40%  { transform: scale(1.3);  color: #fff; }
      100% { transform: scale(1);    color: #00e5ff; }
    }
    .rack-btn {
      width: 100%;
      min-height: 88px;
      font-size: 1.5rem;
      font-weight: 800;
      border-radius: 12px;
      background: #00e5ff;
      color: #0b0d10;
      border: none;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      touch-action: manipulation;
      box-shadow: 0 4px 0 #00b0cc;
    }
    .rack-btn:hover { background: #00cfea; }
    .rack-btn:active { transform: translateY(3px); box-shadow: none; }
    .match-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .btn-secondary {
      background: #1e2229;
      color: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: none;
    }
    .btn-secondary:hover { background: #252b34; color: #fff; }
    .btn-danger {
      background: #ff5722;
      color: #fff;
      box-shadow: 0 3px 0 #c43e16;
    }
    .btn-danger:hover { background: #e64a19; }
    .btn-danger:active { transform: translateY(2px); box-shadow: none; }
    .undo-dialog {
      background: #161920;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .undo-dialog p { margin: 0; font-size: 1rem; color: rgba(255,255,255,0.8); }
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
      // Normalize guest matches: synthesize an awayPlayer object so the template is uniform
      if (!m.awayPlayer && m.guestName) {
        m.awayPlayer = { id: '__guest__', displayName: m.guestName };
      }
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
