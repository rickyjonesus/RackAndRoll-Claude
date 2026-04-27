import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .standings-wrap { padding: 2rem 2.5rem 3rem; max-width: 900px; }
    .standings-wrap h2 { margin-bottom: 1.75rem; }

    .standings-table-wrap {
      background: #fff;
      border-radius: 18px;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
      overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--felt-line);
    }
    th {
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--felt-mute);
      background: var(--felt-paper-2);
    }
    tr:last-child td { border-bottom: none; }
    tbody tr:hover td { background: rgba(0,0,0,0.02); }

    .rank-num {
      font-family: 'Boldonse', sans-serif;
      font-size: 1.1rem;
      font-weight: 400;
      color: var(--felt-mute);
    }
    .rank-num.top { color: var(--felt-tomato); }

    .player-name { font-weight: 700; font-size: 0.95rem; }

    .pts-val {
      font-family: 'Boldonse', sans-serif;
      font-size: 1rem;
      font-weight: 400;
      color: var(--felt-green);
    }

    .row-highlight td { background: rgba(200, 238, 71, 0.12) !important; }
  `],
  template: `
    <div class="standings-wrap">
      <h2>League Standings</h2>
      <div class="standings-table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>P</th>
              <th>W</th>
              <th>L</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            @for (member of standings(); track member.userId; let i = $index) {
              <tr [class.row-highlight]="i === 0">
                <td><span class="rank-num" [class.top]="i < 3">{{ i + 1 }}</span></td>
                <td><span class="player-name">{{ member.user.displayName }}</span></td>
                <td>{{ member.played }}</td>
                <td>{{ member.won }}</td>
                <td>{{ member.lost }}</td>
                <td><span class="pts-val">{{ member.points }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class StandingsComponent implements OnInit {
  @Input() id!: string;
  private api = inject(ApiService);
  standings = signal<any[]>([]);
  ngOnInit() { this.api.get<any[]>(`leagues/${this.id}/standings`).subscribe((s) => this.standings.set(s)); }
}
