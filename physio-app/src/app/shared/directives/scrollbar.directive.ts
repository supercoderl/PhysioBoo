import { isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostListener,
    Inject,
    OnDestroy,
    PLATFORM_ID,
    Renderer2
} from '@angular/core';

@Directive({
    selector: '[custom-scrollbar]',
    standalone: true
})
export class CustomScrollbarDirective implements AfterViewInit, OnDestroy {
    private thumb!: HTMLElement;
    private track!: HTMLElement;
    private trackWrapper!: HTMLElement;

    private thumbHeight = 0;
    private thumbTop = 0;

    private dragging = false;
    private dragStartY = 0;
    private scrollStartTop = 0;

    private observer!: ResizeObserver;
    private isBrowser: boolean;

    constructor(
        private el: ElementRef<HTMLElement>,
        private renderer: Renderer2,
        @Inject(PLATFORM_ID) platformId: Object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngAfterViewInit() {
        if (!this.isBrowser) return;

        const container = this.el.nativeElement;
        if (!container) return;

        // Hide default scrollbar
        this.renderer.setStyle(container, 'scrollbar-width', 'none');
        this.renderer.setStyle(container, '-ms-overflow-style', 'none');

        const style = document.createElement('style');
        style.textContent = `
            [custom-scrollbar]::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);

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
        this.renderer.setStyle(this.track, 'right', '0px');
        this.renderer.setStyle(this.track, 'background', 'transparent');
        this.renderer.setStyle(this.track, 'transition', 'background-color 0.2s linear, opacity 0.2s linear, width 0.2s ease-in-out');
        this.renderer.setStyle(this.track, 'opacity', '0');
        this.renderer.setStyle(this.track, 'pointer-events', 'none');

        // Thumb
        this.thumb = this.renderer.createElement('div');
        this.renderer.setStyle(this.thumb, 'position', 'absolute');
        this.renderer.setStyle(this.thumb, 'right', '0');
        this.renderer.setStyle(this.thumb, 'width', '100%');
        this.renderer.setStyle(this.thumb, 'background', '#aaa');
        this.renderer.setStyle(this.thumb, 'border-radius', '3px');
        this.renderer.setStyle(this.thumb, 'cursor', 'pointer');
        this.renderer.setStyle(this.thumb, 'transition', 'background-color 0.2s linear');
        this.renderer.setStyle(this.thumb, 'pointer-events', 'auto');

        this.renderer.appendChild(this.track, this.thumb);
        this.renderer.appendChild(this.trackWrapper, this.track);
        this.renderer.appendChild(container, this.trackWrapper);

        // Update track position
        this.updateTrackPosition();

        // Hover effects
        this.renderer.listen(container, 'mouseenter', () => {
            this.renderer.setStyle(this.track, 'opacity', '0.6');
        });

        this.renderer.listen(container, 'mouseleave', () => {
            if (!this.dragging) {
                this.renderer.setStyle(this.track, 'opacity', '0');
                this.renderer.setStyle(this.track, 'width', '6px');
            }
        });

        this.renderer.listen(this.thumb, 'mouseenter', () => {
            this.renderer.setStyle(this.track, 'width', '10px');
            this.renderer.setStyle(this.thumb, 'background', '#888');
        });

        this.renderer.listen(this.thumb, 'mouseleave', () => {
            if (!this.dragging) {
                this.renderer.setStyle(this.track, 'width', '6px');
                this.renderer.setStyle(this.thumb, 'background', '#aaa');
            }
        });

        // ResizeObserver
        this.observer = new ResizeObserver(() => {
            this.updateTrackPosition();
            this.updateThumb();
        });
        this.observer.observe(container);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateTrackPosition();
            this.updateThumb();
        });

        this.updateThumb();

        // MouseDown on thumb
        this.renderer.listen(this.thumb, 'mousedown', (e: MouseEvent) => {
            this.dragging = true;
            this.dragStartY = e.clientY;
            this.scrollStartTop = container.scrollTop;
            this.renderer.setStyle(this.thumb, 'background', '#666');
            e.preventDefault();
            e.stopPropagation();
        });
    }

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
            this.renderer.setStyle(this.track, 'opacity', '0');
            this.renderer.setStyle(this.track, 'width', '6px');
            this.renderer.setStyle(this.thumb, 'background', '#aaa');
        }
    }

    private updateTrackPosition() {
        if (!this.isBrowser) return;

        const container = this.el.nativeElement;
        if (!container || !this.track) return;

        const rect = container.getBoundingClientRect();

        this.renderer.setStyle(this.track, 'top', `${rect.top}px`);
        this.renderer.setStyle(this.track, 'height', `${rect.height}px`);
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
        if (this.isBrowser && this.observer) {
            this.observer.disconnect();
        }
    }
}