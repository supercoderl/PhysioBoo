import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import AOS from 'aos';

@Injectable({
    providedIn: 'root'
})
export class AOSService {
    private isInitialized = false;
    private initPromise: Promise<void> | null = null;

    constructor(
        private ngZone: NgZone,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    async initialize(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return;

        // If already initialized, just refresh and return
        if (this.isInitialized) {
            this.refresh();
            return Promise.resolve();
        }

        // Prevent multiple initializations
        if (this.initPromise) return this.initPromise;

        this.initPromise = new Promise<void>((resolve) => {
            this.ngZone.runOutsideAngular(() => {
                // Wait for DOM to be ready
                this.waitForDOM(() => {
                    AOS.init({
                        duration: 1000,
                        once: true,
                        offset: 50,
                        easing: 'ease-out',
                        disable: false,
                        startEvent: 'DOMContentLoaded',
                        initClassName: 'aos-init',
                        animatedClassName: 'aos-animate',
                        useClassNames: false,
                        disableMutationObserver: false,
                        debounceDelay: 50,
                        throttleDelay: 99,
                    });

                    this.isInitialized = true;

                    // Force refresh after initialization
                    setTimeout(() => {
                        this.refresh();
                        resolve();
                    }, 150);
                });
            });
        });

        return this.initPromise;
    }

    refresh(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        this.ngZone.runOutsideAngular(() => {
            if (this.isInitialized && typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        });
    }

    // Force refresh for lazy-loaded content
    forceRefresh(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        this.ngZone.runOutsideAngular(() => {
            if (typeof AOS !== 'undefined') {
                // Use refreshHard for lazy-loaded content
                AOS.refreshHard();
            }
        });
    }

    reset(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        this.ngZone.runOutsideAngular(() => {
            if (typeof AOS !== 'undefined') {
                AOS.refreshHard();
            }
            this.isInitialized = false;
            this.initPromise = null;
        });
    }

    private waitForDOM(callback: () => void): void {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(callback, 0);
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }
}