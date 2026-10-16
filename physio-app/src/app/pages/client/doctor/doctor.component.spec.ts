import { DestroyRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Params, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PublicDoctorService } from '../../../services/public/public-doctor.service';
import { PublicDoctor } from '../../../shared/types/public-doctor.types';
import { DoctorComponent } from './doctor.component';

const SPEC = '11111111-1111-1111-1111-111111111111';
const HOSP = '22222222-2222-2222-2222-222222222222';

function doctor(i: number): PublicDoctor {
    return {
        id: `d${i}`, fullName: `Doctor ${i}`, avatarUrl: null, specialty: null, facilities: [], bio: null,
        isVerified: false, yearsOfExperience: null, isAvailableOnline: false, isAvailableHomeVisit: false,
    };
}

/** Builds the component with a fake router that feeds navigations back into the query params, like the real one. */
function setup(initial: Params = {}, respond: (req: any) => Observable<any> = () => of({ success: true, data: { items: [doctor(1)], totalCount: 1 } })) {
    const params$ = new BehaviorSubject(convertToParamMap(initial));
    const navigations: { params: Params; replaceUrl: boolean }[] = [];
    const requests: any[] = [];
    const router = {
        navigate: (_: unknown[], extras: { queryParams: Params; replaceUrl?: boolean }) => {
            navigations.push({ params: extras.queryParams, replaceUrl: !!extras.replaceUrl });
            const clean = Object.fromEntries(Object.entries(extras.queryParams).filter(([, v]) => v !== null));
            params$.next(convertToParamMap(clean));
            return Promise.resolve(true);
        },
    };
    const service = {
        search: (req: any) => { requests.push(req); return respond(req); },
        getFilterOptions: () => of({ success: true, data: { specialties: [{ id: SPEC, name: 'Sports physiotherapy' }], facilities: [{ id: HOSP, name: 'Central Rehab Clinic' }] } }),
    };
    const injector = Injector.create({
        providers: [
            { provide: Router, useValue: router },
            { provide: ActivatedRoute, useValue: { queryParamMap: params$.asObservable() } },
            { provide: PublicDoctorService, useValue: service },
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp = runInInjectionContext(injector, () => new DoctorComponent());
    cmp.ngOnInit();
    return { cmp, navigations, requests };
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('DoctorComponent (public doctor listing)', () => {
    it('restores search, filters and page from the URL and sends them to the API', () => {
        const { cmp, requests } = setup({ q: ' knee ', specialty: SPEC, facility: HOSP, online: '1', homeVisit: '1', page: '3' });
        expect(cmp.query).toEqual({ q: 'knee', specialty: SPEC, facility: HOSP, online: true, homeVisit: true, page: 3 });
        expect(cmp.qInput).toBe('knee');
        expect(requests[0]).toEqual({
            pageNumber: 3, pageSize: 12, search: 'knee',
            filter: { specialtyId: SPEC, hospitalId: HOSP, online: true, homeVisit: true },
        });
    });

    it('ignores malformed parameters instead of sending them to the API', () => {
        const { cmp, requests } = setup({ specialty: 'not-a-guid', facility: "1' OR 1=1", page: '-4', online: 'yes' });
        expect(cmp.query).toEqual({ q: '', specialty: '', facility: '', online: false, homeVisit: false, page: 1 });
        expect(requests[0].filter).toEqual({ specialtyId: undefined, hospitalId: undefined, online: undefined, homeVisit: undefined });
    });

    it('shows results, empty and error states', () => {
        expect(setup().cmp.state).toBe('results');
        expect(setup({}, () => of({ success: true, data: { items: [], totalCount: 0 } })).cmp.state).toBe('empty');
        expect(setup({}, () => throwError(() => ({ status: 500 }))).cmp.state).toBe('error');
        expect(setup({}, () => of({ success: false, data: null })).cmp.state).toBe('error');
    });

    it('retry repeats the same request after an error', () => {
        let fail = true;
        const { cmp, requests } = setup({ q: 'knee' }, () => fail ? throwError(() => ({ status: 0 })) : of({ success: true, data: { items: [doctor(1)], totalCount: 1 } }));
        expect(cmp.state).toBe('error');
        fail = false;
        cmp.retry();
        expect(cmp.state).toBe('results');
        expect(requests[1]).toEqual(requests[0]);
    });

    it('filters reset the page and are written to the URL; paging is a history entry', () => {
        const { cmp, navigations } = setup({ page: '2' }, () => of({ success: true, data: { items: [doctor(1)], totalCount: 40 } }));
        cmp.setSpecialty(SPEC);
        expect(navigations.at(-1)).toEqual({ params: { q: null, specialty: SPEC, facility: null, online: null, homeVisit: null, page: null }, replaceUrl: false });
        cmp.toggleOnline();
        expect(navigations.at(-1)!.params['online']).toBe('1');
        cmp.goToPage(2);
        expect(navigations.at(-1)).toEqual({ params: { q: null, specialty: SPEC, facility: null, online: '1', homeVisit: null, page: 2 }, replaceUrl: false });
    });

    it('debounces typing (300 ms) and replaces the URL entry instead of adding one', async () => {
        const { cmp, navigations, requests } = setup();
        cmp.onSearchInput('k');
        cmp.onSearchInput('kn');
        cmp.onSearchInput('knee ');
        expect(cmp.searching).toBeTrue();
        await wait(200);
        expect(navigations.length).toBe(0);
        await wait(200);
        expect(navigations.length).toBe(1);
        expect(navigations[0]).toEqual({ params: { q: 'knee', specialty: null, facility: null, online: null, homeVisit: null, page: null }, replaceUrl: true });
        expect(requests.at(-1).search).toBe('knee');
        expect(cmp.qInput).toBe('knee ');
        expect(cmp.searching).toBeFalse();
    });

    it('does not overwrite what the visitor is typing when a filter changes mid-debounce', async () => {
        const { cmp } = setup();
        cmp.onSearchInput('kne');
        cmp.toggleHomeVisit();
        expect(cmp.qInput).toBe('kne');
        await wait(350);
        expect(cmp.query.q).toBe('kne');
        expect(cmp.query.homeVisit).toBeTrue();
    });

    it('builds removable chips with option names, and clear all resets everything', () => {
        const { cmp } = setup({ q: 'knee', specialty: SPEC, facility: HOSP, homeVisit: '1' });
        expect(cmp.chips.map(c => c.label)).toEqual(['“knee”', 'Sports physiotherapy', 'Central Rehab Clinic', 'Home visit']);
        expect(cmp.filterButtonLabel).toBe('Filters (4)');
        cmp.removeChip(cmp.chips[1]);
        expect(cmp.query.specialty).toBe('');
        expect(cmp.query.q).toBe('knee');
        cmp.clearAll();
        expect(cmp.chips.length).toBe(0);
        expect(cmp.qInput).toBe('');
    });

    it('labels the result count', () => {
        expect(setup().cmp.countLabel).toBe('1 doctor');
        expect(setup({}, () => of({ success: true, data: { items: [doctor(1)], totalCount: 14 } })).cmp.countLabel).toBe('14 doctors');
        expect(setup({}, () => throwError(() => ({}))).cmp.countLabel).toBe('Results unavailable');
    });

    it('windows long pagination and ignores out-of-range pages', () => {
        const { cmp, navigations } = setup({ page: '6' }, () => of({ success: true, data: { items: [doctor(1)], totalCount: 12 * 12 } }));
        expect(cmp.totalPages).toBe(12);
        expect(cmp.pages).toEqual([1, null, 5, 6, 7, null, 12]);
        const before = navigations.length;
        cmp.goToPage(0);
        cmp.goToPage(13);
        cmp.goToPage(6);
        expect(navigations.length).toBe(before);
    });

    it('falls back to the last page when an old link points past the end', () => {
        const { navigations } = setup({ page: '9' }, req => of({ success: true, data: { items: req.pageNumber === 9 ? [] : [doctor(1)], totalCount: 20 } }));
        expect(navigations[0]).toEqual({ params: { q: null, specialty: null, facility: null, online: null, homeVisit: null, page: 2 }, replaceUrl: true });
    });
});
