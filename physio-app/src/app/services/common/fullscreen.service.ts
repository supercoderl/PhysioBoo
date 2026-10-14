import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FullscreenService {
    private _isFullScreen = new BehaviorSubject<boolean>(false);
    isFullScreen$ = this._isFullScreen.asObservable();

    constructor() {
        if (typeof window !== 'undefined') {
            // Follow changing from fullscreen
            window.document.addEventListener('fullscreenchange', () => {
                this._isFullScreen.next(!!document.fullscreenElement);
            });

            // Listen key F11
            window.document.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'F11' && this.isSupported) {
                    e.preventDefault();
                    this.toggleFullScreen();
                }
            });
        }
    }

    toggleFullScreen() {
        if (!this.isSupported) return;
        const request = document.fullscreenElement
            ? document.exitFullscreen()
            : document.documentElement.requestFullscreen();
        // Browsers reject when the request is not allowed (e.g. inside a sandboxed iframe);
        // the state is driven by `fullscreenchange`, so there is nothing to undo.
        request?.catch(() => { });
    }

    /** False on SSR and in browsers or frames where the Fullscreen API is blocked. */
    get isSupported(): boolean {
        return typeof document !== 'undefined' && !!document.fullscreenEnabled;
    }

    get isFullScreen() {
        return this._isFullScreen.value;
    }
}
