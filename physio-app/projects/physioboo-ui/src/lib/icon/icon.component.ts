import { NgClass, isPlatformBrowser } from '@angular/common';
import { Component, Input, OnChanges, PLATFORM_ID, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BOO_ICON_PATH } from './icon.config';

const svgCache = new Map<string, Promise<string>>();
// Markup of icons that have finished loading, so new instances can render it without waiting a microtask.
const svgLoaded = new Map<string, string>();

/**
 * Inline SVG icon loaded from `BOO_ICON_PATH` (`assets/icons` by default) and coloured with `currentColor`.
 * The selector keeps the `physio-icon` name it had before the library existed; it is used in several hundred templates.
 */
@Component({
  selector: 'physio-icon',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="physio-icon"
      [style.width.px]="size"
      [style.height.px]="height"
      [style.--physio-icon-stroke-width]="strokeWidth"
      [innerHTML]="safeMarkup"
      [ngClass]="class"
    ></span>`,
  styles: [`
    :host { display: inline-block; line-height: 0; }
    .physio-icon { display: inline-block; line-height: 0; color: inherit; }
    .physio-icon ::ng-deep svg { width: 100%; height: 100%; display: block; color: inherit; }
    .physio-icon ::ng-deep svg[stroke-width], .physio-icon ::ng-deep svg [stroke-width] { stroke-width: var(--physio-icon-stroke-width, 2); }
  `]
})
export class BooIconComponent implements OnChanges {
  @Input({ required: true }) name!: string;
  @Input() size = 16;
  @Input() class?: string;
  @Input() strokeWidth?: number;

  safeMarkup: SafeHtml = '';
  height = this.size;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly basePath = inject(BOO_ICON_PATH);
  private readonly sanitizer = inject(DomSanitizer);

  ngOnChanges(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Already loaded: apply it now. Resolving through a promise here schedules a task per new instance, and a
    // list that re-creates its rows on every change detection (e.g. *ngFor over a getter) then never settles.
    const loaded = svgLoaded.get(this.name);
    if (loaded !== undefined) {
      this.apply(loaded);
      return;
    }

    let pending = svgCache.get(this.name);
    if (!pending) {
      const name = this.name;
      const url = `${this.basePath}/${name}.svg`;
      pending = fetch(url)
        .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
        .catch(() => {
          console.warn(`[@physioboo/ui] Icon not found: ${url}`);
          return '';
        })
        .then((markup) => {
          svgLoaded.set(name, markup);
          return markup;
        });
      svgCache.set(this.name, pending);
    }

    const requested = this.name;
    pending.then((markup) => {
      // The name may have changed while this one was loading.
      if (requested === this.name) this.apply(markup);
    });
  }

  private apply(markup: string): void {
    this.safeMarkup = this.sanitizer.bypassSecurityTrustHtml(markup);
    this.height = this.deriveHeight(markup);
  }

  private deriveHeight(markup: string): number {
    const match = markup.match(/viewBox\s*=\s*"[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/);
    if (!match) return this.size;
    const [, vbWidth, vbHeight] = match;
    const ratio = Number(vbWidth) / Number(vbHeight);
    return ratio > 0 ? this.size / ratio : this.size;
  }
}
