import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { MedicalService } from '../../../../shared/types/service.types';
import {
    LookupOption,
    ServiceMoveKind,
    ServiceTransition,
    availabilityOf,
    bookingRuleOf,
    formatDuration,
    formatMoney,
    statusOf,
    transitionsOf,
} from './service.utils';

/**
 * Read view of one catalog entry: what it is, what it costs and takes, who delivers it, and where it is in its
 * lifecycle. Status moves, duplicates, edits and deletes are handed to the page, which owns the requests.
 */
@Component({
    selector: 'cms-service-detail-drawer',
    standalone: true,
    imports: [NgIf, NgFor, NgClass, DatePipe, DrawerComponent, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="!!service" (close)="close.emit()">
            <div
                *ngIf="service as s"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="service-detail-title"
                [attr.aria-busy]="busy"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <boo-status-badge dotted [label]="status(s).label" [tone]="status(s).tone" />
                        <span class="text-xs text-secondary">{{ status(s).hint }}</span>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close service details" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <!-- Lifecycle moves and duplicate -->
                <div *ngIf="(canUpdate && moves(s).length) || canCreate" class="flex-none px-6 py-3 border-b border-rowDivider bg-body/60">
                    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Change service status">
                        <ng-container *ngIf="canUpdate">
                            <button
                                *ngFor="let t of moves(s); let first = first"
                                type="button"
                                boo-button
                                size="sm"
                                [variant]="first && !t.quiet ? 'primary' : 'secondary'"
                                [disabled]="busy"
                                [loading]="busy && pending === t.kind"
                                (click)="transition.emit(t)"
                            ><physio-icon *ngIf="!(busy && pending === t.kind)" [name]="t.icon" [size]="15" aria-hidden="true" />{{ t.label }}</button>
                        </ng-container>
                        <button
                            *ngIf="canCreate"
                            type="button"
                            boo-button
                            variant="ghost"
                            size="sm"
                            class="ml-auto"
                            [disabled]="busy"
                            [loading]="busy && pending === 'duplicate'"
                            (click)="duplicate.emit(s)"
                        ><physio-icon *ngIf="!(busy && pending === 'duplicate')" name="copy" [size]="15" aria-hidden="true" />Duplicate</button>
                    </div>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto" custom-scrollbar>
                    <!-- Identity -->
                    <section class="px-6 pt-5 pb-5" aria-labelledby="service-detail-title">
                        <p class="m-0 font-mono text-xs font-medium tracking-wide text-primaryDeep">{{ s.code }}</p>
                        <h2 id="service-detail-title" class="m-0 mt-1 text-2xl leading-8 font-semibold tracking-tight text-regular break-words">{{ s.name }}</h2>
                        <p *ngIf="s.shortName" class="m-0 mt-1 text-sm text-secondary break-words">Also shown as “{{ s.shortName }}”</p>
                        <p *ngIf="s.description; else noDescTpl" class="m-0 mt-4 text-sm leading-6 text-regular whitespace-pre-line break-words">{{ s.description }}</p>
                        <ng-template #noDescTpl>
                            <p class="m-0 mt-4 text-sm text-placeholder">No description yet.</p>
                        </ng-template>
                    </section>

                    <!-- Price and time: the facts patients and finance rely on -->
                    <section aria-labelledby="sd-offer" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="sd-offer" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Price and booking</h3>
                        <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Base price</dt>
                                <dd class="m-0 mt-0.5 text-lg font-semibold text-regular tabular-nums">{{ money(s.basePrice, s.currency) }}</dd>
                                <dd class="m-0 text-xs text-secondary">{{ s.vatIncluded ? 'VAT included' : 'VAT not included' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Duration</dt>
                                <dd class="m-0 mt-0.5 text-lg font-semibold text-regular tabular-nums">{{ duration(s.durationMinutes) }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Booking</dt>
                                <dd class="m-0 mt-0.5 font-medium text-regular">{{ bookingRule(s) }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Availability</dt>
                                <dd class="m-0 mt-0.5 inline-flex items-center gap-1.5 font-medium" [ngClass]="availability(s).text === 'text-secondary' ? 'text-regular' : availability(s).text">
                                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="availability(s).dot" aria-hidden="true"></span>{{ availability(s).label }}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <!-- Who delivers it -->
                    <section aria-labelledby="sd-team" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="sd-team" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Departments and doctors</h3>
                        <dl class="m-0 flex flex-col gap-4 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">{{ departments(s).length === 1 ? 'Department' : 'Departments' }}</dt>
                                <dd class="m-0 mt-1">
                                    <ul *ngIf="departments(s).length; else noDeptTpl" class="m-0 p-0 list-none flex flex-wrap gap-1.5">
                                        <li *ngFor="let d of departments(s)" class="px-2.5 py-1 rounded-md bg-body border border-rowDivider text-[13px] text-regular">{{ d }}</li>
                                    </ul>
                                    <ng-template #noDeptTpl><span class="text-placeholder">Not linked to a department</span></ng-template>
                                </dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">{{ doctors(s).length === 1 ? 'Doctor' : 'Doctors' }}</dt>
                                <dd class="m-0 mt-1">
                                    <ul *ngIf="doctors(s).length; else noDocTpl" class="m-0 p-0 list-none flex flex-col gap-1.5">
                                        <li *ngFor="let d of doctors(s)" class="flex items-center gap-2.5 min-w-0">
                                            <span class="flex-none w-7 h-7 rounded-full bg-primarySoft text-primaryDeep text-xs font-semibold flex items-center justify-center" aria-hidden="true">{{ initial(d.name) }}</span>
                                            <span class="truncate text-regular">{{ d.name }}</span>
                                            <span *ngIf="d.primary" class="flex-none text-xs text-secondary">Primary</span>
                                        </li>
                                    </ul>
                                    <ng-template #noDocTpl><span class="text-placeholder">No doctor assigned</span></ng-template>
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <!-- Record -->
                    <section aria-labelledby="sd-record" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="sd-record" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Record</h3>
                        <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Created</dt>
                                <dd class="m-0 font-medium text-regular">{{ s.createdAt | date: 'd MMM y, HH:mm' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Last updated</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="s.updatedAt" [class.text-placeholder]="!s.updatedAt">{{ (s.updatedAt | date: 'd MMM y, HH:mm') || 'Never edited' }}</dd>
                            </div>
                            <div *ngIf="s.archivedAt">
                                <dt class="text-xs text-secondary">Archived</dt>
                                <dd class="m-0 font-medium text-regular">{{ s.archivedAt | date: 'd MMM y, HH:mm' }}</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canDelete" type="button" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="busy" (click)="remove.emit(s)">
                        <physio-icon name="trash" [size]="15" aria-hidden="true" />Delete
                    </button>
                    <button *ngIf="canUpdate" type="button" boo-button variant="primary" size="sm" aria-haspopup="dialog" [disabled]="busy" (click)="edit.emit(s)">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit service
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class CmsServiceDetailDrawerComponent {
    @Input() service: MedicalService | null = null;
    /** Department and doctor names, to resolve the ids the service is linked to. */
    @Input() departmentOptions: LookupOption[] = [];
    @Input() doctorOptions: LookupOption[] = [];
    @Input() canCreate = false;
    @Input() canUpdate = false;
    @Input() canDelete = false;
    /** A request for this service is in flight. */
    @Input() busy = false;
    /** The request in flight, to show progress on its button. */
    @Input() pending: ServiceMoveKind | 'duplicate' | 'delete' | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() edit = new EventEmitter<MedicalService>();
    @Output() remove = new EventEmitter<MedicalService>();
    @Output() duplicate = new EventEmitter<MedicalService>();
    @Output() transition = new EventEmitter<ServiceTransition>();

    readonly status = statusOf;
    readonly availability = availabilityOf;
    readonly moves = transitionsOf;
    readonly money = formatMoney;
    readonly duration = formatDuration;
    readonly bookingRule = bookingRuleOf;

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.service) this.close.emit();
    }

    /** Names of every linked department; ids the lookup doesn't know fall back to the list's primary name. */
    departments(s: MedicalService): string[] {
        const names = (s.departmentIds ?? [])
            .map(id => this.departmentOptions.find(o => o.value === id)?.label)
            .filter((n): n is string => !!n);
        if (names.length) return names;
        return s.primaryDepartmentName ? [s.primaryDepartmentName] : [];
    }

    /** The primary doctor first, then the others the lookup can name. */
    doctors(s: MedicalService): { name: string; primary: boolean }[] {
        const out: { name: string; primary: boolean }[] = [];
        if (s.primaryDoctorName) out.push({ name: s.primaryDoctorName, primary: true });
        for (const id of s.doctorIds ?? []) {
            if (id === s.primaryDoctorId) continue;
            const name = this.doctorOptions.find(o => o.value === id)?.label;
            if (name) out.push({ name, primary: false });
        }
        return out;
    }

    initial(name: string): string {
        return name.replace(/^(dr\.?\s+)/i, '').trim().charAt(0).toUpperCase();
    }
}
