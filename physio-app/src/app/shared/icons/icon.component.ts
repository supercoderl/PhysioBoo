import { isPlatformBrowser } from '@angular/common';
import { Component, Input, OnChanges, PLATFORM_ID, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const ICON_BASE_PATH = 'assets/icons';
const svgCache = new Map<string, Promise<string>>();

@Component({
  selector: 'physio-icon',
  standalone: true,
  template: `<span class="physio-icon" [style.width.px]="size" [style.height.px]="height" [style.--physio-icon-stroke-width]="strokeWidth" [innerHTML]="safeMarkup"></span>`,
  styles: [`
    :host { display: inline-block; line-height: 0; }
    .physio-icon { display: inline-block; line-height: 0; }
    .physio-icon ::ng-deep svg { width: 100%; height: 100%; display: block; }
    .physio-icon ::ng-deep svg [stroke-width] { stroke-width: var(--physio-icon-stroke-width, 2); }
  `]
})
export class IconComponent implements OnChanges {
  @Input({ required: true }) name!: string;
  @Input() size = 16;
  @Input() strokeWidth?: number;

  safeMarkup: SafeHtml = '';
  height = this.size;

  private platformId = inject(PLATFORM_ID);

  constructor(private sanitizer: DomSanitizer) { }

  ngOnChanges(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let pending = svgCache.get(this.name);
    if (!pending) {
      pending = fetch(`${ICON_BASE_PATH}/${this.name}.svg`)
        .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
        .catch(() => {
          console.warn(`[physioboo-icons] Icon not found: ${ICON_BASE_PATH}/${this.name}.svg`);
          return '';
        });
      svgCache.set(this.name, pending);
    }

    pending.then((markup) => {
      this.safeMarkup = this.sanitizer.bypassSecurityTrustHtml(markup);
      this.height = this.deriveHeight(markup);
    });
  }

  private deriveHeight(markup: string): number {
    const match = markup.match(/viewBox\s*=\s*"[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/);
    if (!match) return this.size;
    const [, vbWidth, vbHeight] = match;
    const ratio = Number(vbWidth) / Number(vbHeight);
    return ratio > 0 ? this.size / ratio : this.size;
  }
}
