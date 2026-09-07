/** Ported verbatim from physio-app/src/app/services/common/global-loading.service.ts — pure state, no desktop UI coupling. */
import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class GlobalLoadingService {
    private loadingSignal = signal<boolean>(false);
    public loading$ = this.loadingSignal.asReadonly();

    private requestCount = 0;
    private manualLoading = false;

    show(): void {
        this.requestCount++;
        this.updateLoadingState();
    }

    hide(): void {
        this.requestCount--;
        if (this.requestCount <= 0) this.requestCount = 0;
        this.updateLoadingState();
    }

    setLoading(state: boolean): void {
        this.manualLoading = state;
        this.updateLoadingState();
    }

    private updateLoadingState(): void {
        this.loadingSignal.set(this.manualLoading || this.requestCount > 0);
    }

    isLoading(): boolean {
        return this.loadingSignal();
    }

    forceSkipLoading = (): void => {
        this.manualLoading = false;
        this.requestCount = 0;
        this.updateLoadingState();
    };
}
