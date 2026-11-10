import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Ring spinner, the single loading indicator of the application.
 *
 * - Default (legacy): centred over its positioned parent, white, with a blurred backdrop. Used on the gradient buttons.
 * - `inline`: an inline ring that sits in the flow, for page, panel, table and dialog loading. Pair it with `tone`.
 *
 * `tone` sets the colours: `light` (white, for dark or gradient backgrounds), `primary` (brand rose) or `current`
 * (follows the surrounding text colour, e.g. inside a muted label). When a `label` is given the spinner announces it as
 * a status message; otherwise it is decorative and hidden from assistive technology (the control it sits in should
 * carry `aria-busy`). The ring stops spinning for visitors who prefer reduced motion.
 */
@Component({
    selector: 'boo-spinner',
    standalone: true,
    imports: [NgIf],
    template: `
        <div
            [class]="inline ? 'inline-flex items-center justify-center align-middle' : 'inset-0 flex items-center justify-center backdrop-blur-md'"
            [style.position]="inline ? null : position"
            [attr.role]="label ? 'status' : null"
            [attr.aria-hidden]="label ? null : true"
        >
            <div
                class="rounded-full animate-spin motion-reduce:animate-none"
                [style.width.px]="size"
                [style.height.px]="size"
                [style.border]="'2px solid ' + stroke"
                [style.border-top-color]="main"
            ></div>
            <span *ngIf="label" class="sr-only">{{ label }}</span>
        </div>
    `,
    host: { '[class.inline-block]': 'inline' },
})
export class BooSpinnerComponent {
    @Input() size: number = 16;
    /** Ring colour. Overrides `tone`. */
    @Input() strokeColor?: string;
    /** Spinning arc colour. Overrides `tone`. */
    @Input() mainColor?: string;
    @Input() position?: string = 'absolute';
    /** In the flow instead of centred over the parent. */
    @Input() inline = false;
    @Input() tone: 'light' | 'primary' | 'current' = 'light';
    /** Announces this text as a status message. Leave empty when the spinner is decorative. */
    @Input() label = '';

    get stroke(): string {
        if (this.strokeColor) return this.strokeColor;
        return this.tone === 'primary' ? 'rgb(var(--twc-primary) / 0.25)' : this.tone === 'current' ? 'color-mix(in srgb, currentColor 25%, transparent)' : 'rgba(255, 255, 255, 0.3)';
    }

    get main(): string {
        if (this.mainColor) return this.mainColor;
        return this.tone === 'primary' ? 'rgb(var(--twc-primary))' : this.tone === 'current' ? 'currentColor' : '#ffffff';
    }
}
