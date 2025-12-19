import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, ElementRef, HostListener, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[dropdown]',
    standalone: true
})
export class DropdownDirective implements OnDestroy {
    @Input('dropdown') menuTemplate!: TemplateRef<any>;
    private overlayRef!: OverlayRef;
    private isDropdownOpen = false;

    constructor(
        private elementRef: ElementRef,
        private overlay: Overlay,
        private viewContainerRef: ViewContainerRef
    ) { }

    toggle() {
        this.isDropdownOpen ? this.close() : this.open();
    }

    open() {
        if (this.isDropdownOpen) return;

        const positionStrategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withPositions([
                { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
                { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 }
            ]);

        this.overlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop'
        });

        const portal = new TemplatePortal(this.menuTemplate, this.viewContainerRef);
        this.overlayRef.attach(portal);

        this.overlayRef.backdropClick().subscribe(() => this.close());

        this.isDropdownOpen = true;
    }

    close() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.isDropdownOpen = false;
        }
    }

    @HostListener('click')
    click() {
        this.toggle();
    }

    ngOnDestroy() {
        this.close();
    }
}