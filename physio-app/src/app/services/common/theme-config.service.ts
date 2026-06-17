import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { PreferenceService } from './preference.service';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSize = 'small' | 'medium' | 'large';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';

export interface ThemeConfig {
  mode: ThemeMode;
  fontSize: FontSize;
  accentColor: AccentColor;
}

const KEYS = {
  MODE: 'theme.mode',
  FONT: 'theme.fontSize',
  ACCENT: 'theme.accentColor',
} as const;

const DEFAULTS: ThemeConfig = {
  mode: 'light',
  fontSize: 'medium',
  accentColor: 'blue',
};

const ACCENT_RGB: Record<AccentColor, string> = {
  blue:   '21 101 192',   // #1565C0
  green:  '22 163 74',    // #16A34A
  purple: '147 51 234',   // #9333EA
  orange: '234 88 12',    // #EA580C
  red:    '220 38 38',    // #DC2626
  pink:   '219 39 119',   // #DB2777
};

const FONT_PX: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

@Injectable({ providedIn: 'root' })
export class ThemeConfigService {
  private prefSrv = inject(PreferenceService);

  readonly config = signal<ThemeConfig>(DEFAULTS);

  hydrateFromCache(): void {
    const cfg: ThemeConfig = {
      mode: this.prefSrv.get<ThemeMode>(KEYS.MODE, DEFAULTS.mode),
      fontSize: this.prefSrv.get<FontSize>(KEYS.FONT, DEFAULTS.fontSize),
      accentColor: this.prefSrv.get<AccentColor>(KEYS.ACCENT, DEFAULTS.accentColor),
    };
    this.config.set(cfg);
    this.apply(cfg);
  }

  preview(cfg: Partial<ThemeConfig>): void {
    const merged = { ...this.config(), ...cfg };
    this.config.set(merged);
    this.apply(merged);
  }

  save(cfg: ThemeConfig): Observable<unknown> {
    this.config.set(cfg);
    this.apply(cfg);
    return this.prefSrv.setMany([
      { key: KEYS.MODE, value: cfg.mode, group: 'theme' },
      { key: KEYS.FONT, value: cfg.fontSize, group: 'theme' },
      { key: KEYS.ACCENT, value: cfg.accentColor, group: 'theme' },
    ]);
  }

  reset(): Observable<unknown> {
    return this.save(DEFAULTS);
  }

  private apply(cfg: ThemeConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const isDark =
      cfg.mode === 'dark' ||
      (cfg.mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    root.dataset['themeMode'] = cfg.mode;

    root.style.fontSize = FONT_PX[cfg.fontSize];
    root.dataset['fontSize'] = cfg.fontSize;

    root.style.setProperty('--twc-primary', ACCENT_RGB[cfg.accentColor]);
    root.dataset['accent'] = cfg.accentColor;
  }
}
