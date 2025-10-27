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
                if (e.key === 'F11') {
                    e.preventDefault();
                    this.toggleFullScreen();
                }
            });
        }
    }

    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    get isFullScreen() {
        return this._isFullScreen.value;
    }
}
