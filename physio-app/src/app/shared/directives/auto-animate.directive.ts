import { AfterViewInit, Directive, ElementRef, Input, NgZone } from '@angular/core';
import autoAnimate, { AutoAnimateOptions, AutoAnimationPlugin } from '@formkit/auto-animate';

@Directive({
    selector: '[autoAnimate]',
    standalone: true
})
export class AutoAnimateDirective implements AfterViewInit {
    @Input('autoAnimate') options?: AutoAnimateOptions | AutoAnimationPlugin;

    constructor(private el: ElementRef, private zone: NgZone) { }

    ngAfterViewInit(): void {
        this.zone.runOutsideAngular(() => {
            autoAnimate(this.el.nativeElement, this.options || {});
        });
    }
}