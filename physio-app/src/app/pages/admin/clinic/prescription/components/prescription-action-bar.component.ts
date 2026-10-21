import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { PrescriptionStatus } from '../../../../../shared/types/prescription-rx.types';
import { STATUS_LABELS, statusTone } from '../prescription-rx.util';

/** Page header: prescription number, status, unsaved marker and refresh. */
@Component({
    selector: 'rx-action-bar',
    standalone: true,
    imports: [NgIf, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent],
    template: `
        <header class="flex flex-wrap items-end justify-between gap-3">
            <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                    <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">{{ title }}</h1>
                    <boo-status-badge *ngIf="status" [label]="statusLabel" [tone]="tone" dotted />
                    <boo-status-badge *ngIf="dirty" label="Unsaved changes" tone="warning" />
                </div>
                <p *ngIf="subtitle" class="m-0 mt-0.5 text-xs leading-5 text-secondary">{{ subtitle }}</p>
            </div>
            <button *ngIf="showRefresh" type="button" boo-button variant="secondary" size="sm" [loading]="loading" [disabled]="loading" (click)="refresh.emit()">
                <physio-icon *ngIf="!loading" name="refresh" [size]="15" aria-hidden="true" />Refresh
            </button>
        </header>
    `,
})
export class PrescriptionActionBarComponent {
    @Input() title = 'Prescription';
    @Input() subtitle = '';
    @Input() status: PrescriptionStatus | null = null;
    @Input() dirty = false;
    @Input() loading = false;
    @Input() showRefresh = true;
    @Output() refresh = new EventEmitter<void>();

    get statusLabel(): string {
        return this.status ? STATUS_LABELS[this.status] : '';
    }

    get tone() {
        return statusTone(this.status ?? 'Draft');
    }
}
