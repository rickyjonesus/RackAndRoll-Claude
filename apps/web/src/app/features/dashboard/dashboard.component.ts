import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface Summary { played: number; wins: number; losses: number; winPct: number; streak: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      @if (summary()) {
        <div class="stats-cards">
          <div class="card"><span class="label">Wins</span><span class="value">{{ summary()!.wins }}</span></div>
          <div class="card"><span class="label">Losses</span><span class="value">{{ summary()!.losses }}</span></div>
          <div class="card"><span class="label">Win %</span><span class="value">{{ (summary()!.winPct * 100) | number:'1.0-1' }}%</span></div>
          <div class="card"><span class="label">Streak</span><span class="value">{{ summary()!.streak }}</span></div>
        </div>
      }
      <nav class="quick-actions">
        <a routerLink="/matches/new">Log Match</a>
        <a routerLink="/schedule/challenge">Challenge Player</a>
        <a routerLink="/stats">Stats</a>
        <a routerLink="/leagues">Leagues</a>
      </nav>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary = signal<Summary | null>(null);
  ngOnInit() { this.api.get<Summary>('stats/summary').subscribe((s) => this.summary.set(s)); }
}
