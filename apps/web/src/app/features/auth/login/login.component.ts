import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h1>RackAndRoll</h1>
      <h2>Sign In</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="email" type="email" placeholder="Email" />
        <input formControlName="password" type="password" placeholder="Password" />
        <button type="submit" [disabled]="form.invalid">Sign In</button>
      </form>
      <a routerLink="/auth/register">Create account</a>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe();
  }
}
