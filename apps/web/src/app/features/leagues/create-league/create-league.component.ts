import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-create-league',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Create League</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <input formControlName="name" placeholder="League name" />
      <select formControlName="gameType">
        <option value="EIGHT_BALL">8-Ball</option>
        <option value="NINE_BALL">9-Ball</option>
        <option value="TEN_BALL">10-Ball</option>
        <option value="STRAIGHT">Straight</option>
      </select>
      <input formControlName="startDate" type="date" />
      <input formControlName="endDate" type="date" />
      <button type="submit" [disabled]="form.invalid">Create</button>
    </form>
  `,
})
export class CreateLeagueComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    gameType: ['EIGHT_BALL', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  submit() {
    this.api.post<any>('leagues', this.form.getRawValue()).subscribe((l) => {
      this.router.navigate(['/leagues', l.id, 'standings']);
    });
  }
}
