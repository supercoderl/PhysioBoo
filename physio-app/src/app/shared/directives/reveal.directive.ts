import { AfterViewInit, Directive, ElementRef, inject, Input, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { booPrefersReducedMotion } from '@physioboo/ui';

const STAGGER_MS = 60;
const STAGGER_MAX = 6;

/**
 * Fade-and-rise when a block first scrolls into view (public site motion system).
 * Progressive enhancement: the server-rendered element is visible, and the hidden state is only applied here, after
 * hydration, to blocks that start below the fold. With `appRevealStagger` the direct children enter 60 ms apart
 * (the first six; the rest enter together). Reveals once, never repeats.
 */
@Directive({
    selector: '[appReveal]',
    standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
    /** Reveal the direct children one after another instead of the element as a whole. */
    @Input() appRevealStagger: boolean | '' = false;

    private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly zone = inject(NgZone);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private observer?: IntersectionObserver;
    private targets: HTMLElement[] = [];
    private cleanupTimer?: number;

    ngAfterViewInit(): void {
        if (!this.isBrowser || typeof IntersectionObserver === 'undefined' || booPrefersReducedMotion()) return;
        const host = this.el.nativeElement;
        // Already on screen (or above it, e.g. after a reload mid-page): nothing to animate.
        if (host.getBoundingClientRect().top < window.innerHeight * 0.92) return;

        const stagger = this.appRevealStagger !== false;
        this.targets = stagger ? Array.from(host.children) as HTMLElement[] : [host];
        if (!this.targets.length) return;

        this.targets.forEach((t, i) => {
            t.classList.add('motion-pre', 'motion-reveal');
            if (stagger) t.style.transitionDelay = `${Math.min(i, STAGGER_MAX - 1) * STAGGER_MS}ms`;
        });

        this.zone.runOutsideAngular(() => {
            this.observer = new IntersectionObserver(entries => {
                if (entries.some(e => e.isIntersecting)) this.reveal();
            }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
            this.observer.observe(host);
        });
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
        if (this.cleanupTimer) window.clearTimeout(this.cleanupTimer);
    }

    private reveal(): void {
        this.observer?.disconnect();
        this.targets.forEach(t => t.classList.remove('motion-pre'));
        // Drop the helper classes and delays afterwards so they never slow later hover transitions.
        this.cleanupTimer = window.setTimeout(() => this.targets.forEach(t => {
            t.classList.remove('motion-reveal');
            t.style.transitionDelay = '';
        }), 400 + STAGGER_MS * STAGGER_MAX + 100);
    }
}
