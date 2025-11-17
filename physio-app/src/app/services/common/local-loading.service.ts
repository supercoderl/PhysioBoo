import { computed, Injectable, signal } from '@angular/core';

export interface LoadingState {
    [key: string]: boolean;
}

@Injectable({ providedIn: 'root' })
export class LocalLoadingService {
    private loadingStates = signal<LoadingState>({});

    // Get all loading states
    public states$ = this.loadingStates.asReadonly();

    // Check if any loading is active
    public isAnyLoading = computed(() =>
        Object.values(this.loadingStates()).some(state => state)
    );

    // Set loading for specific key
    setLoading(key: string, state: boolean): void {
        this.loadingStates.update(states => ({
            ...states,
            [key]: state
        }));
    }

    // Get loading state for specific key
    isLoading(key: string): boolean {
        return this.loadingStates()[key] || false;
    }

    // Clear specific loading
    clear(key: string): void {
        this.loadingStates.update(states => {
            const newStates = { ...states };
            delete newStates[key];
            return newStates;
        });
    }

    // Clear all loading states
    clearAll(): void {
        this.loadingStates.set({});
    }

    // Get signal for specific key (for template binding)
    getLoadingSignal(key: string) {
        return computed(() => this.loadingStates()[key] || false);
    }
}