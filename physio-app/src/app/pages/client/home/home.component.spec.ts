import { DestroyRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { PublicArticleService } from '../../../services/public/public-article.service';
import { PublicDoctorService } from '../../../services/public/public-doctor.service';
import { PublicHospitalService } from '../../../services/public/public-hospital.service';
import { PublicSiteService } from '../../../services/public/public-site.service';
import { HomeComponent } from './home.component';

const page = (items: unknown[]) => of({ success: true, data: { items, totalCount: items.length } });
const doctor = (id: string) => ({ id, fullName: `Doctor ${id}` });

interface Calls { [name: string]: any[] }

function setup(overrides: {
    filters?: () => Observable<any>;
    doctors?: () => Observable<any>;
    clinics?: () => Observable<any>;
    articles?: () => Observable<any>;
    profile?: () => Observable<any>;
    platform?: string;
} = {}) {
    const calls: Calls = { filters: [], doctors: [], clinics: [], articles: [], navigate: [] };
    const record = (name: string, fn: () => Observable<any>) => (...args: any[]) => { calls[name].push(args[0]); return fn(); };
    const injector = Injector.create({
        providers: [
            {
                provide: PublicDoctorService, useValue: {
                    getFilterOptions: record('filters', overrides.filters ?? (() => of({ success: true, data: { specialties: [{ id: 's1', name: 'Orthopedics' }, { id: 's2', name: 'Sports rehab' }], facilities: [] } }))),
                    search: record('doctors', overrides.doctors ?? (() => page([doctor('d1'), doctor('d2')]))),
                }
            },
            { provide: PublicHospitalService, useValue: { search: record('clinics', overrides.clinics ?? (() => page([{ id: 'h1' }]))) } },
            { provide: PublicArticleService, useValue: { search: record('articles', overrides.articles ?? (() => page([{ id: 'a1' }]))) } },
            { provide: PublicSiteService, useValue: { getProfile: overrides.profile ?? (() => of({ phone: null, email: null, hero: null })) } },
            { provide: Router, useValue: { navigate: (cmds: any[], extras: any) => { calls['navigate'].push({ cmds, extras }); return Promise.resolve(true); } } },
            { provide: ActivatedRoute, useValue: { fragment: of(null) } },
            { provide: PLATFORM_ID, useValue: overrides.platform ?? 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp = runInInjectionContext(injector, () => new HomeComponent());
    cmp.ngOnInit();
    return { cmp, calls };
}

describe('HomeComponent (public homepage)', () => {
    it('loads every section from the public APIs, with no sample content', () => {
        const { cmp, calls } = setup();
        expect(cmp.specialties.state).toBe('results');
        expect(cmp.specialties.items.map(s => s.name)).toEqual(['Orthopedics', 'Sports rehab']);
        expect(cmp.doctors.items.map(d => d.id)).toEqual(['d1', 'd2']);
        expect(cmp.clinics.state).toBe('results');
        expect(cmp.articles.state).toBe('results');
        expect(calls['doctors'][0]).toEqual({ pageNumber: 1, pageSize: 3 });
        expect(calls['articles'][0].sort).toBe('-publishDate');
    });

    it('uses the tenant profile for contact details and builds a dialable phone link', () => {
        const { cmp } = setup({ profile: () => of({ phone: '+84 28 1234 5678', email: 'hello@clinic.test', hero: null }) });
        expect(cmp.profile.email).toBe('hello@clinic.test');
        expect(cmp.phoneHref).toBe('tel:+842812345678');
    });

    it('keeps the static defaults when the tenant profile fails, so contact fields stay hidden', () => {
        const { cmp } = setup({ profile: () => throwError(() => new Error('down')) });
        expect(cmp.profile).toEqual({ phone: null, email: null, hero: null });
        expect(cmp.phoneHref).toBe('');
    });

    it('maps known specialties to their icon and falls back for the rest', () => {
        const { cmp } = setup();
        expect(cmp.specialties.items.map(s => s.icon)).toEqual(['bone', 'stethoscope']);
    });

    it('offers the first specialties as popular searches, and none when they failed to load', () => {
        expect(setup().cmp.popular).toEqual(['Orthopedics', 'Sports rehab']);
        expect(setup({ filters: () => throwError(() => ({ status: 503 })) }).cmp.popular).toEqual([]);
    });

    it('shows an error, not an empty section, when a request fails', () => {
        const { cmp } = setup({ doctors: () => throwError(() => ({ status: 503 })) });
        expect(cmp.doctors.state).toBe('error');
        expect(cmp.doctors.retry).toBe('default');
        // The other sections still load.
        expect(cmp.clinics.state).toBe('results');
    });

    it('treats an unsuccessful response as an error', () => {
        const { cmp } = setup({ clinics: () => of({ success: false, data: null }) });
        expect(cmp.clinics.state).toBe('error');
    });

    it('shows the empty state only when the request succeeded with no items', () => {
        const { cmp } = setup({ doctors: () => page([]) });
        expect(cmp.doctors.state).toBe('empty');
    });

    it('repeats only the failed request on Try again, and says so when it fails again', () => {
        let fail = true;
        const { cmp, calls } = setup({ doctors: () => fail ? throwError(() => ({ status: 0 })) : page([doctor('d9')]) });
        cmp.retry('doctors');
        expect(calls['doctors'].length).toBe(2);
        expect(calls['clinics'].length).toBe(1);
        expect(cmp.doctors.retry).toBe('failed');

        fail = false;
        cmp.retry('doctors');
        expect(cmp.doctors.state).toBe('results');
        expect(cmp.doctors.retry).toBe('default');
        expect(cmp.doctors.items.map(d => d.id)).toEqual(['d9']);
    });

    it('does not call the API during server rendering', () => {
        const { cmp, calls } = setup({ platform: 'server' });
        expect(calls['doctors'].length).toBe(0);
        expect(cmp.doctors.state).toBe('loading');
    });

    it('sends the hero keyword to the Search page', () => {
        const { cmp, calls } = setup();
        cmp.onQueryChange('  knee pain ');
        cmp.submitSearch(new Event('submit'));
        expect(calls['navigate'][0]).toEqual({ cmds: ['/search'], extras: { queryParams: { q: 'knee pain' } } });
    });

    it('does not navigate on an empty search and shows the hint until the visitor types', () => {
        const { cmp, calls } = setup();
        cmp.onQueryChange('   ');
        cmp.submitSearch(new Event('submit'));
        expect(calls['navigate'].length).toBe(0);
        expect(cmp.emptySubmit).toBeTrue();
        cmp.onQueryChange('k');
        expect(cmp.emptySubmit).toBeFalse();
    });

    it('searches for a popular specialty on the Search page', () => {
        const { cmp, calls } = setup();
        cmp.searchFor('Orthopedics');
        expect(calls['navigate'][0]).toEqual({ cmds: ['/search'], extras: { queryParams: { q: 'Orthopedics' } } });
    });
});
