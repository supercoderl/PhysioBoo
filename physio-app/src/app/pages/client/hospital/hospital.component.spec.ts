import { DestroyRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Params, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PublicHospitalService } from '../../../services/public/public-hospital.service';
import { HospitalType } from '../../../shared/enums/hospital-type';
import { PublicHospital } from '../../../shared/types/public-hospital.types';
import { HospitalComponent } from './hospital.component';

function hospital(i: number): PublicHospital {
    return {
        id: `h${i}`, name: `Clinic ${i}`, hospitalType: HospitalType.Clinic, address: null, city: null, stateProvince: null,
        phone: null, description: null, imageUrl: null, is24Hours: false, languages: [],
    };
}

/** Builds the component with a fake router that feeds navigations back into the query params, like the real one. */
function setup(initial: Params = {}, respond: (req: any) => Observable<any> = () => of({ success: true, data: { items: [hospital(1)], totalCount: 1 } })) {
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
    };
    const injector = Injector.create({
        providers: [
            { provide: Router, useValue: router },
            { provide: ActivatedRoute, useValue: { queryParamMap: params$.asObservable() } },
            { provide: PublicHospitalService, useValue: service },
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp = runInInjectionContext(injector, () => new HospitalComponent());
    cmp.ngOnInit();
    return { cmp, navigations, requests };
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('HospitalComponent (public clinic listing)', () => {
    it('restores search, type and page from the URL and sends them to the API', () => {
        const { cmp, requests } = setup({ q: ' district 1 ', type: '6', page: '3' });
        expect(cmp.query).toEqual({ q: 'district 1', type: '6', page: 3 });
        expect(cmp.qInput).toBe('district 1');
        expect(requests[0]).toEqual({ pageNumber: 3, pageSize: 12, search: 'district 1', filter: { type: HospitalType.Rehabilitation } });
    });

    it('ignores malformed parameters instead of sending them to the API', () => {
        const { cmp, requests } = setup({ type: 'toString', page: '-4' });
        expect(cmp.query).toEqual({ q: '', type: '', page: 1 });
        expect(requests[0].filter).toEqual({ type: undefined });
        expect(setup({ type: '42' }).cmp.query.type).toBe('');
    });

    it('sends the General type (0) rather than dropping it as falsy', () => {
        const { requests } = setup({ type: '0' });
        expect(requests[0].filter).toEqual({ type: HospitalType.General });
    });

    it('shows results, empty and error states', () => {
        expect(setup().cmp.state).toBe('results');
        expect(setup({}, () => of({ success: true, data: { items: [], totalCount: 0 } })).cmp.state).toBe('empty');
        expect(setup({}, () => throwError(() => ({ status: 500 }))).cmp.state).toBe('error');
        expect(setup({}, () => of({ success: false, data: null })).cmp.state).toBe('error');
    });

    it('retry repeats the same request after an error', () => {
        let fail = true;
        const { cmp, requests } = setup({ q: 'rehab' }, () => fail ? throwError(() => ({ status: 0 })) : of({ success: true, data: { items: [hospital(1)], totalCount: 1 } }));
        expect(cmp.state).toBe('error');
        fail = false;
        cmp.retry();
        expect(cmp.state).toBe('results');
        expect(requests[1]).toEqual(requests[0]);
    });

    it('the type filter resets the page and is written to the URL; paging is a history entry', () => {
        const { cmp, navigations } = setup({ page: '2' }, () => of({ success: true, data: { items: [hospital(1)], totalCount: 40 } }));
        cmp.setType('4');
        expect(navigations.at(-1)).toEqual({ params: { q: null, type: '4', page: null }, replaceUrl: false });
        cmp.goToPage(2);
        expect(navigations.at(-1)).toEqual({ params: { q: null, type: '4', page: 2 }, replaceUrl: false });
    });

    it('debounces typing (300 ms) and replaces the URL entry instead of adding one', async () => {
        const { cmp, navigations, requests } = setup();
        cmp.onSearchInput('r');
        cmp.onSearchInput('re');
        cmp.onSearchInput('rehab ');
        expect(cmp.searching).toBeTrue();
        await wait(200);
        expect(navigations.length).toBe(0);
        await wait(200);
        expect(navigations.length).toBe(1);
        expect(navigations[0]).toEqual({ params: { q: 'rehab', type: null, page: null }, replaceUrl: true });
        expect(requests.at(-1).search).toBe('rehab');
        expect(cmp.searching).toBeFalse();
    });

    it('builds removable chips, and clear all resets everything', () => {
        const { cmp } = setup({ q: 'rehab', type: '6' });
        expect(cmp.chips.map(c => c.label)).toEqual(['“rehab”', 'Rehabilitation center']);
        expect(cmp.filterButtonLabel).toBe('Filters (2)');
        cmp.removeChip(cmp.chips[1]);
        expect(cmp.query.type).toBe('');
        expect(cmp.query.q).toBe('rehab');
        cmp.clearAll();
        expect(cmp.chips.length).toBe(0);
        expect(cmp.qInput).toBe('');
    });

    it('labels the result count', () => {
        expect(setup().cmp.countLabel).toBe('1 clinic');
        expect(setup({}, () => of({ success: true, data: { items: [hospital(1)], totalCount: 14 } })).cmp.countLabel).toBe('14 clinics');
        expect(setup({}, () => throwError(() => ({}))).cmp.countLabel).toBe('Results unavailable');
    });

    it('falls back to the last page when an old link points past the end', () => {
        const { navigations } = setup({ page: '9' }, req => of({ success: true, data: { items: req.pageNumber === 9 ? [] : [hospital(1)], totalCount: 20 } }));
        expect(navigations[0]).toEqual({ params: { q: null, type: null, page: 2 }, replaceUrl: true });
    });
});
