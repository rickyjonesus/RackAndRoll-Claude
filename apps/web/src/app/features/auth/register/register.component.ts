import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h1>RackAndRoll</h1>
      <h2>Create Account</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="displayName" placeholder="Display name" />
        <input formControlName="email" type="email" placeholder="Email" />
        <input formControlName="password" type="password" placeholder="Password (8+ chars)" />
        <button type="submit" [disabled]="form.invalid">Create Account</button>
      </form>
      <a routerLink="/auth/login">Already have an account?</a>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    if (this.form.invalid) return;
    const { email, password, displayName } = this.form.getRawValue();
    this.auth.register(email, password, displayName).subscribe();
  }
}
