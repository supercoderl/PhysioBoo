import { isPlatformBrowser } from '@angular/common';
import { Component, Input, OnChanges, PLATFORM_ID, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const ICON_BASE_PATH = 'assets/icons';
const svgCache = new Map<string, Promise<string>>();

@Component({
  selector: 'physio-icon',
  standalone: true,
  template: `<span class="physio-icon" [style.width.px]="size" [style.height.px]="height" [innerHTML]="safeMarkup"></span>`,
  styles: [`
    :host { display: inline-block; line-height: 0; }
    .physio-icon { display: inline-block; line-height: 0; }
    .physio-icon ::ng-deep svg { width: 100%; height: 100%; display: block; }
  `]
})
export class IconComponent implements OnChanges {
  /** Name of the .svg file (without extension) under src/assets/icons/. */
  @Input({ required: true }) name!: string;
  /** Controlling dimension — width is always exactly this; height is derived from the icon's own aspect ratio. */
  @Input() size = 16;

  safeMarkup: SafeHtml = '';
  height = this.size;

  private platformId = inject(PLATFORM_ID);

  constructor(private sanitizer: DomSanitizer) { }

  ngOnChanges(): void {
    // Native fetch() can't resolve a relative URL during SSR (no document/base URL on the server) — load client-side only, filling in on hydration.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let pending = svgCache.get(this.name);
    if (!pending) {
      // Plain fetch — this is a static frontend asset, not a backend API call, so it must bypass HttpClient's InterceptorService (which rewrites every relative URL to the API host).
      pending = fetch(`${ICON_BASE_PATH}/${this.name}.svg`)
        .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
        .catch(() => {
          console.warn(`[physioboo-icons] Icon not found: ${ICON_BASE_PATH}/${this.name}.svg`);
          return '';
        });
      svgCache.set(this.name, pending);
    }

    pending.then((markup) => {
      // Markup is a static asset file shipped with the app build, never user input, so trusting it as HTML is safe.
      this.safeMarkup = this.sanitizer.bypassSecurityTrustHtml(markup);
      this.height = this.deriveHeight(markup);
    });
  }

  /** Reads the icon's own viewBox to keep its native aspect ratio instead of forcing a square box. */
  private deriveHeight(markup: string): number {
    const match = markup.match(/viewBox\s*=\s*"[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/);
    if (!match) return this.size;
    const [, vbWidth, vbHeight] = match;
    const ratio = Number(vbWidth) / Number(vbHeight);
    return ratio > 0 ? this.size / ratio : this.size;
  }
}
