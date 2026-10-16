import { DestroyRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Params, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PublicServiceService } from '../../../services/public/public-service.service';
import { PublicService } from '../../../shared/types/public-service.types';
import { ServiceComponent } from './service.component';

const CLINIC = '0b6f2c1e-6a43-4c55-9d1e-2f0b8a7d1c11';

function service(i: number): PublicService {
    return { id: `s${i}`, name: `Service ${i}`, description: null, coverImageUrl: null, hospitalId: null, hospitalName: null, doctorId: null };
}

/** Builds the component with a fake router that feeds navigations back into the query params, like the real one. */
function setup(initial: Params = {}, respond: (req: any) => Observable<any> = () => of({ success: true, data: { items: [service(1)], totalCount: 1 } })) {
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
    const api = {
        search: (req: any) => { requests.push(req); return respond(req); },
        getFilterOptions: () => of({ success: true, data: { clinics: [{ id: CLINIC, name: 'Central Rehab Clinic' }] } }),
    };
    const injector = Injector.create({
        providers: [
            { provide: Router, useValue: router },
            { provide: ActivatedRoute, useValue: { queryParamMap: params$.asObservable() } },
            { provide: PublicServiceService, useValue: api },
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp = runInInjectionContext(injector, () => new ServiceComponent());
    cmp.ngOnInit();
    return { cmp, navigations, requests };
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('ServiceComponent (public service listing)', () => {
    it('restores search, clinic and page from the URL and sends them to the API', () => {
        const { cmp, requests } = setup({ q: ' stroke ', clinic: CLINIC, page: '3' });
        expect(cmp.query).toEqual({ q: 'stroke', clinic: CLINIC, page: 3 });
        expect(cmp.qInput).toBe('stroke');
        expect(requests[0]).toEqual({ pageNumber: 3, pageSize: 12, search: 'stroke', filter: { hospitalId: CLINIC } });
    });

    it('ignores malformed parameters instead of sending them to the API', () => {
        const { cmp, requests } = setup({ clinic: 'not-a-guid', page: '-4' });
        expect(cmp.query).toEqual({ q: '', clinic: '', page: 1 });
        expect(requests[0].filter).toEqual({ hospitalId: undefined });
    });

    it('shows results, empty and error states, and retry repeats the request', () => {
        expect(setup().cmp.state).toBe('results');
        expect(setup({}, () => of({ success: true, data: { items: [], totalCount: 0 } })).cmp.state).toBe('empty');
        expect(setup({}, () => of({ success: false, data: null })).cmp.state).toBe('error');

        let fail = true;
        const { cmp, requests } = setup({ q: 'rehab' }, () => fail ? throwError(() => ({ status: 0 })) : of({ success: true, data: { items: [service(1)], totalCount: 1 } }));
        expect(cmp.state).toBe('error');
        fail = false;
        cmp.retry();
        expect(cmp.state).toBe('results');
        expect(requests[1]).toEqual(requests[0]);
    });

    it('the clinic filter resets the page and is written to the URL; paging is a history entry', () => {
        const { cmp, navigations } = setup({ page: '2' }, () => of({ success: true, data: { items: [service(1)], totalCount: 40 } }));
        cmp.setClinic(CLINIC);
        expect(navigations.at(-1)).toEqual({ params: { q: null, clinic: CLINIC, page: null }, replaceUrl: false });
        cmp.goToPage(2);
        expect(navigations.at(-1)).toEqual({ params: { q: null, clinic: CLINIC, page: 2 }, replaceUrl: false });
    });

    it('debounces typing (300 ms) and replaces the URL entry instead of adding one', async () => {
        const { cmp, navigations, requests } = setup();
        cmp.onSearchInput('s');
        cmp.onSearchInput('stroke ');
        expect(cmp.searching).toBeTrue();
        await wait(200);
        expect(navigations.length).toBe(0);
        await wait(200);
        expect(navigations).toEqual([{ params: { q: 'stroke', clinic: null, page: null }, replaceUrl: true }]);
        expect(requests.at(-1).search).toBe('stroke');
    });

    it('names the clinic chip from the filter options, and clear all resets everything', () => {
        const { cmp } = setup({ q: 'rehab', clinic: CLINIC });
        expect(cmp.chips.map(c => c.label)).toEqual(['“rehab”', 'Central Rehab Clinic']);
        expect(cmp.filterButtonLabel).toBe('Filters (2)');
        cmp.removeChip(cmp.chips[1]);
        expect(cmp.query).toEqual({ q: 'rehab', clinic: '', page: 1 });
        cmp.clearAll();
        expect(cmp.chips.length).toBe(0);
        expect(cmp.qInput).toBe('');
    });

    it('labels the result count', () => {
        expect(setup().cmp.countLabel).toBe('1 service');
        expect(setup({}, () => of({ success: true, data: { items: [service(1)], totalCount: 14 } })).cmp.countLabel).toBe('14 services');
        expect(setup({}, () => throwError(() => ({}))).cmp.countLabel).toBe('Results unavailable');
    });

    it('falls back to the last page when an old link points past the end', () => {
        const { navigations } = setup({ page: '9' }, req => of({ success: true, data: { items: req.pageNumber === 9 ? [] : [service(1)], totalCount: 20 } }));
        expect(navigations[0]).toEqual({ params: { q: null, clinic: null, page: 2 }, replaceUrl: true });
    });
});
