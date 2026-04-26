import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  template: `
    <h2>Stats</h2>
    @if (summary()) {
      <div class="stats-grid">
        <div class="stat"><label>Played</label><span>{{ summary()!.played }}</span></div>
        <div class="stat"><label>Wins</label><span>{{ summary()!.wins }}</span></div>
        <div class="stat"><label>Losses</label><span>{{ summary()!.losses }}</span></div>
        <div class="stat"><label>Win %</label><span>{{ (summary()!.winPct * 100) | number:'1.1-1' }}%</span></div>
        <div class="stat"><label>Streak</label><span>{{ summary()!.streak }}</span></div>
      </div>
    }
    <a routerLink="/stats/rating">View Rating Chart</a>
  `,
})
export class StatsDashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary = signal<any>(null);
  ngOnInit() { this.api.get<any>('stats/summary').subscribe((s) => this.summary.set(s)); }
}
