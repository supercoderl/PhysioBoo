import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Output, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { MenuService } from '../../../../services/admin/menu.service';
import { FullscreenService } from '../../../../services/common/fullscreen.service';
import { LanguageService } from '../../../../services/common/language.service';
import { PreferenceService } from '../../../../services/common/preference.service';
import { ThemeConfigService } from '../../../../services/common/theme-config.service';
import { ToastService } from '../../../../services/common/toast.service';
import { SharedModule } from '../../../../shared/shared-imports';
import { MenuItem } from '../../../../shared/types/menu.types';

/** A navigable menu leaf, flattened out of the user's menu tree. */
export interface HeaderPage {
  id: string;
  label: string;
  icon: string;
  url: string;
  /** Labels of the parent sections, e.g. "Reception". */
  section: string;
}

const SHORTCUTS_KEY = 'layout.headerShortcuts';
/** Shown until the user picks their own: the booking calendar and the patient directory. */
const DEFAULT_SHORTCUT_URLS = ['/admin/reception/booking/list', '/admin/crm/patient'];
export const MAX_SHORTCUTS = 8;
const MAX_SEARCH_RESULTS = 8;

@Component({
  selector: 'admin-main-header',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.scss'
})
export class AdminMainHeaderComponent {
  // #region Inputs, Outputs, Properties
  @Output() collapseEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() drawerEvent: EventEmitter<{ type: string | null; data: HTMLElement | null }> = new EventEmitter<{ type: string | null; data: HTMLElement | null }>();
  @Output() popoverEvent: EventEmitter<{ type: string | null; data: HTMLElement | null }> = new EventEmitter<{ type: string | null; data: HTMLElement | null }>();

  protected fs = inject(FullscreenService);
  protected themeCfgSrv = inject(ThemeConfigService);
  protected languageSrv = inject(LanguageService);
  private menuSrv = inject(MenuService);
  private prefSrv = inject(PreferenceService);
  private toastSrv = inject(ToastService);
  private router = inject(Router);

  readonly maxShortcuts = MAX_SHORTCUTS;
  readonly menuLoaded = this.menuSrv.loaded;
  themeSaving = signal(false);
  shortcutSaving = signal(false);

  /** Every page of the user's admin menu, in sidebar order. */
  readonly pages = computed(() => this.flatten(this.menuSrv.adminMenus()));

  /** Saved shortcut URLs, or the defaults when the user never customised them. */
  private readonly shortcutUrls = computed(() =>
    this.prefSrv.get<string[] | null>(SHORTCUTS_KEY, null) ?? DEFAULT_SHORTCUT_URLS
  );
  /** Shortcuts the user can still open; pages removed from their menu drop out. */
  readonly shortcuts = computed(() => {
    const byUrl = new Map(this.pages().map(p => [p.url, p]));
    return this.shortcutUrls()
      .map(url => byUrl.get(url))
      .filter((p): p is HeaderPage => !!p);
  });
  readonly shortcutSet = computed(() => new Set(this.shortcuts().map(s => s.url)));

  isSearching = signal(false);
  query = signal('');
  activeIndex = signal(-1);
  readonly results = computed(() => {
    const terms = this.normalize(this.query()).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return this.pages()
      .filter(p => {
        const haystack = this.normalize(`${p.section} ${p.label}`);
        return terms.every(t => haystack.includes(t));
      })
      .slice(0, MAX_SEARCH_RESULTS);
  });

  @ViewChild('searchTrigger') searchTrigger?: ElementRef<HTMLButtonElement>;
  @ViewChild('searchBox') searchBox?: ElementRef<HTMLElement>;
  @ViewChild('searchInput') set searchInput(input: ElementRef<HTMLInputElement> | undefined) {
    input?.nativeElement.focus();
  }
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor() {
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(() => this.closeSearch(false));
  }
  // #endregion

  // #region Popovers
  openPopover(event: MouseEvent, type: string) {
    this.popoverEvent.emit({
      type,
      data: event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    });
  }
  // #endregion

  // #region Theme
  toggleTheme() {
    if (this.themeSaving()) return;
    const previous = this.themeCfgSrv.config().mode;
    this.themeSaving.set(true);
    this.themeCfgSrv.update({ mode: this.themeCfgSrv.isDark() ? 'light' : 'dark' })
      .pipe(finalize(() => this.themeSaving.set(false)))
      .subscribe({
        error: () => {
          this.themeCfgSrv.preview({ mode: previous });
          this.toastSrv.error('Could not save your theme preference');
        }
      });
  }
  // #endregion

  // #region Shortcuts
  toggleShortcut(page: HeaderPage) {
    if (this.shortcutSaving()) return;
    const current = this.shortcuts().map(s => s.url);
    const isPinned = current.includes(page.url);
    if (!isPinned && current.length >= MAX_SHORTCUTS) {
      this.toastSrv.error(`You can pin up to ${MAX_SHORTCUTS} shortcuts`);
      return;
    }

    const next = isPinned ? current.filter(url => url !== page.url) : [...current, page.url];
    this.shortcutSaving.set(true);
    this.prefSrv.set(SHORTCUTS_KEY, next, 'layout')
      .pipe(finalize(() => this.shortcutSaving.set(false)))
      .subscribe({
        error: () => this.toastSrv.error('Could not save your shortcuts')
      });
  }
  // #endregion

  // #region Search
  toggleSearch() {
    if (this.isSearching()) this.closeSearch();
    else this.isSearching.set(true);
  }

  closeSearch(restoreFocus: boolean = true) {
    if (!this.isSearching()) return;
    this.isSearching.set(false);
    this.query.set('');
    this.activeIndex.set(-1);
    if (restoreFocus) setTimeout(() => this.searchTrigger?.nativeElement.focus());
  }

  onQueryChange(value: string) {
    this.query.set(value);
    this.activeIndex.set(this.results().length ? 0 : -1);
  }

  onSearchKeydown(event: KeyboardEvent) {
    const count = this.results().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (count) this.activeIndex.set((this.activeIndex() + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (count) this.activeIndex.set((this.activeIndex() - 1 + count) % count);
        break;
      case 'Enter': {
        event.preventDefault();
        const page = this.results()[this.activeIndex()];
        if (page) this.openPage(page);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.closeSearch();
        break;
    }
  }

  openPage(page: HeaderPage) {
    this.closeSearch(false);
    this.router.navigateByUrl(page.url);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.isSearching()) return;
    const target = event.target as Node | null;
    if (!target) return;
    const insideSearch = this.searchBox?.nativeElement.contains(target)
      || this.searchTrigger?.nativeElement.contains(target);
    if (!insideSearch) this.closeSearch(false);
  }
  // #endregion

  // #region Helpers
  trackByUrl(_: number, page: HeaderPage): string {
    return page.url;
  }

  private flatten(items: MenuItem[], parents: string[] = []): HeaderPage[] {
    return items.flatMap(item => {
      if (item.children?.length) {
        return this.flatten([...item.children].sort((a, b) => a.order - b.order), [...parents, item.label]);
      }
      if (!item.route) return [];
      return [{
        id: item.id,
        label: item.label,
        icon: item.icon,
        url: this.toUrl(item.route),
        section: parents.join(' / ')
      }];
    });
  }

  /** Seeded routes are absolute (`/admin/crm/patient`); older ones are relative to `/admin`. */
  private toUrl(route: string): string {
    return route.startsWith('/') ? route : `/admin/${route}`;
  }

  /** Case- and accent-insensitive, so "dieu tri" finds "Điều trị". */
  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .trim();
  }
  // #endregion
}
