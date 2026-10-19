import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SharedModule } from "../../shared/shared-imports";
import { BooButtonComponent } from "../button/boo-button/boo-button.component";

export type InlineErrorState = 'default' | 'retrying' | 'failed';

/**
 * One section's request failed while the rest of the page loaded (design: InlineError).
 * Use it in place of the section's content; never redirect to `/exception` for this.
 * The parent owns the request: set `state` to `retrying` while it re-runs, `failed` if it fails again,
 * and drop the component once it succeeds.
 */
@Component({
    selector: 'boo-inline-error',
    standalone: true,
    imports: [SharedModule, BooButtonComponent],
    template: `
        <div
            [attr.role]="busy ? 'status' : 'alert'"
            aria-live="polite"
            class="bg-gray-50 border border-gray-200 rounded-[14px] flex gap-3.5 min-w-0 text-gray-900"
            [ngClass]="compact ? 'p-3.5 flex-col items-stretch' : 'px-4.5 py-4 flex-row items-center'"
        >
            <div class="flex gap-3 items-start flex-1 min-w-0">
                <span class="inline-flex flex-none mt-0.5" [ngClass]="busy ? 'text-gray-700 animate-spin' : 'text-[#B42318]'" aria-hidden="true">
                    <physio-icon [name]="busy ? 'loader-circle' : 'circle-alert'" [size]="18" />
                </span>
                <div class="min-w-0">
                    <p class="m-0 text-[15px] leading-[22px] font-semibold">{{ title }}</p>
                    <p class="mt-0.5 mb-0 text-sm leading-[21px] text-gray-700">{{ body }}</p>
                </div>
            </div>
            <button
                boo-button
                variant="secondary"
                (click)="retry.emit()"
                [disabled]="busy"
                [block]="compact"
                class="flex-none"
            >{{ busy ? 'Trying again…' : 'Try again' }}</button>
        </div>
    `,
})
export class InlineErrorComponent {
    /** What failed to load, e.g. "clinics" → "We couldn’t load clinics". */
    @Input() what: string = 'this section';
    @Input() state: InlineErrorState = 'default';
    /** Stacks the button under the message, for narrow columns and mobile. */
    @Input() compact: boolean = false;
    @Output() retry = new EventEmitter<void>();

    get busy(): boolean {
        return this.state === 'retrying';
    }

    get title(): string {
        if (this.busy) return `Loading ${this.what}…`;
        return this.state === 'failed' ? `Still couldn’t load ${this.what}` : `We couldn’t load ${this.what}`;
    }

    get body(): string {
        if (this.busy) return 'This should only take a moment.';
        return this.state === 'failed'
            ? 'Please try again in a few minutes. The rest of the page still works.'
            : 'Something went wrong on our side. The rest of the page still works.';
    }
}
