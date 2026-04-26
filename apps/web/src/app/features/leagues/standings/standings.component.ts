import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>League Standings</h2>
    <table>
      <thead><tr><th>#</th><th>Player</th><th>P</th><th>W</th><th>L</th><th>Pts</th></tr></thead>
      <tbody>
        @for (member of standings(); track member.userId; let i = $index) {
          <tr>
            <td>{{ i + 1 }}</td>
            <td>{{ member.user.displayName }}</td>
            <td>{{ member.played }}</td>
            <td>{{ member.won }}</td>
            <td>{{ member.lost }}</td>
            <td>{{ member.points }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class StandingsComponent implements OnInit {
  @Input() id!: string;
  private api = inject(ApiService);
  standings = signal<any[]>([]);
  ngOnInit() { this.api.get<any[]>(`leagues/${this.id}/standings`).subscribe((s) => this.standings.set(s)); }
}
