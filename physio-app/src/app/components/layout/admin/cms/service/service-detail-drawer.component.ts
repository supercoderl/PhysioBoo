import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { MedicalServiceService } from "../../../../../services/admin/medical-service.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MedicalService, ServiceAvailability, ServiceStatus } from "../../../../../shared/types/service.types";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";

@Component({
    selector: 'cms-service-detail-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooIconComponent],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="720" (close)="close.emit()">
            <div *ngIf="loading" class="flex items-center justify-center h-full">
                <boo-icon name="loader" [size]="24" iconClass="animate-spin text-secondary"></boo-icon>
            </div>

            <div *ngIf="!loading && loadError" class="flex flex-col items-center justify-center h-full text-center px-6">
                <boo-icon name="alert-triangle" [size]="28" iconClass="text-red-500 mb-3"></boo-icon>
                <p class="text-sm font-semibold text-regular mb-1">Couldn't load this service</p>
                <p class="text-xs15 text-secondary max-w-[280px] mb-4">The request failed. Please try again.</p>
                <button (click)="reload()" class="px-3 py-1.5 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-100">
                    Retry
                </button>
            </div>

            <div *ngIf="!loading && !loadError && item as s" class="flex flex-col h-full bg-surface">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-mono text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded">{{ s.code }}</span>
                            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(s.status)">
                                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="statusDotClass(s.status)"></span>
                                {{ s.status }}
                            </span>
                            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="availabilityClass(s.availability)">
                                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="availabilityDotClass(s.availability)"></span>
                                {{ s.availability }}
                            </span>
                        </div>
                        <h2 class="text-xl font-bold text-primary leading-tight">{{ s.name }}</h2>
                        <p class="text-sm text-secondary mt-1" *ngIf="s.shortName">{{ s.shortName }}</p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <button (click)="editClick.emit(s)" class="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-1.5">
                            <boo-icon name="pencil" iconClass="w-3.5 h-3.5"></boo-icon>
                            Edit
                        </button>
                        <button (click)="close.emit()" class="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center justify-center">
                            <boo-icon name="x" [size]="20"></boo-icon>
                        </button>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-6" custom-scrollbar>
                    <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div>
                            <div class="text-xs text-secondary uppercase tracking-wider mb-1">Department</div>
                            <div class="text-primary">{{ s.primaryDepartmentName || '—' }}</div>
                        </div>
                        <div>
                            <div class="text-xs text-secondary uppercase tracking-wider mb-1">Duration</div>
                            <div class="text-primary">{{ formatDuration(s.durationMinutes) }}</div>
                        </div>
                        <div>
                            <div class="text-xs text-secondary uppercase tracking-wider mb-1">Base price</div>
                            <div class="text-primary font-medium">{{ formatMoney(s.basePrice, s.currency) }}</div>
                            <div class="text-xs text-secondary">{{ s.vatIncluded ? 'VAT included' : 'VAT excluded' }}</div>
                        </div>
                        <div>
                            <div class="text-xs text-secondary uppercase tracking-wider mb-1">Requirements</div>
                            <div class="flex gap-1 flex-wrap">
                                <span *ngIf="s.requiresAppointment" class="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">Appointment</span>
                                <span *ngIf="s.requiresReferral" class="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded">Referral</span>
                                <span *ngIf="!s.requiresAppointment && !s.requiresReferral" class="text-xs text-secondary italic">Walk-in</span>
                            </div>
                        </div>
                    </div>

                    <div *ngIf="s.description">
                        <div class="text-xs text-secondary uppercase tracking-wider mb-2">Description</div>
                        <p class="text-sm text-primary whitespace-pre-wrap m-0">{{ s.description }}</p>
                    </div>

                    <div>
                        <div class="text-xs text-secondary uppercase tracking-wider mb-2">
                            Doctors ({{ s.doctorCount ?? s.doctorIds.length }})
                        </div>
                        <div *ngIf="s.primaryDoctorName" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                {{ s.primaryDoctorName.charAt(0) }}
                            </div>
                            <div class="min-w-0">
                                <div class="text-sm font-medium text-primary">{{ s.primaryDoctorName }}</div>
                                <div class="text-xs text-secondary">Primary</div>
                            </div>
                        </div>
                        <div *ngIf="!s.primaryDoctorName" class="text-xs text-secondary italic p-3 border border-dashed border-gray-200 rounded-lg text-center">
                            No doctor assigned
                        </div>
                    </div>

                    <div *ngIf="s.popularity">
                        <div class="text-xs text-secondary uppercase tracking-wider mb-2">Activity</div>
                        <div class="grid grid-cols-3 gap-3 text-sm">
                            <div class="p-3 bg-gray-50 rounded-lg">
                                <div class="text-xs text-secondary">Appointments</div>
                                <div class="font-semibold text-primary">{{ s.popularity.totalAppointments }}</div>
                            </div>
                            <div class="p-3 bg-gray-50 rounded-lg">
                                <div class="text-xs text-secondary">Revenue</div>
                                <div class="font-semibold text-primary">{{ formatMoney(s.popularity.totalRevenue, s.currency) }}</div>
                            </div>
                            <div class="p-3 bg-gray-50 rounded-lg">
                                <div class="text-xs text-secondary">Last booked</div>
                                <div class="font-semibold text-primary">{{ s.popularity.lastBookedAt ? (s.popularity.lastBookedAt | date:'mediumDate') : '—' }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-gray-100 pt-4">
                        <div class="text-xs text-secondary uppercase tracking-wider mb-2">Audit</div>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-secondary">
                            <div>Created  <span class="text-primary">{{ s.createdAt | date:'medium' }}</span></div>
                            <div>By      <span class="text-primary">{{ s.createdBy || '—' }}</span></div>
                            <div *ngIf="s.updatedAt">Updated <span class="text-primary">{{ s.updatedAt | date:'medium' }}</span></div>
                            <div *ngIf="s.updatedBy">By      <span class="text-primary">{{ s.updatedBy }}</span></div>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <button *ngIf="s.status === 'Draft'" (click)="publishClick.emit(s)" class="px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 rounded flex items-center gap-1.5">
                            <boo-icon name="check" iconClass="w-3.5 h-3.5"></boo-icon>
                            Publish
                        </button>
                        <button (click)="duplicateClick.emit(s)" class="px-3 py-1.5 text-sm text-primary hover:bg-gray-100 rounded flex items-center gap-1.5">
                            <boo-icon name="copy" iconClass="w-3.5 h-3.5"></boo-icon>
                            Duplicate
                        </button>
                    </div>
                    <div class="flex items-center gap-2">
                        <button (click)="archiveClick.emit(s)" class="px-3 py-1.5 text-sm text-secondary hover:bg-gray-100 rounded flex items-center gap-1.5">
                            <boo-icon name="archive" iconClass="w-3.5 h-3.5"></boo-icon>
                            Archive
                        </button>
                        <button (click)="deleteClick.emit(s)" class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded flex items-center gap-1.5">
                            <boo-icon name="trash-2" iconClass="w-3.5 h-3.5"></boo-icon>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class CmsServiceDetailDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() serviceId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() editClick = new EventEmitter<MedicalService>();
    @Output() duplicateClick = new EventEmitter<MedicalService>();
    @Output() archiveClick = new EventEmitter<MedicalService>();
    @Output() publishClick = new EventEmitter<MedicalService>();
    @Output() deleteClick = new EventEmitter<MedicalService>();

    item: MedicalService | null = null;
    loading = false;
    loadError = false;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(private srv: MedicalServiceService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['serviceId'] && this.serviceId) {
            this.fetch(this.serviceId);
        } else if (!this.serviceId) {
            this.item = null;
            this.loadError = false;
        }
    }

    reload(): void {
        if (this.serviceId) this.fetch(this.serviceId);
    }

    private fetch(serviceId: string): void {
        this.loading = true;
        this.loadError = false;
        this.srv.search_by_id(serviceId).subscribe({
            next: (res) => {
                this.loading = false;
                this.item = res.success && res.data ? res.data : null;
                this.loadError = !res.success;
            },
            // Never fall back to stale/fake data on failure — show the retry state instead.
            error: () => {
                this.loading = false;
                this.item = null;
                this.loadError = true;
            },
        });
    }
    // #endregion

    // #region Methods
    statusClass(s: ServiceStatus): string {
        switch (s) {
            case 'Active':   return 'bg-emerald-50 text-emerald-700';
            case 'Draft':    return 'bg-amber-50 text-amber-700';
            case 'Inactive': return 'bg-gray-100 text-gray-600';
            case 'Archived': return 'bg-zinc-100 text-zinc-500';
        }
    }

    statusDotClass(s: ServiceStatus): string {
        switch (s) {
            case 'Active':   return 'bg-emerald-500';
            case 'Draft':    return 'bg-amber-500';
            case 'Inactive': return 'bg-gray-400';
            case 'Archived': return 'bg-zinc-400';
        }
    }

    availabilityClass(a: ServiceAvailability): string {
        switch (a) {
            case 'Available':   return 'bg-emerald-50 text-emerald-700';
            case 'Limited':     return 'bg-amber-50 text-amber-700';
            case 'Unavailable': return 'bg-red-50 text-red-700';
        }
    }

    availabilityDotClass(a: ServiceAvailability): string {
        switch (a) {
            case 'Available':   return 'bg-emerald-500';
            case 'Limited':     return 'bg-amber-500';
            case 'Unavailable': return 'bg-red-500';
        }
    }

    formatMoney(amount: number, currency: string): string {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency', currency, maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return `${amount.toLocaleString()} ${currency}`;
        }
    }

    formatDuration(minutes: number): string {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
    }
    // #endregion
}
