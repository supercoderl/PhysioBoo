import { AfterViewInit, Directive, ElementRef, inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { booPrefersReducedMotion } from '@physioboo/ui';

/**
 * Fades an <img> in once it has loaded (public site motion system). Images that are already complete (cache, SSR
 * markup loaded before hydration) are left alone, and the pending state is always cleared on load or error, so an
 * image can never stay invisible. The container keeps its aspect ratio, so nothing shifts.
 */
@Directive({
    selector: 'img[appImgFade]',
    standalone: true,
})
export class ImgFadeDirective implements AfterViewInit {
    private readonly el = inject<ElementRef<HTMLImageElement>>(ElementRef);
    private readonly zone = inject(NgZone);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    ngAfterViewInit(): void {
        const img = this.el.nativeElement;
        if (!this.isBrowser || img.complete || booPrefersReducedMotion()) return;
        img.classList.add('motion-img', 'motion-img-pending');
        this.zone.runOutsideAngular(() => {
            const done = () => img.classList.remove('motion-img-pending');
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
        });
    }
}
