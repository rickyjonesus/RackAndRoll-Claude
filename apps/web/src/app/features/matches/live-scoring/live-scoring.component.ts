import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-live-scoring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Live Scoring</h2>
    @if (match()) {
      <div class="scoreboard">
        <div class="player">
          <span>{{ match().homePlayer.displayName }}</span>
          <span class="score">{{ match().homeScore }}</span>
          <button (click)="addRack(match().homePlayer.id)">+1</button>
        </div>
        <div class="player">
          <span>{{ match().awayPlayer.displayName }}</span>
          <span class="score">{{ match().awayScore }}</span>
          <button (click)="addRack(match().awayPlayer.id)">+1</button>
        </div>
      </div>
      <button (click)="undo()">Undo Last Rack</button>
      <button (click)="finalize()">Finalize Match</button>
    }
  `,
})
export class LiveScoringComponent implements OnInit {
  @Input() id!: string;
  private api = inject(ApiService);
  match = signal<any>(null);
  rackNum = signal(1);

  ngOnInit() { this.api.get<any>(`matches/${this.id}`).subscribe((m) => this.match.set(m)); }

  addRack(winnerId: string) {
    this.api.post(`matches/${this.id}/racks`, { winnerId, rackNum: this.rackNum() }).subscribe((rack) => {
      this.rackNum.update((n) => n + 1);
    });
  }

  undo() { this.api.patch(`matches/${this.id}/racks/undo`, {}).subscribe(); }
  finalize() { this.api.patch(`matches/${this.id}/finalize`, {}).subscribe((m) => this.match.set(m)); }
}
