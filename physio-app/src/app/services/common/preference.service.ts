import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { BASE_API } from '../../shared/api/base';
import { PagedResponse } from '../../shared/types/common';
import { PreferenceItem } from '../../shared/types/core';

@Injectable({ providedIn: 'root' })
export class PreferenceService {
  private cache = signal<Record<string, string>>({});
  readonly snapshot = computed(() => this.cache());

  constructor(private http: HttpClient) {}

  loadAll(): Observable<Record<string, string>> {
    return this.http
      .get<PagedResponse<Record<string, string>>>(BASE_API.PREFERENCE.ME)
      .pipe(
        map(res => res?.data ?? {}),
        tap(prefs => this.cache.set(prefs))
      );
  }

  get<T>(key: string, fallback: T): T {
    const raw = this.cache()[key];
    if (raw === undefined || raw === null) return fallback;
    try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
  }

  has(key: string): boolean {
    return this.cache()[key] !== undefined;
  }

  set<T>(key: string, value: T, group: string = 'general'): Observable<unknown> {
    return this.setMany([{ key, value, group }]);
  }

  setMany(entries: Array<{ key: string; value: unknown; group?: string }>): Observable<unknown> {
    if (!entries.length) return of(null);

    const preferences: PreferenceItem[] = entries.map(e => ({
      key: e.key,
      value: JSON.stringify(e.value),
      group: e.group ?? 'general'
    }));

    this.cache.update(c => {
      const next = { ...c };
      for (const p of preferences) next[p.key] = p.value;
      return next;
    });

    return this.http.post(BASE_API.PREFERENCE.BASE, { preferences });
  }

  remove(key: string): Observable<unknown> {
    this.cache.update(c => {
      const next = { ...c };
      delete next[key];
      return next;
    });
    return this.http.delete(`${BASE_API.PREFERENCE.BASE}/${encodeURIComponent(key)}`);
  }
}
