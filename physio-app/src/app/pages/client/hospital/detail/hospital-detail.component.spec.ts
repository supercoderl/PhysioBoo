import { DestroyRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, DefaultUrlSerializer, Router, UrlTree, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PublicDoctorService } from '../../../../services/public/public-doctor.service';
import { PublicHospitalService } from '../../../../services/public/public-hospital.service';
import { HospitalType } from '../../../../shared/enums/hospital-type';
import { PublicDoctor } from '../../../../shared/types/public-doctor.types';
import { PublicHospitalDetail } from '../../../../shared/types/public-hospital.types';
import { HospitalDetailComponent } from './hospital-detail.component';

const ID = 'a1000000-0000-0000-0000-000000000001';
const urls = new DefaultUrlSerializer();

function clinic(patch: Partial<PublicHospitalDetail> = {}): PublicHospitalDetail {
    return {
        id: ID, name: 'Central Rehab Clinic', hospitalType: HospitalType.Rehabilitation, address: '1 Le Loi', city: 'District 1',
        stateProvince: 'HCMC', phone: '+84 28 1111 2222', email: 'hello@clinic.example', website: 'https://clinic.example/',
        description: 'Outpatient physiotherapy.', logoUrl: null, imageUrl: null, is24Hours: false, languages: ['Vietnamese', 'English'],
        services: ['Stroke rehabilitation'], ...patch,
    };
}

function doctor(i: number): PublicDoctor {
    return {
        id: `d${i}`, fullName: `Doctor ${i}`, avatarUrl: null, specialty: null, facilities: [], bio: null,
        isVerified: false, yearsOfExperience: null, isAvailableOnline: false, isAvailableHomeVisit: false,
    };
}

interface Setup {
    id?: string;
    previous?: string;
    get?: () => Observable<any>;
    doctors?: () => Observable<any>;
}

function setup(o: Setup = {}) {
    const params$ = new BehaviorSubject(convertToParamMap({ id: o.id ?? ID }));
    const gets: string[] = [];
    const searches: any[] = [];
    const titles: string[] = [];
    const router = {
        getCurrentNavigation: () => o.previous ? { previousNavigation: { finalUrl: urls.parse(o.previous) } } : null,
        createUrlTree: (commands: string[]) => urls.parse(commands.join('/')),
    };
    const injector = Injector.create({
        providers: [
            { provide: Router, useValue: router },
            { provide: ActivatedRoute, useValue: { paramMap: params$ } },
            { provide: PublicHospitalService, useValue: { getById: (id: string) => { gets.push(id); return o.get ? o.get() : of({ success: true, data: clinic() }); } } },
            {
                provide: PublicDoctorService, useValue: {
                    search: (req: any) => { searches.push(req); return o.doctors ? o.doctors() : of({ success: true, data: { items: [doctor(1), doctor(2)], totalCount: 5 } }); }
                }
            },
            { provide: Title, useValue: { setTitle: (t: string) => titles.push(t) } },
            { provide: Meta, useValue: { updateTag: () => null, removeTag: () => { } } },
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp = runInInjectionContext(injector, () => new HospitalDetailComponent());
    cmp.ngOnInit();
    return { cmp, gets, searches, titles };
}

const str = (t: UrlTree) => urls.serialize(t);

describe('HospitalDetailComponent (public clinic profile)', () => {
    it('loads the clinic, sets the page title and derives the view', () => {
        const { cmp, titles } = setup();
        expect(cmp.state).toBe('live');
        expect(cmp.typeLabel).toBe('Rehabilitation center');
        expect(cmp.addressLine).toBe('1 Le Loi, District 1, HCMC');
        expect(titles.at(-1)).toBe('Central Rehab Clinic · Rehabilitation center · PhysioBoo');
        expect(cmp.infoRows.map(r => r.label)).toEqual(['Address', 'Phone', 'Email', 'Website', 'Facility type', 'Languages']);
        expect(cmp.infoRows.find(r => r.label === 'Website')!.value).toBe('clinic.example');
        expect(cmp.infoRows.find(r => r.label === 'Phone')!.href).toBe('tel:+842811112222');
    });

    it('lists doctors through the public doctor search, limited to this clinic', () => {
        const { cmp, searches } = setup();
        expect(searches).toEqual([{ pageNumber: 1, pageSize: 4, filter: { hospitalId: ID } }]);
        expect(cmp.doctors.length).toBe(2);
        expect(cmp.doctorNote).toBe('Showing 2 of 5 doctors with a current schedule here');
    });

    it('hides the doctor section when the search fails or finds nobody', () => {
        expect(setup({ doctors: () => throwError(() => ({ status: 500 })) }).cmp.doctors).toEqual([]);
        const { cmp } = setup({ doctors: () => of({ success: true, data: { items: [doctor(1)], totalCount: 1 } }) });
        expect(cmp.doctorNote).toBe('Doctors with a current schedule at this clinic');
    });

    it('shows only the rows a sparse record has', () => {
        const { cmp } = setup({
            get: () => of({ success: true, data: clinic({ address: null, phone: null, email: null, website: null, description: null, languages: [], services: [], is24Hours: true }) })
        });
        expect(cmp.state).toBe('live');
        expect(cmp.infoRows.map(r => r.label)).toEqual(['Address', 'Facility type', 'Hours']);
        expect(cmp.addressLine).toBe('District 1, HCMC');
    });

    it('shows not found for a malformed id without calling the API, and for a 404', () => {
        const bad = setup({ id: 'not-a-guid' });
        expect(bad.cmp.state).toBe('notfound');
        expect(bad.gets).toEqual([]);
        expect(setup({ get: () => throwError(() => ({ status: 404 })) }).cmp.state).toBe('notfound');
        expect(setup({ get: () => of({ success: false, data: null }) }).cmp.state).toBe('notfound');
    });

    it('shows an error for other failures and recovers on retry', () => {
        let fail = true;
        const { cmp, gets } = setup({ get: () => fail ? throwError(() => ({ status: 0 })) : of({ success: true, data: clinic() }) });
        expect(cmp.state).toBe('error');
        fail = false;
        cmp.retry();
        expect(cmp.state).toBe('live');
        expect(gets).toEqual([ID, ID]);
    });

    it('goes back to the listing with its search and filters when it came from there', () => {
        expect(str(setup({ previous: '/hospitals?q=rehab&type=6&page=2' }).cmp.backLink)).toBe('/hospitals?q=rehab&type=6&page=2');
        expect(str(setup({ previous: '/doctor?facility=x' }).cmp.backLink)).toBe('/hospitals');
        expect(str(setup().cmp.backLink)).toBe('/hospitals');
    });
});
