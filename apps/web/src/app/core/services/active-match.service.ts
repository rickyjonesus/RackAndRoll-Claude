import { Injectable, signal } from '@angular/core';

interface ActiveMatch {
  id: string;
  vs: string;
}

@Injectable({ providedIn: 'root' })
export class ActiveMatchService {
  private _match = signal<ActiveMatch | null>(
    JSON.parse(localStorage.getItem('activeMatch') ?? 'null'),
  );

  current = this._match.asReadonly();

  set(id: string, vs: string) {
    const val = { id, vs };
    localStorage.setItem('activeMatch', JSON.stringify(val));
    this._match.set(val);
  }

  clear() {
    localStorage.removeItem('activeMatch');
    this._match.set(null);
  }
}
