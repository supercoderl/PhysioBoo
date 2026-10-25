import { NgIf, NgTemplateOutlet } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent } from "../button/button.component";
import { BooIconComponent } from "../icon/icon.component";

@Component({
    selector: 'boo-error-state',
    standalone: true,
    imports: [NgIf, NgTemplateOutlet, BooIconComponent, BooButtonComponent],
    template: `
        <ng-template #projected><ng-content></ng-content></ng-template>

        <div *ngIf="appearance === 'default'" class="h-full flex flex-col items-center justify-center text-center py-10 px-6">
            <div class="flex items-center justify-center w-14 h-14 rounded-2 bg-danger/5 mb-4">
                <physio-icon [name]="icon" [size]="26" class="text-danger"></physio-icon>
            </div>
            <p class="text-sm font-semibold text-regular mb-1">{{ title }}</p>
            <p class="text-xs15 text-secondary max-w-[280px] mb-5" *ngIf="description">{{ description }}</p>
            <ng-container *ngTemplateOutlet="projected"></ng-container>
            <button
                *ngIf="showRetry"
                type="button"
                class="inline-flex items-center gap-1.5 text-xs15 font-semibold text-primary hover:opacity-80"
                (click)="retry.emit()"
            >
                <physio-icon name="refresh" [size]="14"></physio-icon>
                {{ retryLabel }}
            </button>
        </div>

        <div
            *ngIf="appearance === 'panel'"
            role="alert"
            class="border border-dangerBorder bg-dangerSoft rounded-2xl px-5 py-9 md:px-8 md:py-12 text-center"
        >
            <physio-icon [name]="icon" [size]="32" class="text-danger inline-flex" />
            <p role="heading" [attr.aria-level]="headingLevel" class="text-xl leading-7 font-semibold text-gray-900 mt-3.5 mb-1.5 break-words">{{ title }}</p>
            <p *ngIf="description" class="text-[15px] leading-6 text-gray-700 mx-auto mb-0 max-w-[460px]">{{ description }}</p>
            <div class="flex gap-2.5 justify-center flex-wrap mt-5 empty:hidden">
                <button *ngIf="showRetry" boo-button variant="primary" (click)="retry.emit()">
                    <physio-icon name="rotate-cw" [size]="16" />{{ retryLabel }}
                </button>
                <ng-container *ngTemplateOutlet="projected"></ng-container>
            </div>
        </div>
    `,
})
export class BooErrorStateComponent {
    @Input() icon: string = 'triangle-alert';
    @Input({ required: true }) title!: string;
    @Input() description?: string | null;
    @Input() showRetry: boolean = true;
    @Input() retryLabel: string = 'Retry';
    @Input() appearance: 'default' | 'panel' = 'default';
    @Input() headingLevel: 2 | 3 = 2;
    @Output() retry = new EventEmitter<void>();
}
