import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Challenge a Player</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <input formControlName="challengedId" placeholder="Opponent display name or ID" />
      <select formControlName="gameType">
        <option value="EIGHT_BALL">8-Ball</option>
        <option value="NINE_BALL">9-Ball</option>
        <option value="TEN_BALL">10-Ball</option>
        <option value="STRAIGHT">Straight</option>
      </select>
      <input formControlName="proposedAt" type="datetime-local" />
      <button type="submit" [disabled]="form.invalid">Send Challenge</button>
    </form>
  `,
})
export class ChallengeComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    challengedId: ['', Validators.required],
    gameType: ['EIGHT_BALL', Validators.required],
    proposedAt: ['', Validators.required],
  });

  submit() {
    this.api.post('scheduling/challenges', this.form.getRawValue()).subscribe(() => {
      this.router.navigate(['/schedule']);
    });
  }
}
