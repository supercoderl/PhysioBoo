import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { MenuService } from '../../../../services/admin/menu.service';
import { PreferenceService } from '../../../../services/common/preference.service';
import { ThemeConfigService } from '../../../../services/common/theme-config.service';
import { BASE_API } from '../../../../shared/api/base';
import { MenuItem } from '../../../../shared/types/menu.types';
import { AdminMainHeaderComponent, MAX_SHORTCUTS } from './main-header.component';

const menu = (id: string, label: string, route: string, order: number, children?: MenuItem[]): MenuItem => ({
  id, label, route, order, icon: 'circle', isActive: true, permissionCode: [], children
});

const MENUS: MenuItem[] = [
  menu('reception', 'Reception', '/admin/reception', 0, [
    menu('booking', 'Booking', '/admin/reception/booking/list', 0),
    menu('queue', 'Queue', '/admin/reception/queue', 1),
  ]),
  menu('crm', 'CRM', '/admin/crm', 1, [
    menu('patient', 'Patient', '/admin/crm/patient', 0),
    menu('treatment', 'Điều trị', 'crm/treatment', 1),
  ]),
];

describe('AdminMainHeaderComponent', () => {
  let component: AdminMainHeaderComponent;
  let fixture: ComponentFixture<AdminMainHeaderComponent>;
  let http: HttpTestingController;
  let router: Router;

  const preferencePosts = () => http.match(r => r.url === BASE_API.PREFERENCE.BASE && r.method === 'POST');
  const keydown = (key: string) => component.onSearchKeydown(new KeyboardEvent('keydown', { key }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMainHeaderComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    TestBed.inject(MenuService).mine.set(MENUS);
    TestBed.inject(MenuService).loaded.set(true);
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);

    fixture = TestBed.createComponent(AdminMainHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => document.documentElement.classList.remove('dark'));

  it('flattens the menu into pages with absolute URLs', () => {
    expect(component.pages().map(p => p.url)).toEqual([
      '/admin/reception/booking/list',
      '/admin/reception/queue',
      '/admin/crm/patient',
      '/admin/crm/treatment',
    ]);
    expect(component.pages()[0].section).toBe('Reception');
  });

  describe('shortcuts', () => {
    it('shows the default shortcuts that exist in the menu as router links', () => {
      const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));
      expect(links.map(a => a.getAttribute('href'))).toEqual(['/admin/reception/booking/list', '/admin/crm/patient']);
    });

    it('uses the saved shortcuts and drops pages that are no longer in the menu', () => {
      const prefSrv = TestBed.inject(PreferenceService);
      (prefSrv as any).cache.set({ 'layout.headerShortcuts': JSON.stringify(['/admin/reception/queue', '/admin/gone']) });
      expect(component.shortcuts().map(s => s.url)).toEqual(['/admin/reception/queue']);
    });

    it('saves an added shortcut and ignores clicks while saving', () => {
      const queue = component.pages()[1];
      component.toggleShortcut(queue);
      component.toggleShortcut(queue);

      const [req] = preferencePosts();
      expect(preferencePosts().length).toBe(0);
      expect(req.request.body.preferences[0]).toEqual({
        key: 'layout.headerShortcuts',
        value: JSON.stringify(['/admin/reception/booking/list', '/admin/crm/patient', '/admin/reception/queue']),
        group: 'layout'
      });
      expect(component.shortcutSet().has(queue.url)).toBeTrue();
      req.flush({});
      expect(component.shortcutSaving()).toBeFalse();
    });

    it('rolls back a shortcut that failed to save', () => {
      const booking = component.pages()[0];
      component.toggleShortcut(booking);
      expect(component.shortcutSet().has(booking.url)).toBeFalse();

      preferencePosts()[0].flush('boom', { status: 500, statusText: 'Server Error' });
      expect(component.shortcutSet().has(booking.url)).toBeTrue();
    });

    it(`refuses more than ${MAX_SHORTCUTS} shortcuts`, () => {
      const prefSrv = TestBed.inject(PreferenceService);
      const many = Array.from({ length: MAX_SHORTCUTS }, (_, i) => `/admin/p${i}`);
      TestBed.inject(MenuService).mine.set(many.map((route, i) => menu(`p${i}`, `P${i}`, route, i)).concat(menu('x', 'X', '/admin/x', 99)));
      (prefSrv as any).cache.set({ 'layout.headerShortcuts': JSON.stringify(many) });

      component.toggleShortcut(component.pages().find(p => p.url === '/admin/x')!);
      expect(preferencePosts().length).toBe(0);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      component.toggleSearch();
      fixture.detectChanges();
    });

    it('focuses the input when opened', () => {
      expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input[role="combobox"]'));
    });

    it('matches labels and sections, ignoring case and accents', () => {
      component.onQueryChange('dieu TRI');
      expect(component.results().map(p => p.label)).toEqual(['Điều trị']);

      component.onQueryChange('reception que');
      expect(component.results().map(p => p.label)).toEqual(['Queue']);
    });

    it('shows an empty state when nothing matches', () => {
      component.onQueryChange('zzz');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('No pages match "zzz"');
    });

    it('navigates to the highlighted result with the keyboard and closes', () => {
      component.onQueryChange('reception');
      keydown('ArrowDown');
      keydown('Enter');

      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/reception/queue');
      expect(component.isSearching()).toBeFalse();
      expect(component.query()).toBe('');
    });

    it('wraps the highlight around the results', () => {
      component.onQueryChange('reception');
      keydown('ArrowUp');
      expect(component.activeIndex()).toBe(1);
    });

    it('closes on Escape', () => {
      keydown('Escape');
      expect(component.isSearching()).toBeFalse();
    });

    it('closes on a click outside the search box but not inside it', () => {
      fixture.nativeElement.querySelector('input[role="combobox"]').click();
      expect(component.isSearching()).toBeTrue();

      document.body.click();
      expect(component.isSearching()).toBeFalse();
    });
  });

  describe('theme', () => {
    it('saves the toggled mode as a preference', () => {
      const themeCfgSrv = TestBed.inject(ThemeConfigService);
      component.toggleTheme();

      expect(themeCfgSrv.isDark()).toBeTrue();
      expect(document.documentElement.classList.contains('dark')).toBeTrue();
      const [req] = preferencePosts();
      expect(req.request.body.preferences).toEqual([{ key: 'theme.mode', value: '"dark"', group: 'theme' }]);
      req.flush({});
    });

    it('reverts the theme when saving fails', () => {
      const themeCfgSrv = TestBed.inject(ThemeConfigService);
      component.toggleTheme();
      preferencePosts()[0].flush('boom', { status: 500, statusText: 'Server Error' });

      expect(themeCfgSrv.config().mode).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBeFalse();
      expect(component.themeSaving()).toBeFalse();
    });
  });

  it('emits the clicked button as the popover trigger', () => {
    const emitted: { type: string | null; data: HTMLElement | null }[] = [];
    component.popoverEvent.subscribe(e => emitted.push(e));

    const sizeButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="Font size"]');
    sizeButton.click();
    expect(emitted).toEqual([{ type: 'SIZE', data: sizeButton }]);
  });

  it('opens the notification drawer without a fake unread badge', () => {
    const emitted: { type: string | null }[] = [];
    component.drawerEvent.subscribe(e => emitted.push(e));

    const bell: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="Notifications"]');
    bell.click();
    expect(emitted[0].type).toBe('NOTIFICATION');
    expect(bell.querySelector('.bg-secondary')).toBeNull();
  });
});
