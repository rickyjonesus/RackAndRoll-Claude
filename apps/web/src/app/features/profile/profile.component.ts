import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .profile-wrap { padding: 2rem 2.5rem 3rem; max-width: 600px; }

    .profile-hero {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
      background: #fff;
      border-radius: 18px;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
      margin-bottom: 1.5rem;
    }
    .profile-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--felt-green);
      color: var(--felt-lime);
      font-family: 'Boldonse', sans-serif;
      font-size: 1.5rem;
      font-weight: 400;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .profile-name {
      font-family: 'Boldonse', sans-serif;
      font-size: 1.4rem;
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin-bottom: 2px;
    }
    .profile-email {
      font-size: 0.85rem;
      color: var(--felt-mute);
    }

    .profile-form {
      background: #fff;
      border-radius: 18px;
      border: 1px solid var(--felt-line);
      box-shadow: 0 2px 0 var(--felt-line);
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .profile-form h3 {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.09em;
      color: var(--felt-mute);
      margin: 0 0 1rem;
    }
    .profile-form input { margin-bottom: 0; }
    .profile-form button { margin-top: 0.75rem; width: 100%; }

    .sign-out-btn {
      width: 100%;
      background: var(--felt-paper-2) !important;
      color: var(--felt-ink) !important;
      box-shadow: 0 3px 0 var(--felt-line) !important;
    }
    .sign-out-btn:hover { background: var(--felt-tomato) !important; color: #fff !important; }
  `],
  template: `
    <div class="profile-wrap">
      <h2>Profile</h2>
      @if (profile()) {
        <div class="profile-hero">
          <div class="profile-avatar">{{ initials() }}</div>
          <div>
            <div class="profile-name">{{ profile()!.displayName }}</div>
            <div class="profile-email">{{ profile()!.email }}</div>
          </div>
        </div>

        <div class="profile-form">
          <h3>Settings</h3>
          <form [formGroup]="form" (ngSubmit)="save()">
            <input formControlName="homeVenue" placeholder="Home venue" />
            <button type="submit">Save</button>
          </form>
        </div>
      }

      <button class="sign-out-btn" (click)="auth.logout()">Sign Out</button>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  protected auth = inject(AuthService);
  private fb = inject(FormBuilder);
  profile = signal<any>(null);

  initials = computed(() => {
    const name = this.profile()?.displayName ?? '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  form = this.fb.nonNullable.group({ homeVenue: [''] });

  ngOnInit() {
    this.api.get<any>('users/me').subscribe((p) => {
      this.profile.set(p);
      this.form.patchValue({ homeVenue: p.homeVenue ?? '' });
    });
  }

  save() {
    this.api.patch('users/me', this.form.getRawValue()).subscribe();
  }
}
