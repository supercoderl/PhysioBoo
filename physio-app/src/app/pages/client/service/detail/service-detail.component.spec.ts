import { DestroyRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, DefaultUrlSerializer, Router, UrlTree, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PublicServiceService } from '../../../../services/public/public-service.service';
import { HospitalType } from '../../../../shared/enums/hospital-type';
import { PublicDoctor } from '../../../../shared/types/public-doctor.types';
import { PublicHospital } from '../../../../shared/types/public-hospital.types';
import { PublicServiceDetail } from '../../../../shared/types/public-service.types';
import { ServiceDetailComponent, splitParagraphs } from './service-detail.component';

const ID = 'b1000000-0000-0000-0000-000000000001';
const CLINIC_ID = 'a1000000-0000-0000-0000-000000000001';
const urls = new DefaultUrlSerializer();

const CLINIC: PublicHospital = {
    id: CLINIC_ID, name: 'Central Rehab Clinic', hospitalType: HospitalType.Rehabilitation, address: null, city: null,
    stateProvince: null, phone: null, description: null, imageUrl: null, is24Hours: false, languages: [],
};

function doctor(i: number): PublicDoctor {
    return {
        id: `d${i}`, fullName: `Doctor ${i}`, avatarUrl: null, specialty: null, facilities: [], bio: null,
        isVerified: false, yearsOfExperience: null, isAvailableOnline: false, isAvailableHomeVisit: false,
    };
}

function service(patch: Partial<PublicServiceDetail> = {}): PublicServiceDetail {
    return {
        id: ID, name: 'Stroke rehabilitation', coverImageUrl: null, clinic: CLINIC, doctors: [doctor(1), doctor(2)],
        description: 'Rebuild walking and balance after a stroke.\n\nSecond paragraph.\n\nThird paragraph.', ...patch,
    };
}

interface Setup {
    id?: string;
    previous?: string;
    get?: () => Observable<any>;
}

function setup(o: Setup = {}) {
    const params$ = new BehaviorSubject(convertToParamMap({ id: o.id ?? ID }));
    const gets: string[] = [];
    const titles: string[] = [];
    const tags: Record<string, string | null> = {};
    const router = {
        getCurrentNavigation: () => o.previous ? { previousNavigation: { finalUrl: urls.parse(o.previous) } } : null,
        createUrlTree: (commands: string[]) => urls.parse(commands.join('/')),
    };
    const injector = Injector.create({
        providers: [
            { provide: Router, useValue: router },
            { provide: ActivatedRoute, useValue: { paramMap: params$ } },
            { provide: PublicServiceService, useValue: { getById: (id: string) => { gets.push(id); return o.get ? o.get() : of({ success: true, data: service() }); } } },
            { provide: Title, useValue: { setTitle: (t: string) => titles.push(t) } },
            {
                provide: Meta, useValue: {
                    updateTag: (t: { name: string; content: string }) => { tags[t.name] = t.content; return null; },
                    removeTag: (sel: string) => { tags[sel.replace(/^name="|"$/g, '')] = null; },
                }
            },
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp = runInInjectionContext(injector, () => new ServiceDetailComponent());
    cmp.ngOnInit();
    return { cmp, gets, titles, tags };
}

const str = (t: UrlTree) => urls.serialize(t);

describe('ServiceDetailComponent (public service profile)', () => {
    it('loads the service, splits the description into summary and overview, and sets the head tags', () => {
        const { cmp, titles, tags } = setup();
        expect(cmp.state).toBe('live');
        expect(cmp.summary).toBe('Rebuild walking and balance after a stroke.');
        expect(cmp.paragraphs).toEqual(['Second paragraph.', 'Third paragraph.']);
        expect(titles.at(-1)).toBe('Stroke rehabilitation · PhysioBoo');
        expect(tags['description']).toBe('Rebuild walking and balance after a stroke. Second paragraph. Third paragraph.');
        expect(tags['robots']).toBeNull();
    });

    it('caps the meta description and falls back to a generic line', () => {
        const long = setup({ get: () => of({ success: true, data: service({ description: 'x'.repeat(400) }) }) });
        expect(long.tags['description']!.length).toBe(155);
        const none = setup({ get: () => of({ success: true, data: service({ description: null }) }) });
        expect(none.tags['description']).toBe('Stroke rehabilitation at Central Rehab Clinic. Find a doctor who offers it and request an appointment.');
        expect(none.cmp.summary).toBeNull();
        expect(none.cmp.paragraphs).toEqual([]);
    });

    it('with one doctor, requests go straight to their form with the service and clinic preselected', () => {
        const { cmp } = setup({ get: () => of({ success: true, data: service({ doctors: [doctor(7)] }) }) });
        expect(cmp.onlyDoctor?.id).toBe('d7');
        expect(cmp.requestParams).toEqual({ service: ID, facility: CLINIC_ID });
        expect(cmp.requestNote).toBe('Your request goes to Doctor 7. The clinic contacts you to agree a time.');
        expect(cmp.doctorsTitle).toBe('Doctor for this service');
    });

    it('with several doctors, points to the list instead of picking one', () => {
        const { cmp } = setup();
        expect(cmp.onlyDoctor).toBeNull();
        expect(cmp.doctorsTitle).toBe('Choose a doctor');
        expect(cmp.requestNote).toBe('Choose one of 2 doctors who offer this service. The clinic contacts you to agree a time.');
        cmp.chooseDoctor();
        expect(cmp.flashDoctors).toBeTrue();
    });

    it('with no doctor, there is nothing to request and no clinic preselected when there is no clinic', () => {
        const { cmp } = setup({ get: () => of({ success: true, data: service({ clinic: null, doctors: [] }) }) });
        expect(cmp.onlyDoctor).toBeNull();
        expect(cmp.requestNote).toBe('Online requests need a doctor who offers this service.');
        expect(cmp.requestParams).toEqual({ service: ID });
        expect(cmp.doctorsNote).toBe('Publicly listed doctors linked to this service');
    });

    it('shows not found (noindex) for a malformed id without calling the API, and for a 404', () => {
        const bad = setup({ id: 'not-a-guid' });
        expect(bad.cmp.state).toBe('notfound');
        expect(bad.gets).toEqual([]);
        expect(bad.tags['robots']).toBe('noindex');
        expect(bad.titles.at(-1)).toBe('Service not found · PhysioBoo');
        expect(setup({ get: () => throwError(() => ({ status: 404 })) }).cmp.state).toBe('notfound');
        expect(setup({ get: () => of({ success: false, data: null }) }).cmp.state).toBe('notfound');
    });

    it('shows an error for other failures and recovers on retry', () => {
        let fail = true;
        const { cmp, gets } = setup({ get: () => fail ? throwError(() => ({ status: 0 })) : of({ success: true, data: service() }) });
        expect(cmp.state).toBe('error');
        fail = false;
        cmp.retry();
        expect(cmp.state).toBe('live');
        expect(gets).toEqual([ID, ID]);
    });

    it('goes back to the listing with its search and filters when it came from there', () => {
        expect(str(setup({ previous: '/services?q=stroke&page=2' }).cmp.backLink)).toBe('/services?q=stroke&page=2');
        expect(str(setup({ previous: '/hospitals' }).cmp.backLink)).toBe('/services');
        expect(str(setup().cmp.backLink)).toBe('/services');
        expect(setup({ previous: '/services?q=stroke&page=2' }).cmp.backQuery).toEqual({ q: 'stroke', page: '2' });
    });

    it('splits paragraphs on blank lines only', () => {
        expect(splitParagraphs('a\nb\n\n  \n c ')).toEqual(['a\nb', 'c']);
        expect(splitParagraphs('a\r\n\r\nb')).toEqual(['a', 'b']);
        expect(splitParagraphs(null)).toEqual([]);
    });
});
