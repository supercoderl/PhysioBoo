import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CONFIG_CACHE_KEY } from '../../shared/data/cache';
import { AppConfig } from '../../shared/types/common';
import { Language } from '../../shared/types/sys-language.types';
import { LocalStorage } from '../../shared/utils/storage';
import { PreferenceService } from './preference.service';

const KEY = 'locale.language';

/**
 * The user's display language: the active languages come from the app config (loaded at startup),
 * the choice is saved as a user preference.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
    private prefSrv = inject(PreferenceService);

    readonly languages = signal<Language[]>(this.loadLanguages());

    /** The saved language when it is still offered, otherwise the configured default. */
    readonly current = computed<Language | null>(() => {
        const list = this.languages();
        const saved = this.prefSrv.get<string | null>(KEY, null);
        return list.find(l => l.code === saved)
            ?? list.find(l => l.isDefault)
            ?? list[0]
            ?? null;
    });

    select(code: string): Observable<unknown> {
        return this.prefSrv.set(KEY, code, 'locale');
    }

    private loadLanguages(): Language[] {
        const config = LocalStorage.load<AppConfig>(CONFIG_CACHE_KEY);
        return (config?.languages ?? [])
            .filter(l => l.isActive)
            .sort((a, b) => a.index - b.index);
    }
}
