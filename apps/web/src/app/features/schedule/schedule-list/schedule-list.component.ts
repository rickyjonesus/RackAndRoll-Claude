import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Upcoming Matches</h2>
    <a routerLink="/schedule/challenge">+ Challenge Player</a>
    @for (c of challenges(); track c.id) {
      <div class="challenge-card">
        <span>vs {{ c.challenged.displayName }}</span>
        <span>{{ c.proposedAt | date:'medium' }}</span>
        <span>{{ c.gameType }}</span>
        <span class="status">{{ c.status }}</span>
      </div>
    }
  `,
})
export class ScheduleListComponent implements OnInit {
  private api = inject(ApiService);
  challenges = signal<any[]>([]);
  ngOnInit() { this.api.get<any[]>('scheduling/upcoming').subscribe((c) => this.challenges.set(c)); }
}
