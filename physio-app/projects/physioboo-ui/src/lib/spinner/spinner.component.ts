import { Component, Input } from '@angular/core';

/** Ring spinner centred over its positioned parent (white on the legacy gradient buttons by default). */
@Component({
    selector: 'boo-spinner',
    standalone: true,
    template: `
        <div
            class="inset-0 flex items-center justify-center backdrop-blur-md"
            [style.position]="position"
        >
            <div
                class="rounded-full animate-spin"
                [style.width.px]="size"
                [style.height.px]="size"
                [style.border]="'2px solid ' + strokeColor"
                [style.border-top-color]="mainColor"
            ></div>
        </div>
    `
})
export class BooSpinnerComponent {
    @Input() size: number = 16;
    @Input() strokeColor?: string = 'rgba(255, 255, 255, 0.3)';
    @Input() mainColor?: string = '#ffffff';
    @Input() position?: string = 'absolute';
}
