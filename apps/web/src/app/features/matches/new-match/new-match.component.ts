import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../../core/services/api.service';

interface PlayerResult {
  id: string;
  displayName: string;
  rating: number;
}

@Component({
  selector: 'app-new-match',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .new-match {
      max-width: 480px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    .search-wrap { position: relative; }
    .results-dropdown {
      position: absolute;
      top: 100%;
      left: 0; right: 0;
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      border-top: none;
      border-radius: 0 0 var(--radius) var(--radius);
      z-index: 10;
      max-height: 220px;
      overflow-y: auto;
    }
    .result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 1rem;
      cursor: pointer;
      transition: background 0.15s;
    }
    .result-item:hover { background: var(--color-surface); }
    .result-item .rating { font-size: 0.8rem; color: var(--color-text-muted); }
    .guest-link {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.88rem;
      color: var(--color-text-muted);
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      text-align: left;
    }
    .guest-link:hover { color: var(--color-primary); background: none; }
    .selected-player {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.6rem 0.9rem;
      background: var(--color-surface-2);
      border: 1px solid var(--color-primary);
      border-radius: var(--radius);
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }
    .selected-player button {
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.1rem;
      padding: 0 0.25rem;
      cursor: pointer;
      min-height: unset;
    }
    .selected-player button:hover { background: none; color: var(--color-accent); }
  `],
  template: `
    <div class="new-match">
      <h2>Log Match</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">

        @if (selectedPlayer()) {
          <div class="selected-player">
            <span>{{ selectedPlayer()!.displayName }} <small class="rating">({{ selectedPlayer()!.rating | number:'1.0-0' }})</small></span>
            <button type="button" (click)="clearOpponent()" title="Remove">✕</button>
          </div>
        } @else if (isGuest()) {
          <input formControlName="guestName" placeholder="Guest name (optional)" />
          <button type="button" class="guest-link" (click)="isGuest.set(false)">← Search for a registered player</button>
        } @else {
          <div class="search-wrap">
            <input
              [formControl]="searchCtrl"
              placeholder="Search player by name or email"
              autocomplete="off"
            />
            @if (searchResults().length > 0) {
              <div class="results-dropdown">
                @for (p of searchResults(); track p.id) {
                  <div class="result-item" (click)="selectPlayer(p)">
                    <span>{{ p.displayName }}</span>
                    <span class="rating">{{ p.rating | number:'1.0-0' }}</span>
                  </div>
                }
              </div>
            }
          </div>
          <button type="button" class="guest-link" (click)="isGuest.set(true)">
            Play as guest (opponent without an account)
          </button>
        }

        <select formControlName="gameType" style="margin-top: 0.75rem">
          <option value="EIGHT_BALL">8-Ball</option>
          <option value="NINE_BALL">9-Ball</option>
          <option value="TEN_BALL">10-Ball</option>
          <option value="STRAIGHT">Straight</option>
        </select>

        <input formControlName="raceToRacks" type="number" placeholder="Race to (racks)" min="1" />

        <button type="submit" [disabled]="!canSubmit()">Start Match</button>
      </form>
    </div>
  `,
})
export class NewMatchComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  searchCtrl = new FormControl('');
  searchResults = signal<PlayerResult[]>([]);
  selectedPlayer = signal<PlayerResult | null>(null);
  isGuest = signal(false);

  form = this.fb.nonNullable.group({
    opponentId: [''],
    guestName: [''],
    gameType: ['EIGHT_BALL', Validators.required],
    raceToRacks: [7],
  });

  canSubmit() {
    return (this.selectedPlayer() !== null || this.isGuest()) && this.form.get('gameType')?.valid;
  }

  ngOnInit() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => {
        if (!q || q.length < 2) return of([]);
        return this.api.get<PlayerResult[]>('users/search', { q }).pipe(catchError(() => of([])));
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((results) => this.searchResults.set(results));
  }

  selectPlayer(player: PlayerResult) {
    this.selectedPlayer.set(player);
    this.form.patchValue({ opponentId: player.id });
    this.searchResults.set([]);
    this.searchCtrl.setValue('', { emitEvent: false });
  }

  clearOpponent() {
    this.selectedPlayer.set(null);
    this.form.patchValue({ opponentId: '' });
  }

  submit() {
    if (!this.canSubmit()) return;
    const value = this.form.getRawValue();
    const payload = this.isGuest()
      ? { guestName: value.guestName || 'Guest', gameType: value.gameType, raceToRacks: value.raceToRacks }
      : { opponentId: value.opponentId, gameType: value.gameType, raceToRacks: value.raceToRacks };

    this.api.post<any>('matches', payload).subscribe((m) => {
      this.router.navigate(['/matches/live', m.id]);
    });
  }
}
