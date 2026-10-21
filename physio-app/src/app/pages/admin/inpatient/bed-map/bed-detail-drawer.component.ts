import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpContext } from '@angular/common/http';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooButtonComponent, BooEmptyStateComponent, BooIconComponent, BooInlineErrorComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { finalize } from 'rxjs';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BedMapService } from '../../../../services/admin/bed-map.service';
import { SKIP_ERROR_TOAST } from '../../../../shared/contexts/option.context';
import { Bed, BedHistoryEntry } from '../../../../shared/types/bed.types';
import { bedStatus } from './bed-map.utils';

/** Read-only view of one bed with its stay history and the assign / discharge actions the caller is allowed to run. */
@Component({
    selector: 'bed-detail-drawer',
    standalone: true,
    imports: [NgIf, NgFor, DatePipe, RouterLink, DrawerComponent, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooInlineErrorComponent],
    template: `
        <drawer [isOpen]="!!bed" (close)="close.emit()">
            <div
                *ngIf="bed as b"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="bed-detail-title"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">{{ b.wardName || 'Ward' }}<ng-container *ngIf="b.roomNumber"> · Room {{ b.roomNumber }}</ng-container></p>
                        <h2 id="bed-detail-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">Bed {{ b.number }}</h2>
                        <div class="mt-2 flex flex-wrap items-center gap-1.5">
                            <boo-status-badge dotted [label]="status(b.status).label" [tone]="status(b.status).tone" />
                            <boo-status-badge *ngIf="b.isolationRequired" label="Isolation" tone="warning" />
                        </div>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close bed details" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <section aria-labelledby="bed-detail-location">
                        <h3 id="bed-detail-location" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Location</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Ward</dt>
                                <dd class="m-0 font-medium text-regular">{{ b.wardName || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Floor</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ b.floor }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Room</dt>
                                <dd class="m-0 font-medium text-regular">{{ b.roomNumber || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Bed type</dt>
                                <dd class="m-0 font-medium text-regular">{{ b.bedType }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section *ngIf="b.patientId" aria-labelledby="bed-detail-patient" class="pt-5 border-t border-rowDivider">
                        <h3 id="bed-detail-patient" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Current patient</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Name</dt>
                                <dd class="m-0 font-medium text-regular">{{ b.patientName || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Patient no.</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ b.patientNumber || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Admitted</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ (b.admissionDate | date: 'd MMM y, HH:mm') || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Expected discharge</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ (b.expectedDischargeDate | date: 'd MMM y') || '—' }}</dd>
                            </div>
                        </dl>
                        <a
                            *ngIf="nursingLink"
                            [routerLink]="[nursingLink, b.patientId]"
                            class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primaryDeep no-underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >Open nursing record<physio-icon name="chevron-right" [size]="14" /></a>
                    </section>

                    <section *ngIf="b.notes" aria-labelledby="bed-detail-notes" class="pt-5 border-t border-rowDivider">
                        <h3 id="bed-detail-notes" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Notes</h3>
                        <p class="m-0 text-sm text-regular whitespace-pre-line break-words">{{ b.notes }}</p>
                    </section>

                    <section aria-labelledby="bed-detail-history" class="pt-5 border-t border-rowDivider" [attr.aria-busy]="historyLoading">
                        <h3 id="bed-detail-history" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Stay history</h3>

                        <div *ngIf="historyLoading" class="flex flex-col gap-2" aria-hidden="true">
                            <div *ngFor="let _ of skeletonRows" class="h-10 rounded-lg bg-body animate-pulse"></div>
                        </div>
                        <span *ngIf="historyLoading" class="sr-only" role="status">Loading stay history</span>

                        <boo-inline-error *ngIf="!historyLoading && historyError" what="the stay history" [compact]="true" (retry)="loadHistory()" />

                        <boo-empty-state
                            *ngIf="!historyLoading && !historyError && !history.length"
                            icon="history"
                            title="No previous stays"
                            description="Patients assigned to this bed will be listed here."
                        />

                        <ol *ngIf="!historyLoading && !historyError && history.length" class="m-0 p-0 list-none flex flex-col">
                            <li *ngFor="let h of history; trackBy: trackById" class="py-2.5 border-b border-rowDivider last:border-b-0">
                                <div class="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                                    <span class="font-medium text-regular">{{ h.patientName }}</span>
                                    <span class="text-xs text-secondary tabular-nums">
                                        {{ h.admissionDate | date: 'd MMM y' }} – {{ h.dischargeDate ? (h.dischargeDate | date: 'd MMM y') : 'present' }}
                                    </span>
                                </div>
                                <p *ngIf="h.assignedBy" class="m-0 mt-0.5 text-xs text-secondary">Assigned by {{ h.assignedBy }}</p>
                            </li>
                        </ol>
                    </section>
                </div>

                <footer *ngIf="canAssign && (b.status === 'Available' || b.status === 'Occupied')" class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="b.status === 'Occupied'" boo-button variant="secondary" size="sm" [loading]="busy" (click)="discharge.emit(b)">
                        <physio-icon *ngIf="!busy" name="door-open" [size]="15" aria-hidden="true" />Discharge patient
                    </button>
                    <button *ngIf="b.status === 'Available'" boo-button variant="primary" size="sm" [disabled]="busy" (click)="assign.emit(b)">
                        <physio-icon name="user-plus" [size]="15" aria-hidden="true" />Assign patient
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class BedDetailDrawerComponent implements OnChanges {
    /** The bed to show; null closes the drawer. */
    @Input() bed: Bed | null = null;
    /** Holder of Inpatient.BedAssign, the permission the assign and discharge endpoints enforce. */
    @Input() canAssign = false;
    /** Route prefix of the nursing patient page; null hides the link (no NursingRead). */
    @Input() nursingLink: string | null = null;
    /** An assign or discharge for this bed is in flight. */
    @Input() busy = false;
    @Output() close = new EventEmitter<void>();
    @Output() assign = new EventEmitter<Bed>();
    @Output() discharge = new EventEmitter<Bed>();

    readonly status = bedStatus;
    readonly skeletonRows = [0, 1, 2];

    history: BedHistoryEntry[] = [];
    historyLoading = false;
    historyError = false;

    private readonly silent = new HttpContext().set(SKIP_ERROR_TOAST, true);
    private historyBedId: string | null = null;

    constructor(private bedMapSrv: BedMapService) { }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.bed) this.close.emit();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['bed']) return;
        const id = this.bed?.id ?? null;
        // The map refreshes after an assign or discharge and hands this bed back with new values; the history is
        // reloaded then too, because the stay it shows has just changed.
        if (id && (id !== this.historyBedId || this.bed?.status !== changes['bed'].previousValue?.status)) {
            this.historyBedId = id;
            this.loadHistory();
        } else if (!id) {
            this.historyBedId = null;
            this.history = [];
            this.historyError = false;
        }
    }

    loadHistory(): void {
        const id = this.historyBedId;
        if (!id) return;
        this.historyLoading = true;
        this.historyError = false;
        this.bedMapSrv.history(id, this.silent)
            .pipe(finalize(() => { if (this.historyBedId === id) this.historyLoading = false; }))
            .subscribe({
                next: res => {
                    if (this.historyBedId !== id) return;
                    this.history = res.success && res.data ? res.data : [];
                },
                error: () => {
                    if (this.historyBedId !== id) return;
                    this.history = [];
                    this.historyError = true;
                },
            });
    }

    trackById(_: number, h: BedHistoryEntry): string {
        return h.id;
    }
}
