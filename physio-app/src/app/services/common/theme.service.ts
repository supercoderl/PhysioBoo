import { Injectable } from '@angular/core';

/**
 * First-paint theme cache. The real setting is the `theme.mode` preference owned by
 * `ThemeConfigService`; this only remembers the last applied light/dark state locally so the
 * app does not flash the wrong theme before preferences load.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly storageKey = 'theme'; // 'light' | 'dark'

    initTheme(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = window.localStorage.getItem(this.storageKey);
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }

    remember(isDark: boolean): void {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            window.localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
        } catch { /* storage unavailable (private mode / quota): first paint just uses the default */ }
    }
}
