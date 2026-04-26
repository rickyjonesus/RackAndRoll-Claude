import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { ApiService } from './api.service';

interface AuthState {
  token: string | null;
  userId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private state = signal<AuthState>({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
  });

  isAuthenticated = computed(() => !!this.state().token);
  token = computed(() => this.state().token);

  register(email: string, password: string, displayName: string) {
    return this.api.post<{ accessToken: string }>('auth/register', { email, password, displayName }).pipe(
      tap((res) => this.setSession(res.accessToken)),
    );
  }

  login(email: string, password: string) {
    return this.api.post<{ accessToken: string }>('auth/login', { email, password }).pipe(
      tap((res) => this.setSession(res.accessToken)),
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.state.set({ token: null, userId: null });
    this.router.navigate(['/auth/login']);
  }

  private setSession(token: string) {
    localStorage.setItem('token', token);
    this.state.update((s) => ({ ...s, token }));
    this.router.navigate(['/dashboard']);
  }
}
