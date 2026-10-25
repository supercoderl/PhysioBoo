import { isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostListener,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    PLATFORM_ID,
    Renderer2
} from '@angular/core';
import { ScrollbarAutoHideService } from './scrollbar-autohide.service';

@Directive({
    selector: '[custom-scrollbar]',
    standalone: true
})
export class CustomScrollbarDirective implements AfterViewInit, OnDestroy {
    /** Keep the thumb visible while the content overflows, instead of only on hover. */
    @Input() alwaysVisible = false;

    private thumb!: HTMLElement;
    private track!: HTMLElement;
    private trackWrapper!: HTMLElement;

    private thumbHeight = 0;
    private thumbTop = 0;

    private dragging = false;
    private dragStartY = 0;
    private scrollStartTop = 0;

    private observer!: ResizeObserver;
    private mutationObserver!: MutationObserver;
    private frameId = 0;
    private isBrowser: boolean;

    constructor(
        private el: ElementRef<HTMLElement>,
        private renderer: Renderer2,
        private zone: NgZone,
        private autoHide: ScrollbarAutoHideService,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngAfterViewInit() {
        if (!this.isBrowser) return;

        const container = this.el.nativeElement;
        if (!container) return;

        // Engines without ::-webkit-scrollbar (Firefox) cannot hide one axis only, so they keep the native thin bars on both axes.
        if (!CSS.supports('selector(::-webkit-scrollbar)')) {
            this.renderer.addClass(container, 'boo-scrollbar');
            container.style.overflowY = 'auto';
            return;
        }

        // The native vertical bar is replaced by the overlay below. The native horizontal bar stays (styled in styles.scss),
        // so it keeps its own gutter and never covers the last row or the pagination.
        this.renderer.setAttribute(container, 'data-scrollbar-overlay', '');

        container.style.position = 'relative';
        container.style.overflowY = 'auto';

        // Wrapper for track (stays fixed in viewport)
        this.trackWrapper = this.renderer.createElement('div');
        this.renderer.setStyle(this.trackWrapper, 'position', 'sticky');
        this.renderer.setStyle(this.trackWrapper, 'top', '0');
        this.renderer.setStyle(this.trackWrapper, 'right', '0');
        this.renderer.setStyle(this.trackWrapper, 'width', '0');
        this.renderer.setStyle(this.trackWrapper, 'height', '0');
        this.renderer.setStyle(this.trackWrapper, 'pointer-events', 'none');
        this.renderer.setStyle(this.trackWrapper, 'z-index', '9999');

        // Track
        this.track = this.renderer.createElement('div');
        this.renderer.setStyle(this.track, 'position', 'fixed');
        this.renderer.setStyle(this.track, 'width', '6px');
        this.renderer.setStyle(this.track, 'transform', 'translateX(-100%)');
        this.renderer.setStyle(this.track, 'background', 'transparent');
        // Opacity and its fade are owned by styles.scss, driven by ScrollbarAutoHideService's data-scrollbar-active.
        this.renderer.setAttribute(this.track, 'data-scrollbar-track', '');
        if (this.alwaysVisible) this.renderer.setAttribute(this.track, 'data-scrollbar-pinned', '');
        this.renderer.setStyle(this.track, 'pointer-events', 'none');

        // Thumb
        this.thumb = this.renderer.createElement('div');
        this.renderer.setStyle(this.thumb, 'position', 'absolute');
        this.renderer.setStyle(this.thumb, 'right', '0');
        this.renderer.setStyle(this.thumb, 'width', '100%');
        this.renderer.setStyle(this.thumb, 'background', 'var(--scrollbar-thumb, #aaa)');
        this.renderer.setStyle(this.thumb, 'border-radius', '3px');
        this.renderer.setStyle(this.thumb, 'cursor', 'pointer');
        this.renderer.setStyle(this.thumb, 'transition', 'background-color 0.2s linear');
        this.renderer.setStyle(this.thumb, 'pointer-events', 'auto');

        this.renderer.appendChild(this.track, this.thumb);
        this.renderer.appendChild(this.trackWrapper, this.track);
        this.renderer.appendChild(container, this.trackWrapper);

        // Update track position
        this.updateTrackPosition();

        this.autoHide.attach();

        // Hover effects

        this.renderer.listen(this.thumb, 'mouseenter', () => {
            this.renderer.setStyle(this.track, 'width', '10px');
            this.renderer.setStyle(this.thumb, 'background', 'var(--scrollbar-thumb-hover, #888)');
        });

        this.renderer.listen(this.thumb, 'mouseleave', () => {
            if (!this.dragging) {
                this.renderer.setStyle(this.track, 'width', '6px');
                this.renderer.setStyle(this.thumb, 'background', 'var(--scrollbar-thumb, #aaa)');
            }
        });

        // ResizeObserver
        this.observer = new ResizeObserver(() => {
            this.updateTrackPosition();
            this.updateThumb();
        });
        this.observer.observe(container);

        // Content can grow without the container resizing (async data replacing a skeleton), so re-measure on DOM changes too.
        // Outside the Angular zone: measuring must never trigger change detection.
        this.zone.runOutsideAngular(() => {
            this.mutationObserver = new MutationObserver(() => this.scheduleUpdate());
            this.mutationObserver.observe(container, { childList: true, subtree: true });
        });

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize);

        this.updateThumb();

        // MouseDown on thumb
        this.renderer.listen(this.thumb, 'mousedown', (e: MouseEvent) => {
            this.dragging = true;
            this.dragStartY = e.clientY;
            this.scrollStartTop = container.scrollTop;
            this.renderer.setStyle(this.thumb, 'background', 'var(--scrollbar-thumb-hover, #666)');
            e.preventDefault();
            e.stopPropagation();
        });
    }

    private onWindowResize = () => {
        this.updateTrackPosition();
        this.updateThumb();
    };

    @HostListener('scroll')
    onScroll() {
        this.updateThumb();
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(e: MouseEvent) {
        if (!this.dragging || !this.isBrowser) return;

        const container = this.el.nativeElement;
        if (!container) return;

        const visible = container.clientHeight;
        const total = container.scrollHeight;

        const scrollable = total - visible;
        const trackSpace = visible - this.thumbHeight;

        const deltaY = e.clientY - this.dragStartY;

        const scrollDelta = (deltaY / trackSpace) * scrollable;

        container.scrollTop = this.scrollStartTop + scrollDelta;
        e.preventDefault();
    }

    @HostListener('document:mouseup')
    onMouseUp() {
        if (this.dragging) {
            this.dragging = false;
            this.renderer.setStyle(this.track, 'width', '6px');
            this.renderer.setStyle(this.thumb, 'background', 'var(--scrollbar-thumb, #aaa)');
        }
    }

    private scheduleUpdate() {
        if (this.frameId) return;
        this.frameId = requestAnimationFrame(() => {
            this.frameId = 0;
            this.updateTrackPosition();
            this.updateThumb();
        });
    }

    private updateTrackPosition() {
        if (!this.isBrowser) return;

        const container = this.el.nativeElement;
        if (!container || !this.track) return;

        const rect = container.getBoundingClientRect();

        this.renderer.setStyle(this.track, 'top', `${rect.top}px`);
        this.renderer.setStyle(this.track, 'left', `${rect.right}px`);
        // clientHeight excludes the native horizontal bar, so the overlay track ends above it.
        this.renderer.setStyle(this.track, 'height', `${container.clientHeight}px`);
    }

    private updateThumb() {
        if (!this.isBrowser) return;

        const container = this.el.nativeElement;
        if (!container || !this.thumb) return;

        const visible = container.clientHeight;
        const total = container.scrollHeight;
        const scrollTop = container.scrollTop;

        if (total <= visible) {
            this.renderer.setStyle(this.track, 'display', 'none');
            return;
        } else {
            this.renderer.setStyle(this.track, 'display', 'block');
        }

        this.thumbHeight = Math.max((visible / total) * visible, 20);

        const scrollable = total - visible;
        const trackSpace = visible - this.thumbHeight;

        this.thumbTop = scrollable > 0 ? (scrollTop / scrollable) * trackSpace : 0;

        this.renderer.setStyle(this.thumb, 'height', `${this.thumbHeight}px`);
        this.renderer.setStyle(this.thumb, 'transform', `translateY(${this.thumbTop}px)`);
    }

    ngOnDestroy() {
        if (this.isBrowser) window.removeEventListener('resize', this.onWindowResize);
        if (this.isBrowser && this.observer) {
            this.observer.disconnect();
            this.mutationObserver?.disconnect();
            if (this.frameId) cancelAnimationFrame(this.frameId);
        }
    }
}