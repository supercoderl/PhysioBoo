import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { PreferenceService } from './preference.service';
import { ThemeService } from './theme.service';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSize = 'small' | 'medium' | 'large';
/** The product has one accent. Saved choices from the old palette (blue, green, …) fall back to it. */
export type AccentColor = 'rose';

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

const KEY_BY_FIELD: Record<keyof ThemeConfig, string> = {
  mode: KEYS.MODE,
  fontSize: KEYS.FONT,
  accentColor: KEYS.ACCENT,
};

const DEFAULTS: ThemeConfig = {
  mode: 'light',
  fontSize: 'medium',
  accentColor: 'rose',
};

const ACCENTS: readonly AccentColor[] = ['rose'];

const FONT_PX: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

@Injectable({ providedIn: 'root' })
export class ThemeConfigService {
  private prefSrv = inject(PreferenceService);
  private themeSrv = inject(ThemeService);

  readonly config = signal<ThemeConfig>(DEFAULTS);
  /** Whether the dark palette is in effect (resolves `auto` against the OS setting). */
  readonly isDark = computed(() => this.resolveDark(this.config().mode));

  hydrateFromCache(): void {
    const cfg: ThemeConfig = {
      mode: this.prefSrv.get<ThemeMode>(KEYS.MODE, DEFAULTS.mode),
      fontSize: this.prefSrv.get<FontSize>(KEYS.FONT, DEFAULTS.fontSize),
      accentColor: this.knownAccent(this.prefSrv.get<string>(KEYS.ACCENT, DEFAULTS.accentColor)),
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

  /** Applies and saves only the given fields, e.g. a quick toggle from the header. */
  update(cfg: Partial<ThemeConfig>): Observable<unknown> {
    const merged = { ...this.config(), ...cfg };
    this.config.set(merged);
    this.apply(merged);
    return this.prefSrv.setMany(
      (Object.keys(cfg) as (keyof ThemeConfig)[]).map(field => ({
        key: KEY_BY_FIELD[field],
        value: merged[field],
        group: 'theme',
      }))
    );
  }

  reset(): Observable<unknown> {
    return this.save(DEFAULTS);
  }

  private apply(cfg: ThemeConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const isDark = this.resolveDark(cfg.mode);
    root.classList.toggle('dark', isDark);
    this.themeSrv.remember(isDark);
    root.dataset['themeMode'] = cfg.mode;

    root.style.fontSize = FONT_PX[cfg.fontSize];
    root.dataset['fontSize'] = cfg.fontSize;

    // The palette lives in styles.scss; clear any inline override left by an older accent choice.
    root.style.removeProperty('--twc-primary');
    root.dataset['accent'] = cfg.accentColor;
  }

  private resolveDark(mode: ThemeMode): boolean {
    if (mode === 'dark') return true;
    return mode === 'auto'
      && typeof window !== 'undefined'
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private knownAccent(value: string): AccentColor {
    return ACCENTS.includes(value as AccentColor) ? (value as AccentColor) : DEFAULTS.accentColor;
  }
}
