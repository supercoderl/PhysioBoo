import { ElementRef, Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

export interface PageSizeOptions {
  rowHeight?: number;
  toolbarHeight?: number;
  headerHeight?: number;
  footerHeight?: number;
  extraOffset?: number;
  min?: number;
  max?: number;
  hostElement?: ElementRef<HTMLElement> | HTMLElement;
}

@Injectable({ providedIn: 'root' })
export class TablePageSizeService {
  private static readonly DEFAULTS: Required<Omit<PageSizeOptions, 'hostElement'>> = {
    rowHeight: 48,
    toolbarHeight: 48,
    headerHeight: 48,
    footerHeight: 44,
    extraOffset: 0,
    min: 5,
    max: 100,
  };

  calculate(opts: PageSizeOptions = {}): number {
    const o = { ...TablePageSizeService.DEFAULTS, ...opts };
    const host = this.resolveHost(opts.hostElement);

    const top = host
      ? host.getBoundingClientRect().top
      : 0;

    const viewport = window.innerHeight;
    const tableChrome = o.toolbarHeight + o.headerHeight + o.footerHeight + o.extraOffset;
    const available = viewport - top - tableChrome;

    const rows = Math.floor(available / o.rowHeight);
    return Math.max(o.min, Math.min(o.max, rows));
  }

  /**
   * Emits the page size now and again whenever a window resize changes it. The resize listener belongs to the
   * subscription, so callers unsubscribe (e.g. `takeUntilDestroyed`) to release it with their component.
   */
  watch(opts: PageSizeOptions = {}): Observable<number> {
    return fromEvent(window, 'resize').pipe(
      debounceTime(120),
      startWith(null),
      map(() => this.calculate(opts)),
      distinctUntilChanged()
    );
  }

  private resolveHost(host?: ElementRef<HTMLElement> | HTMLElement): HTMLElement | null {
    if (!host) return null;
    return host instanceof ElementRef ? host.nativeElement : host;
  }
}
