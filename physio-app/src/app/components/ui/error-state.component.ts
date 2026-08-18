import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SharedModule } from "../../shared/shared-imports";
import { BooIconComponent } from "../icon/boo-icon/boo-icon.component";

@Component({
    selector: 'boo-error-state',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
        <div class="flex flex-col items-center justify-center text-center py-10 px-6">
            <div class="flex items-center justify-center w-14 h-14 rounded-2 bg-danger/5 mb-4">
                <boo-icon [name]="icon" [size]="26" iconClass="text-danger"></boo-icon>
            </div>
            <p class="text-sm font-semibold text-regular mb-1">{{ title }}</p>
            <p class="text-xs15 text-secondary max-w-[280px] mb-5" *ngIf="description">{{ description }}</p>
            <ng-content></ng-content>
            <button
                *ngIf="showRetry"
                type="button"
                class="inline-flex items-center gap-1.5 text-xs15 font-semibold text-primary hover:opacity-80"
                (click)="retry.emit()"
            >
                <boo-icon name="refresh-cw" [size]="14"></boo-icon>
                {{ retryLabel }}
            </button>
        </div>
    `,
})
export class ErrorStateComponent {
    @Input() icon: string = 'alert-triangle';
    @Input({ required: true }) title!: string;
    @Input() description?: string | null;
    @Input() showRetry: boolean = true;
    @Input() retryLabel: string = 'Retry';
    @Output() retry = new EventEmitter<void>();
}
