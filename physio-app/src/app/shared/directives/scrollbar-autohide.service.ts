import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';

/** Must stay in step with `$scroll-hosts` in styles.scss. */
const SCROLL_HOST_SELECTOR =
    '.boo-scrollbar, [data-scrollbar-overlay], #admin-layout .overflow-x-auto, #admin-layout .overflow-y-auto, #admin-layout .overflow-auto';

const ACTIVE_ATTR = 'data-scrollbar-active';
const IDLE_DELAY_MS = 1200;
const POINTER_THROTTLE_MS = 100;
const SCROLLBAR_TRACK_SELECTOR = '[data-scrollbar-track]';

/**
 * Shows a scroll container's scrollbar only while it is in use (docs/admin-layout-contract.md).
 * One set of delegated listeners marks the scroll hosts with `data-scrollbar-active`; styles.scss fades the thumb in and out.
 * The native scrollbar keeps its gutter and hit area while idle, so nothing shifts and it can still be grabbed.
 */
@Injectable({ providedIn: 'root' })
export class ScrollbarAutoHideService implements OnDestroy {
    private readonly isBrowser: boolean;
    private readonly timers = new Map<Element, number>();
    private attached = false;
    private dragging = false;
    private hovered: Element[] = [];
    private hoverTarget: EventTarget | null = null;
    private lastPointerAt = 0;

    constructor(private zone: NgZone, @Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    /** Idempotent: the listeners are registered once, however many layouts ask for them. */
    attach() {
        if (!this.isBrowser || this.attached) return;
        this.attached = true;
        this.zone.runOutsideAngular(() => {
            // `scroll` does not bubble, so it is caught in the capture phase.
            document.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
            document.addEventListener('pointermove', this.onPointerMove, { passive: true });
            document.addEventListener('pointerdown', this.onPointerDown, { passive: true });
            document.addEventListener('focusin', this.onFocusIn, { passive: true });
            window.addEventListener('pointerup', this.onPointerEnd, { passive: true });
            window.addEventListener('pointercancel', this.onPointerEnd, { passive: true });
            window.addEventListener('mouseup', this.onPointerEnd, { passive: true });
            window.addEventListener('blur', this.onPointerEnd);
        });
    }

    detach() {
        if (!this.attached) return;
        this.attached = false;
        document.removeEventListener('scroll', this.onScroll, { capture: true });
        document.removeEventListener('pointermove', this.onPointerMove);
        document.removeEventListener('pointerdown', this.onPointerDown);
        document.removeEventListener('focusin', this.onFocusIn);
        window.removeEventListener('pointerup', this.onPointerEnd);
        window.removeEventListener('pointercancel', this.onPointerEnd);
        window.removeEventListener('mouseup', this.onPointerEnd);
        window.removeEventListener('blur', this.onPointerEnd);
        this.timers.forEach((id, el) => {
            window.clearTimeout(id);
            el.removeAttribute(ACTIVE_ATTR);
        });
        this.timers.clear();
        this.hovered = [];
        this.hoverTarget = null;
        this.dragging = false;
    }

    ngOnDestroy() {
        this.detach();
    }

    private onScroll = (e: Event) => {
        const target = e.target;
        if (target instanceof Element && target.matches(SCROLL_HOST_SELECTOR)) this.reveal(target);
    };

    private onPointerMove = (e: PointerEvent) => {
        const now = e.timeStamp;
        // The hosts only change when the pointer moves onto another element; otherwise just keep the timer fresh.
        if (e.target !== this.hoverTarget) {
            this.hoverTarget = e.target;
            this.hovered = this.hostsOf(e.target);
        } else if (now - this.lastPointerAt < POINTER_THROTTLE_MS) {
            return;
        }
        this.lastPointerAt = now;
        this.hovered.forEach(el => this.reveal(el));
    };

    private onPointerDown = (e: PointerEvent) => {
        const hosts = this.hostsOf(e.target);
        hosts.forEach(el => this.reveal(el));
        // A press that lands on the scrollbar (native gutter or the overlay thumb) starts a drag that may pause without scrolling.
        if (this.isScrollbarHit(e, hosts) || (e.target instanceof Element && e.target.closest(SCROLLBAR_TRACK_SELECTOR))) {
            this.dragging = true;
        }
    };

    private onPointerEnd = () => {
        if (!this.dragging) return;
        this.dragging = false;
        // Hand the bars back to the idle timer.
        this.timers.forEach((_, el) => this.reveal(el));
    };

    private onFocusIn = (e: FocusEvent) => {
        this.hostsOf(e.target).forEach(el => this.reveal(el));
    };

    private hostsOf(target: EventTarget | null): Element[] {
        const hosts: Element[] = [];
        let node = target instanceof Element ? target : null;
        while (node) {
            const host = node.closest(SCROLL_HOST_SELECTOR);
            if (!host) break;
            hosts.push(host);
            node = host.parentElement;
        }
        return hosts;
    }

    /** A pointer press on a host's own scrollbar lands outside its client box (padding box minus bars). */
    private isScrollbarHit(e: PointerEvent, hosts: Element[]): boolean {
        const host = hosts[0];
        if (!host || e.target !== host) return false;
        const rect = host.getBoundingClientRect();
        const x = e.clientX - rect.left - host.clientLeft;
        const y = e.clientY - rect.top - host.clientTop;
        return x > host.clientWidth || y > host.clientHeight;
    }

    private reveal(el: Element) {
        const pending = this.timers.get(el);
        if (pending !== undefined) window.clearTimeout(pending);
        el.setAttribute(ACTIVE_ATTR, '');
        if (this.dragging) {
            // Never hide mid-drag; the timer restarts when the pointer is released.
            this.timers.set(el, 0);
            return;
        }
        const id = window.setTimeout(() => this.hide(el), IDLE_DELAY_MS);
        this.timers.set(el, id);
    }

    private hide(el: Element) {
        if (this.dragging) {
            this.timers.set(el, window.setTimeout(() => this.hide(el), IDLE_DELAY_MS));
            return;
        }
        this.timers.delete(el);
        el.removeAttribute(ACTIVE_ATTR);
    }
}
