import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BASE_API } from '../../shared/api/base';
import { SKIP_ERROR_TOAST } from '../../shared/contexts/option.context';
import { CONFIG_CACHE_KEY } from '../../shared/data/cache';
import { AuthService } from '../auth/auth.service';
import { InitService } from './init.service';

describe('InitService', () => {
    function setup(signedIn: boolean) {
        localStorage.removeItem(CONFIG_CACHE_KEY);
        const isAuthenticated = signal(false);
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                {
                    provide: AuthService, useValue: {
                        isAuthenticated,
                        checkSession: () => { isAuthenticated.set(signedIn); return Promise.resolve(); },
                    }
                },
            ],
        });
        return { init: TestBed.inject(InitService), http: TestBed.inject(HttpTestingController) };
    }

    afterEach(() => localStorage.removeItem(CONFIG_CACHE_KEY));

    it('does not request the permission-protected config for an anonymous visitor', async () => {
        const { init, http } = setup(false);
        const done = init.load();
        http.expectOne(BASE_API.VERSION).flush({ success: true, data: '2' });
        await done;
        http.expectNone(BASE_API.CONFIG);
        expect(init.getConfig()?.version).toBe('1.0.0');
        http.verify();
    });

    it('requests the config for a signed-in user without a global error toast', async () => {
        const { init, http } = setup(true);
        const done = init.load();
        http.expectOne(BASE_API.VERSION).flush({ success: true, data: '2' });
        await new Promise(r => setTimeout(r));
        const req = http.expectOne(BASE_API.CONFIG);
        expect(req.request.context.get(SKIP_ERROR_TOAST)).toBeTrue();
        req.flush({ success: true, data: { version: '2', features: {}, registrationRoles: [], languages: [] } });
        await done;
        expect(init.getConfig()?.version).toBe('2');
        http.verify();
    });

    it('falls back to the default config when a signed-in user may not read it', async () => {
        const { init, http } = setup(true);
        const done = init.load();
        http.expectOne(BASE_API.VERSION).flush({ success: true, data: '2' });
        await new Promise(r => setTimeout(r));
        http.expectOne(BASE_API.CONFIG).flush({ success: false }, { status: 403, statusText: 'Forbidden' });
        await done;
        expect(init.getConfig()?.version).toBe('1.0.0');
    });
});
