import { DestroyRef, ElementRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { PublicContactService } from '../../../services/public/public-contact.service';
import { PublicHospitalService } from '../../../services/public/public-hospital.service';
import { CLIENT_TENANT } from '../../../shared/data/client-site';
import { HospitalType } from '../../../shared/enums/hospital-type';
import { PublicHospital } from '../../../shared/types/public-hospital.types';
import { ContactComponent, buildInfoCards, telHref } from './contact.component';

function hospital(i: number): PublicHospital {
    return {
        id: `h${i}`, name: `Clinic ${i}`, hospitalType: HospitalType.Clinic, address: null, city: null, stateProvince: null,
        phone: null, description: null, imageUrl: null, is24Hours: false, languages: [],
    };
}

const FILLED = { name: 'Lan Pham', phone: '0901 234 567', email: '', topic: 'service', clinic: 'h2', message: 'Is shoulder rehab available?', consent: true, website: '' };

function setup(
    send: (req: any) => Observable<any> = () => of({ success: true, data: { reference: 'MSG-1A2B3C4D' } }),
    clinics: () => Observable<any> = () => of({ success: true, data: { items: [1, 2, 3, 4].map(hospital), totalCount: 4 } }),
) {
    const sent: any[] = [];
    const host = document.createElement('div');
    const injector = Injector.create({
        providers: [
            { provide: PublicContactService, useValue: { send: (req: any) => { sent.push(req); return send(req); } } },
            { provide: PublicHospitalService, useValue: { search: clinics } },
            { provide: ElementRef, useValue: new ElementRef(host) },
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp = runInInjectionContext(injector, () => new ContactComponent());
    cmp.ngOnInit();
    return { cmp, sent };
}

describe('ContactComponent (public contact page)', () => {
    it('does not send an empty form and lists every problem', () => {
        const { cmp, sent } = setup();
        cmp.submit();
        expect(sent.length).toBe(0);
        expect(cmp.summary.map(s => s.field)).toEqual(['name', 'phone', 'message', 'consent']);
        expect(cmp.summaryTitle).toBe('There are 4 problems with your message');
    });

    it('shows a field error only after it is left or the form is submitted', () => {
        const { cmp } = setup();
        cmp.form.phone = '0901';
        expect(cmp.errorFor('phone')).toBe('');
        cmp.touch('phone');
        expect(cmp.errorFor('phone')).toBe('Enter a valid phone number, for example 0901 234 567.');
    });

    it('sends trimmed values, empty optionals as null, and shows the reference', () => {
        const { cmp, sent } = setup();
        cmp.form = { ...FILLED, name: '  Lan Pham ' };
        cmp.submit();
        expect(sent[0]).toEqual({
            fullName: 'Lan Pham', phone: '0901 234 567', email: null, topic: 'service', clinicId: 'h2',
            message: 'Is shoulder rehab available?', consent: true, website: '',
        });
        expect(cmp.submitState).toBe('success');
        expect(cmp.reference).toBe('MSG-1A2B3C4D');
    });

    it('marks the field the server rejected and clears it once edited', () => {
        const { cmp } = setup(() => throwError(() => ({ status: 400, error: { errors: ['Choose a clinic from the list, or leave it as No preference.'] } })));
        cmp.form = { ...FILLED };
        cmp.submit();
        expect(cmp.failKind).toBe('server');
        expect(cmp.errorFor('clinic')).toBe('Choose a clinic from the list, or leave it as No preference.');
        expect(cmp.summary).toEqual([]);
        cmp.onEdit('clinic');
        expect(cmp.errorFor('clinic')).toBe('');
        expect(cmp.banner).toBeNull();
    });

    it('keeps the details on rate limit, network failure and when the service is unavailable', () => {
        for (const [status, kind] of [[429, 'ratelimit'], [0, 'network'], [503, 'unavailable']] as const) {
            const { cmp } = setup(() => throwError(() => ({ status })));
            cmp.form = { ...FILLED };
            cmp.submit();
            expect(cmp.failKind).toBe(kind);
            expect(cmp.form.message).toBe(FILLED.message);
        }
    });

    it('locks the form while sending and when the service is unavailable', () => {
        const { cmp, sent } = setup(() => new Observable());
        cmp.form = { ...FILLED };
        cmp.submit();
        cmp.submit();
        expect(sent.length).toBe(1);
        expect(cmp.submitLabel).toBe('Sending message…');
        expect(cmp.submitDisabled).toBeTrue();

        const down = setup(() => throwError(() => ({ status: 503 })));
        down.cmp.form = { ...FILLED };
        down.cmp.submit();
        down.cmp.submit();
        expect(down.sent.length).toBe(1);
    });

    it('shows three clinic cards with a link to all, and hides the select when there are none', () => {
        const { cmp } = setup();
        expect(cmp.clinicCards.length).toBe(3);
        expect(cmp.clinicTotal).toBe(4);
        expect(cmp.clinics.length).toBe(4);

        const none = setup(undefined, () => of({ success: true, data: { items: [], totalCount: 0 } })).cmp;
        expect(none.clinicState).toBe('live');
        expect(none.clinics.length).toBe(0);

        expect(setup(undefined, () => throwError(() => ({ status: 500 }))).cmp.clinicState).toBe('error');
    });

    it('hides contact cards and actions whose settings are missing', () => {
        const full = buildInfoCards({
            ...CLIENT_TENANT, phone: '(028) 3812 4500', email: 'contact@example.com', address: '120 Nguyen Hue', mapUrl: 'https://maps.example/x',
            hoursShort: 'Mon–Fri, 08:00–18:00', hours: [{ days: 'Monday – Friday', time: '08:00 – 18:00' }],
        });
        expect(full.map(c => c.title)).toEqual(['Call us', 'Email us', 'Visit us', 'Opening hours']);
        expect(full[0].action?.href).toBe('tel:02838124500');

        const partial = buildInfoCards({ ...CLIENT_TENANT, phone: '(028) 3812 4500', email: null, address: '120 Nguyen Hue', mapUrl: null, hours: null });
        expect(partial.map(c => c.title)).toEqual(['Call us', 'Visit us']);
        expect(partial[1].action).toBeUndefined();

        // Unfilled placeholders never become tel:/mailto: links.
        expect(telHref('[Contact phone]')).toBeNull();
        expect(buildInfoCards({ ...CLIENT_TENANT, email: '[Contact email]' }).find(c => c.title === 'Email us')?.action).toBeUndefined();
    });
});
