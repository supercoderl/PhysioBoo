import { Injectable } from '@angular/core';

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

    isDark(): boolean {
        if (typeof window === 'undefined') return false;
        return window.document.documentElement.classList.contains('dark');
    }

    toggleTheme(): void {
        if (typeof window !== 'undefined') {
            const html = window.document.documentElement;
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem(this.storageKey, isDark ? 'dark' : 'light');
        }
    }
}
