import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .schedule-wrap { padding: 2rem 2.5rem 3rem; max-width: 860px; }
    .schedule-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .schedule-header h2 { margin: 0; }

    .challenge-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      margin-bottom: 0.6rem;
      background: #fff;
      border-radius: 14px;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
    }
    .challenge-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--felt-tomato);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .challenge-opp { font-weight: 700; font-size: 0.95rem; }
    .challenge-meta { font-size: 0.78rem; color: var(--felt-mute); margin-top: 1px; }

    .status {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      background: var(--felt-paper-2);
      color: var(--felt-mute);
    }
    .status.PENDING { background: rgba(236, 181, 59, 0.15); color: #9a7520; }
    .status.ACCEPTED { background: rgba(31, 107, 80, 0.1); color: var(--felt-green); }
    .status.DECLINED { background: rgba(238, 90, 58, 0.1); color: var(--felt-tomato); }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--felt-mute);
    }
    .empty-state p { margin-bottom: 1rem; }
  `],
  template: `
    <div class="schedule-wrap">
      <div class="schedule-header">
        <h2>Upcoming Matches</h2>
        <a routerLink="/schedule/challenge">+ Challenge Player</a>
      </div>

      @if (challenges().length === 0) {
        <div class="empty-state">
          <p>No upcoming challenges. Send one to get on the board!</p>
          <a routerLink="/schedule/challenge">+ Challenge Player</a>
        </div>
      }

      @for (c of challenges(); track c.id) {
        <div class="challenge-card">
          <div class="challenge-icon">⚡</div>
          <div style="flex:1">
            <div class="challenge-opp">vs {{ c.challenged.displayName }}</div>
            <div class="challenge-meta">{{ c.gameType }} · {{ c.proposedAt | date:'mediumDate' }}</div>
          </div>
          <span class="status" [class]="c.status">{{ c.status }}</span>
        </div>
      }
    </div>
  `,
})
export class ScheduleListComponent implements OnInit {
  private api = inject(ApiService);
  challenges = signal<any[]>([]);
  ngOnInit() { this.api.get<any[]>('scheduling/upcoming').subscribe((c) => this.challenges.set(c)); }
}
