import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-new-match',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Log Match</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <input formControlName="opponentId" placeholder="Opponent ID" />
      <select formControlName="gameType">
        <option value="EIGHT_BALL">8-Ball</option>
        <option value="NINE_BALL">9-Ball</option>
        <option value="TEN_BALL">10-Ball</option>
        <option value="STRAIGHT">Straight</option>
      </select>
      <input formControlName="raceToRacks" type="number" placeholder="Race to (racks)" />
      <button type="submit" [disabled]="form.invalid">Start Match</button>
    </form>
  `,
})
export class NewMatchComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    opponentId: ['', Validators.required],
    gameType: ['EIGHT_BALL', Validators.required],
    raceToRacks: [7],
  });

  submit() {
    this.api.post<any>('matches', this.form.getRawValue()).subscribe((m) => {
      this.router.navigate(['/matches/live', m.id]);
    });
  }
}
