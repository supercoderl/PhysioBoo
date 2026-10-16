import { DestroyRef, ElementRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { PublicDoctorService } from '../../../../services/public/public-doctor.service';
import { PublicDoctorDetail } from '../../../../shared/types/public-doctor.types';
import { DoctorDetailComponent } from './doctor-detail.component';
import { EMPTY_REQUEST, validateRequest } from './request-form';

const ID = 'd1000000-0000-0000-0000-000000000001';
const F1 = { id: 'a1000000-0000-0000-0000-000000000001', name: 'Central Rehab Clinic', address: '1 Le Loi, HCMC', phone: '+84 28 1111 2222' };
const F2 = { id: 'a2000000-0000-0000-0000-000000000002', name: 'Northside Physio Centre', address: null, phone: null };

function detail(patch: Partial<PublicDoctorDetail> = {}): PublicDoctorDetail {
    return {
        id: ID, fullName: 'An Tran', avatarUrl: null, specialty: 'Neurological rehabilitation', isVerified: true,
        bio: 'Supports stroke recovery.', about: 'First paragraph.\n\nSecond paragraph.', researchInterests: 'Gait', achievements: null,
        yearsOfExperience: 7, languages: ['Vietnamese', 'English'], isAvailableOnline: true, isAvailableHomeVisit: true,
        services: ['Stroke rehabilitation', 'Gait training'], facilities: [F1, F2], ...patch,
    };
}

interface Setup {
    id?: string;
    fragment?: string | null;
    get?: () => Observable<any>;
    post?: (body: any) => Observable<any>;
}

function setup(o: Setup = {}) {
    const params$ = new BehaviorSubject(convertToParamMap({ id: o.id ?? ID }));
    const fragment$ = new BehaviorSubject<string | null>(o.fragment ?? null);
    const gets: string[] = [];
    const posts: any[] = [];
    const focused: string[] = [];
    let scrolled = 0;
    const titles: string[] = [];
    const service = {
        getById: (id: string) => { gets.push(id); return o.get ? o.get() : of({ success: true, data: detail() }); },
        getRelated: () => of({ success: true, data: [] }),
        requestAppointment: (_: string, body: any) => { posts.push(body); return o.post ? o.post(body) : of({ success: true, data: { reference: 'REQ-1234ABCD' } }); },
    };
    const host = {
        nativeElement: {
            querySelector: (sel: string) => {
                // Only fields the template would render: facility select only with several facilities, etc.
                const c = cmp as DoctorDetailComponent;
                const d = c.doctor;
                const exists = sel === '#rq-name' || sel === '#rq-phone' || sel === '#rq-email'
                    || (sel === '#rq-facility' && !!d && d.facilities.length > 1)
                    || (sel === '#rq-service' && !!d && d.services.length > 0);
                return exists ? { focus: () => focused.push(sel) } : null;
            }
        }
    };
    const injector = Injector.create({
        providers: [
            { provide: ActivatedRoute, useValue: { paramMap: params$, fragment: fragment$, snapshot: { fragment: o.fragment ?? null } } },
            { provide: PublicDoctorService, useValue: service },
            { provide: Title, useValue: { setTitle: (t: string) => titles.push(t) } },
            { provide: Meta, useValue: { updateTag: () => null, removeTag: () => { } } },
            { provide: ElementRef, useValue: host },
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp: DoctorDetailComponent = runInInjectionContext(injector, () => new DoctorDetailComponent());
    (cmp as any).requestCard = { nativeElement: { scrollIntoView: () => scrolled++ } };
    cmp.ngOnInit();
    return { cmp, gets, posts, focused, titles, scrolled: () => scrolled, params$ };
}

const wait = (ms = 0) => new Promise(r => setTimeout(r, ms));

describe('request form validation', () => {
    const f = (patch: Partial<typeof EMPTY_REQUEST>) => ({ ...EMPTY_REQUEST, name: 'Lan Pham', phone: '0901 234 567', ...patch });

    it('requires a facility only when there are several, and a service only when the doctor lists some', () => {
        expect(validateRequest({ facilities: [F1, F2], services: [] }, f({})).facility).toBe('Choose the facility you want to visit.');
        expect(validateRequest({ facilities: [F1, F2], services: [] }, f({ facility: 'not-one-of-them' })).facility).toBeDefined();
        expect(validateRequest({ facilities: [F1], services: [] }, f({})).facility).toBeUndefined();
        expect(validateRequest({ facilities: [], services: ['A'] }, f({})).service).toBe('Choose a service.');
        expect(validateRequest({ facilities: [], services: ['A'] }, f({ service: 'B' })).service).toBe('Choose a service.');
        expect(validateRequest({ facilities: [], services: [] }, f({}))).toEqual({});
    });

    it('checks name, phone and optional email like the server', () => {
        const none = { facilities: [], services: [] };
        expect(validateRequest(none, f({ name: ' A ' })).name).toBe('Enter your full name.');
        expect(validateRequest(none, f({ phone: '' })).phone).toBe('Enter a phone number so the clinic can call you back.');
        expect(validateRequest(none, f({ phone: '0901' })).phone).toBe('Enter a valid phone number, for example 0901 234 567.');
        expect(validateRequest(none, f({ phone: '0901-abc-567' })).phone).toBeDefined();
        expect(validateRequest(none, f({ phone: '+84 (90) 123-4567' })).phone).toBeUndefined();
        expect(validateRequest(none, f({ email: 'lan@' })).email).toBe('Enter a valid email, or leave this blank.');
        expect(validateRequest(none, f({ email: '  ' })).email).toBeUndefined();
        expect(validateRequest(none, f({ email: 'lan@example.com' })).email).toBeUndefined();
    });
});

describe('DoctorDetailComponent', () => {
    it('loads the profile, sets the page title and derives the view', () => {
        const { cmp, titles } = setup();
        expect(cmp.state).toBe('live');
        expect(titles.at(-1)).toBe('An Tran · Neurological rehabilitation · PhysioBoo');
        expect(cmp.aboutParagraphs).toEqual(['First paragraph.', 'Second paragraph.']);
        expect(cmp.facts.map(f => f.label)).toEqual(['7 years of experience', 'Vietnamese, English', 'Online consultation', 'Home visit']);
        expect(cmp.contactFacility?.name).toBe('Central Rehab Clinic');
        expect(cmp.tel('+84 28 1111 2222')).toBe('tel:+842811112222');
        expect(cmp.initials).toBe('AT');
    });

    it('hides experience for unverified doctors and sections without data', () => {
        const { cmp } = setup({ get: () => of({ success: true, data: detail({ isVerified: false, yearsOfExperience: 7, about: null, researchInterests: null, specialty: null, services: [], facilities: [], languages: [] }) }) });
        expect(cmp.facts.map(f => f.label)).toEqual(['Online consultation', 'Home visit']);
        expect(cmp.hasOverview).toBeFalse();
        expect(cmp.hasServices).toBeFalse();
        expect(cmp.contactFacility).toBeNull();
    });

    it('shows not found for a malformed id without calling the API, and for a 404', () => {
        const bad = setup({ id: 'not-a-guid' });
        expect(bad.cmp.state).toBe('notfound');
        expect(bad.gets.length).toBe(0);
        expect(setup({ get: () => throwError(() => ({ status: 404 })) }).cmp.state).toBe('notfound');
    });

    it('shows an error for other failures and recovers on retry', () => {
        let fail = true;
        const { cmp, gets } = setup({ get: () => fail ? throwError(() => ({ status: 503 })) : of({ success: true, data: detail() }) });
        expect(cmp.state).toBe('error');
        fail = false;
        cmp.retry();
        expect(cmp.state).toBe('live');
        expect(gets).toEqual([ID, ID]);
    });

    it('does not send an invalid form; it shows every error and focuses the first invalid field', () => {
        const { cmp, posts, focused } = setup();
        expect(cmp.errorFor('name')).toBe('');
        cmp.submit();
        expect(posts.length).toBe(0);
        expect(cmp.errorFor('facility')).toBe('Choose the facility you want to visit.');
        expect(cmp.errorFor('name')).toBe('Enter your full name.');
        expect(focused.at(-1)).toBe('#rq-facility');
    });

    it('shows a field error after the field is left', () => {
        const { cmp } = setup();
        cmp.form.phone = '0901';
        expect(cmp.errorFor('phone')).toBe('');
        cmp.touch('phone');
        expect(cmp.errorFor('phone')).toBe('Enter a valid phone number, for example 0901 234 567.');
    });

    it('sends a valid request with trimmed values and shows the reference', () => {
        const { cmp, posts } = setup();
        Object.assign(cmp.form, { facility: F2.id, service: 'Gait training', name: '  Lan Pham ', phone: ' 0901 234 567 ', email: ' ' });
        cmp.submit();
        expect(posts[0]).toEqual({ facilityId: F2.id, service: 'Gait training', fullName: 'Lan Pham', phone: '0901 234 567', email: null, website: '' });
        expect(cmp.submitState).toBe('success');
        expect(cmp.reference).toBe('REQ-1234ABCD');
        expect(cmp.successMessage).toBe('Northside Physio Centre will contact you on the phone number you gave to arrange a time with An Tran.');
    });

    it('fills in the only facility and omits service when there are none', () => {
        const { cmp, posts } = setup({ get: () => of({ success: true, data: detail({ facilities: [F1], services: [] }) }) });
        Object.assign(cmp.form, { name: 'Lan Pham', phone: '0901234567' });
        cmp.submit();
        expect(posts[0].facilityId).toBe(F1.id);
        expect(posts[0].service).toBeNull();
    });

    it('ignores a second submit while sending', () => {
        const pending = new Subject<any>();
        const { cmp, posts } = setup({ post: () => pending });
        Object.assign(cmp.form, { facility: F1.id, service: 'Gait training', name: 'Lan Pham', phone: '0901234567' });
        cmp.submit();
        cmp.submit();
        expect(cmp.submitState).toBe('submitting');
        expect(posts.length).toBe(1);
        pending.next({ success: true, data: { reference: 'REQ-X' } });
        expect(cmp.submitState).toBe('success');
    });

    it('keeps the details on failure, explains rate limits, and clears the message once the visitor edits', () => {
        let status = 500;
        const { cmp } = setup({ post: () => throwError(() => ({ status, error: { errors: ['Choose a service.'] } })) });
        Object.assign(cmp.form, { facility: F1.id, service: 'Gait training', name: 'Lan Pham', phone: '0901234567' });
        cmp.submit();
        expect(cmp.submitState).toBe('error');
        expect(cmp.submitError).toContain('Your details are still here');
        expect(cmp.form.name).toBe('Lan Pham');
        status = 429;
        cmp.submit();
        expect(cmp.submitError).toBe('Too many requests from this device. Please wait a few minutes before trying again.');
        status = 400;
        cmp.submit();
        expect(cmp.submitError).toBe('Choose a service.');
        cmp.onEdit();
        expect(cmp.submitError).toBe('');
        expect(cmp.submitState).toBe('idle');
    });

    it('opens on the request form when linked with #request', async () => {
        const { scrolled, focused } = setup({ fragment: 'request' });
        await wait();
        expect(scrolled()).toBeGreaterThan(0);
        expect(focused[0]).toBe('#rq-facility');
    });

    it('"Send another request" clears the form', async () => {
        const { cmp } = setup();
        Object.assign(cmp.form, { facility: F1.id, service: 'Gait training', name: 'Lan Pham', phone: '0901234567' });
        cmp.submit();
        cmp.sendAnother();
        expect(cmp.submitState).toBe('idle');
        expect(cmp.form).toEqual(EMPTY_REQUEST);
        expect(cmp.submitted).toBeFalse();
    });
});
