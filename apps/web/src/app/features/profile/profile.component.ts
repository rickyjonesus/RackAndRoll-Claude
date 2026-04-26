import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Profile</h2>
    @if (profile()) {
      <form [formGroup]="form" (ngSubmit)="save()">
        <p><strong>{{ profile()!.displayName }}</strong></p>
        <p>{{ profile()!.email }}</p>
        <input formControlName="homeVenue" placeholder="Home venue" />
        <button type="submit">Save</button>
      </form>
    }
    <button (click)="auth.logout()">Sign Out</button>
  `,
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  protected auth = inject(AuthService);
  private fb = inject(FormBuilder);
  profile = signal<any>(null);

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
