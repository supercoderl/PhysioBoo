import { NgClass, isPlatformBrowser } from '@angular/common';
import { Component, Input, OnChanges, PLATFORM_ID, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const ICON_BASE_PATH = 'assets/icons';
const svgCache = new Map<string, Promise<string>>();
// Markup of icons that have finished loading, so new instances can render it without waiting a microtask.
const svgLoaded = new Map<string, string>();

@Component({
  selector: 'physio-icon',
  standalone: true,
  // Not SharedModule: it re-exports this component, and the cycle breaks module load order.
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
export class IconComponent implements OnChanges {
  @Input({ required: true }) name!: string;
  @Input() size = 16;
  @Input() class?: string;
  @Input() strokeWidth?: number;

  safeMarkup: SafeHtml = '';
  height = this.size;

  private platformId = inject(PLATFORM_ID);

  constructor(private sanitizer: DomSanitizer) { }

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
      pending = fetch(`${ICON_BASE_PATH}/${name}.svg`)
        .then((res) => (res.ok ? res.text() : Promise.reject(res.status)))
        .catch(() => {
          console.warn(`[physioboo-icons] Icon not found: ${ICON_BASE_PATH}/${name}.svg`);
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
