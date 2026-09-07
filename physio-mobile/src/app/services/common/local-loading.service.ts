/** Ported verbatim from physio-app/src/app/services/common/local-loading.service.ts — pure state, no desktop UI coupling. */
import { computed, Injectable, signal } from '@angular/core';

export interface LoadingState {
    [key: string]: boolean;
}

@Injectable({ providedIn: 'root' })
export class LocalLoadingService {
    private loadingStates = signal<LoadingState>({});
    public states$ = this.loadingStates.asReadonly();
    public isAnyLoading = computed(() => Object.values(this.loadingStates()).some(state => state));

    setLoading(key: string, state: boolean): void {
        this.loadingStates.update(states => ({ ...states, [key]: state }));
    }

    isLoading(key: string): boolean {
        return this.loadingStates()[key] || false;
    }

    getLoadingSignal(key: string) {
        return computed(() => this.loadingStates()[key] || false);
    }
}
