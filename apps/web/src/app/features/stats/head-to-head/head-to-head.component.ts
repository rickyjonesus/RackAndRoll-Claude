import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-head-to-head',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Head-to-Head</h2>
    @for (match of matches(); track match.id) {
      <div class="match-row">
        <span>{{ match.homePlayer.displayName }} {{ match.homeScore }} – {{ match.awayScore }} {{ match.awayPlayer.displayName }}</span>
        <span>{{ match.playedAt | date:'shortDate' }}</span>
        <span>{{ match.gameType }}</span>
      </div>
    }
  `,
})
export class HeadToHeadComponent implements OnInit {
  @Input() opponentId!: string;
  private api = inject(ApiService);
  matches = signal<any[]>([]);
  ngOnInit() { this.api.get<any[]>(`stats/h2h/${this.opponentId}`).subscribe((m) => this.matches.set(m)); }
}
