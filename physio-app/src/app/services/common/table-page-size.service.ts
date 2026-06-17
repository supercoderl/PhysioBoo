import { DestroyRef, ElementRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
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
  private destroyRef = inject(DestroyRef);

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

  watch(opts: PageSizeOptions = {}): Observable<number> {
    const subject = new BehaviorSubject<number>(this.calculate(opts));

    fromEvent(window, 'resize')
      .pipe(
        debounceTime(120),
        map(() => this.calculate(opts)),
        startWith(subject.value),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(size => subject.next(size));

    return subject.asObservable();
  }

  private resolveHost(host?: ElementRef<HTMLElement> | HTMLElement): HTMLElement | null {
    if (!host) return null;
    return host instanceof ElementRef ? host.nativeElement : host;
  }
}
