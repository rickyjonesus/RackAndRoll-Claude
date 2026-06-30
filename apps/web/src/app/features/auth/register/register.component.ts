import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <h1>RackAndRoll</h1>
      <h2>Create Account</h2>
      <div class="oauth-buttons">
        <a class="oauth-btn oauth-btn--google" [href]="googleUrl">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </a>
        <a class="oauth-btn oauth-btn--apple" [href]="appleUrl">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.34.74 3.15.8 1.19-.24 2.35-.93 3.56-.84 1.5.13 2.64.67 3.38 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.32 3.1-2.57 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Sign up with Apple
        </a>
      </div>
      <div class="oauth-divider"><span>or sign up with email</span></div>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="displayName" placeholder="Display name" />
        <input formControlName="email" type="email" placeholder="Email" />
        <input formControlName="password" type="password" placeholder="Password (8+ chars)" />
        <button type="submit" [disabled]="form.invalid">Create Account</button>
      </form>
      <a routerLink="/auth/login">Already have an account?</a>
    </div>
  `,
  styles: [`
    .oauth-divider {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0;
      color: #888;
      font-size: 13px;
    }
    .oauth-divider::before,
    .oauth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #ddd;
    }
    .oauth-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 4px;
    }
    .oauth-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .oauth-btn:hover { opacity: 0.85; }
    .oauth-btn--google {
      background: #fff;
      border: 1px solid #ddd;
      color: #333;
    }
    .oauth-btn--apple {
      background: #000;
      border: 1px solid #000;
      color: #fff;
    }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly googleUrl = `${environment.apiUrl}/auth/google`;
  readonly appleUrl = `${environment.apiUrl}/auth/apple`;

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
