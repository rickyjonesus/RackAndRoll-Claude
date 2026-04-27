import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { ActiveMatchService } from './core/services/active-match.service';
import { AuthService } from './core/services/auth.service';

describe('App', () => {
  const mockActiveMatchService = { current: signal<{ id: string; vs: string } | null>(null) };
  const authToken = signal<string | null>('mock-token');
  const mockAuthService = { isAuthenticated: computed(() => !!authToken()) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: ActiveMatchService, useValue: mockActiveMatchService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    mockActiveMatchService.current.set(null);
    authToken.set('mock-token');
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not show active match banner when there is no active match', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const banner = fixture.nativeElement.querySelector('.active-match-banner');
    expect(banner).toBeNull();
  });

  it('should show active match banner when there is an active match', async () => {
    mockActiveMatchService.current.set({ id: '1', vs: 'Alice vs Bob' });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const banner = fixture.nativeElement.querySelector('.active-match-banner');
    expect(banner).not.toBeNull();
    expect(banner.textContent).toContain('Alice vs Bob');
  });
});
