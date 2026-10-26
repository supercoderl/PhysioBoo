import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { ComplaintPriority, ComplaintStatus } from '../../../../shared/enums/complaint';
import { Complaint } from '../../../../shared/types/complaint.types';
import {
    ALL_STATUSES,
    COMPLAINT_LIMITS,
    ComplaintMove,
    PRIORITY_OPTIONS,
    STATUS,
    ageLabel,
    categoryOf,
    isOpen,
    isRaised,
    movesOf,
    priorityOf,
    statusOf,
    subjectOf,
    ticketOf,
} from './complaint.utils';

/** What is in flight for the complaint on show, so the matching control shows progress. */
export type ComplaintBusy = ComplaintStatus | 'priority' | 'assign' | 'delete';

/**
 * One complaint: where it stands and the next steps, its priority and owner, what the patient reported, how to
 * reach them, and when it was logged, changed and resolved. Requests are handed to the page, which owns them.
 */
@Component({
    selector: 'crm-complaint-detail-drawer',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        FormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInputComponent,
        BooSelectComponent,
        BooStatusBadgeComponent,
        CustomScrollbarDirective,
    ],
    template: `
        <drawer [isOpen]="!!complaint" (close)="close.emit()">
            <div
                *ngIf="complaint as c"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="complaint-detail-title"
                [attr.aria-busy]="!!busy"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">
                            <span class="font-mono tabular-nums">{{ ticket(c) }}</span><span aria-hidden="true"> · </span>Logged {{ c.createdAt | date: 'd MMM y, HH:mm' }}
                        </p>
                        <h2 id="complaint-detail-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ subject(c) }}</h2>
                        <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <boo-status-badge dotted [label]="status(c).label" [tone]="status(c).tone" />
                            <boo-status-badge *ngIf="raised(c)" [label]="priority(c).label + ' priority'" [tone]="priority(c).tone" />
                            <boo-status-badge [label]="category(c)" tone="neutral" />
                            <span *ngIf="open(c)" class="text-xs text-secondary">Open since {{ age(c).toLowerCase() }}</span>
                        </div>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close complaint details" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <!-- Where the ticket stands and the next steps -->
                <div class="flex-none px-6 py-4 border-b border-rowDivider bg-body/60">
                    <ol class="m-0 p-0 list-none flex items-center gap-1.5" aria-label="Ticket progress">
                        <ng-container *ngFor="let s of statuses; let i = index; let last = last">
                            <li class="flex items-center gap-1.5 min-w-0" [attr.aria-current]="s === c.status ? 'step' : null">
                                <span
                                    class="flex-none w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-semibold"
                                    [ngClass]="stepClass(c, i)"
                                    aria-hidden="true"
                                >
                                    <physio-icon *ngIf="stepState(c, i) === 'done'; else stepNo" name="check" [size]="12" />
                                    <ng-template #stepNo>{{ i + 1 }}</ng-template>
                                </span>
                                <span
                                    class="text-xs truncate"
                                    [class.font-semibold]="s === c.status"
                                    [class.text-regular]="stepState(c, i) !== 'todo'"
                                    [class.text-secondary]="stepState(c, i) === 'todo'"
                                >{{ statusMeta[s].label }}<span class="sr-only">{{ stepSr(c, i) }}</span></span>
                            </li>
                            <li *ngIf="!last" class="flex-1 min-w-3 h-px" [ngClass]="stepState(c, i + 1) === 'todo' ? 'bg-borderGray' : 'bg-primary'" aria-hidden="true"></li>
                        </ng-container>
                    </ol>
                    <p class="m-0 mt-3 text-xs text-secondary">{{ status(c).hint }}</p>

                    <div *ngIf="canUpdate" class="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Change ticket status">
                        <button
                            *ngFor="let m of moves(c); let first = first"
                            type="button"
                            boo-button
                            size="sm"
                            [variant]="first ? 'primary' : 'secondary'"
                            [disabled]="!!busy"
                            [loading]="busy === m.to"
                            (click)="move.emit(m)"
                        >
                            <physio-icon *ngIf="busy !== m.to" [name]="m.icon" [size]="15" aria-hidden="true" />{{ m.label }}
                        </button>
                    </div>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <!-- Triage: priority and owner -->
                    <section aria-labelledby="cd-triage">
                        <h3 id="cd-triage" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Triage</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-[160px_minmax(0,1fr)] gap-x-6 gap-y-4">
                            <div>
                                <label for="cd-priority" class="block mb-1 text-xs text-secondary">Priority</label>
                                <boo-select
                                    *ngIf="canUpdate; else priorityTextTpl"
                                    id="cd-priority"
                                    size="small"
                                    [height]="36"
                                    label="Priority"
                                    required
                                    [searchable]="false"
                                    [options]="priorityOptions"
                                    [disabled]="!!busy"
                                    [(ngModel)]="priorityDraft"
                                    (ngModelChange)="onPriorityPicked(c, $event)"
                                />
                                <ng-template #priorityTextTpl>
                                    <p class="m-0 text-sm font-medium" [class.text-danger]="c.priority === Urgent" [class.text-regular]="c.priority !== Urgent">{{ priority(c).label }}</p>
                                </ng-template>
                                <p *ngIf="busy === 'priority'" class="m-0 mt-1 text-xs text-secondary" role="status">Saving…</p>
                            </div>

                            <div class="min-w-0">
                                <p class="m-0 mb-1 text-xs text-secondary" id="cd-owner-label">Owner</p>
                                <div *ngIf="!handingOver; else handOverTpl" class="flex flex-wrap items-center justify-between gap-2 min-h-9">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <physio-icon name="user-round" [size]="16" class="flex-none text-secondary" aria-hidden="true" />
                                        <span class="text-sm font-medium break-words" [class.text-regular]="c.assignedTo" [class.text-placeholder]="!c.assignedTo" aria-labelledby="cd-owner-label">{{ c.assignedTo || 'Unassigned' }}</span>
                                    </div>
                                    <div *ngIf="canUpdate" class="flex flex-wrap items-center gap-1.5">
                                        <button
                                            *ngIf="me && c.assignedTo !== me"
                                            type="button"
                                            boo-button
                                            variant="secondary"
                                            size="sm"
                                            [disabled]="!!busy"
                                            [loading]="busy === 'assign' && pendingOwner === me"
                                            (click)="assign.emit(me)"
                                        >{{ c.assignedTo ? 'Take over' : 'Assign to me' }}</button>
                                        <button type="button" boo-button variant="ghost" size="sm" [disabled]="!!busy" (click)="startHandOver(c)">Hand over</button>
                                        <button
                                            *ngIf="c.assignedTo"
                                            type="button"
                                            boo-button
                                            variant="ghost"
                                            size="sm"
                                            [disabled]="!!busy"
                                            [loading]="busy === 'assign' && pendingOwner === null"
                                            (click)="assign.emit(null)"
                                        >Unassign</button>
                                    </div>
                                </div>
                                <ng-template #handOverTpl>
                                    <form class="flex flex-wrap items-start gap-2" (ngSubmit)="submitHandOver(c)" novalidate>
                                        <boo-input
                                            class="flex-1 basis-48 min-w-0"
                                            name="cd-owner"
                                            size="small"
                                            label="Staff member's name"
                                            aria-labelledby="cd-owner-label"
                                            [maxlength]="limits.assignedTo"
                                            [(ngModel)]="ownerDraft"
                                            [ngModelOptions]="{ standalone: true }"
                                        />
                                        <button
                                            type="submit"
                                            boo-button
                                            variant="primary"
                                            size="sm"
                                            [disabled]="!ownerDraft.trim() || ownerDraft.trim() === c.assignedTo || (!!busy && busy !== 'assign')"
                                            [loading]="busy === 'assign'"
                                        >Assign</button>
                                        <button type="button" boo-button variant="ghost" size="sm" [disabled]="busy === 'assign'" (click)="handingOver = false">Cancel</button>
                                    </form>
                                </ng-template>
                            </div>
                        </div>
                    </section>

                    <!-- What the patient reported -->
                    <section aria-labelledby="cd-report" class="pt-5 border-t border-rowDivider">
                        <h3 id="cd-report" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Complaint</h3>
                        <p class="m-0 text-sm leading-6 text-regular whitespace-pre-wrap break-words">{{ c.description || 'No description given.' }}</p>
                    </section>

                    <!-- Who raised it -->
                    <section aria-labelledby="cd-patient" class="pt-5 border-t border-rowDivider">
                        <h3 id="cd-patient" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Raised by</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div class="min-w-0">
                                <dt class="text-xs text-secondary">Name</dt>
                                <dd class="m-0 font-medium text-regular break-words">{{ c.patientName || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Patient record</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="c.patientId" [class.text-placeholder]="!c.patientId">
                                    <span *ngIf="c.patientId; else notLinkedTpl" class="inline-flex items-center gap-1"><physio-icon name="link" [size]="14" aria-hidden="true" />Linked</span>
                                    <ng-template #notLinkedTpl>Not linked</ng-template>
                                </dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Phone</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums break-all">{{ c.phone || '—' }}</dd>
                            </div>
                            <div class="min-w-0">
                                <dt class="text-xs text-secondary">Email</dt>
                                <dd class="m-0 font-medium text-regular break-all">{{ c.email || '—' }}</dd>
                            </div>
                        </dl>
                        <div *ngIf="c.phone || c.email" class="mt-3 flex flex-wrap gap-2">
                            <a *ngIf="c.phone" boo-button variant="secondary" size="sm" [href]="'tel:' + c.phone" [attr.aria-label]="'Call ' + (c.patientName || 'the patient')">
                                <physio-icon name="phone" [size]="15" aria-hidden="true" />Call
                            </a>
                            <a *ngIf="c.email" boo-button variant="secondary" size="sm" [href]="mailto(c)" [attr.aria-label]="'Email ' + (c.patientName || 'the patient')">
                                <physio-icon name="mail" [size]="15" aria-hidden="true" />Reply by email
                            </a>
                        </div>
                    </section>

                    <!-- Timeline: only the dates the server keeps -->
                    <section aria-labelledby="cd-dates" class="pt-5 border-t border-rowDivider">
                        <h3 id="cd-dates" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Dates</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Logged</dt>
                                <dd class="m-0 font-medium text-regular">{{ c.createdAt | date: 'd MMM y, HH:mm' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Last changed</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="c.updatedAt" [class.text-placeholder]="!c.updatedAt">{{ (c.updatedAt | date: 'd MMM y, HH:mm') || 'Not changed' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Resolved</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="c.resolvedAt" [class.text-placeholder]="!c.resolvedAt">{{ (c.resolvedAt | date: 'd MMM y, HH:mm') || 'Not yet' }}</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <footer *ngIf="canUpdate || canDelete" class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canDelete" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="!!busy" [loading]="busy === 'delete'" (click)="remove.emit(c)">
                        <physio-icon *ngIf="busy !== 'delete'" name="trash" [size]="15" aria-hidden="true" />Delete
                    </button>
                    <button *ngIf="canUpdate" boo-button variant="secondary" size="sm" aria-haspopup="dialog" [disabled]="!!busy" (click)="edit.emit(c)">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit complaint
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class CrmComplaintDetailDrawerComponent implements OnChanges {
    @Input() complaint: Complaint | null = null;
    @Input() canUpdate = false;
    @Input() canDelete = false;
    /** A request about this complaint is in flight. */
    @Input() busy: ComplaintBusy | null = null;
    /** The owner being set while an assignment is in flight. */
    @Input() pendingOwner: string | null = null;
    /** The signed-in user's name, for "Assign to me". */
    @Input() me: string | null = null;
    /** Bumped by the page each time an assignment is saved, so the hand-over form can close. */
    @Input() assignSaved = 0;
    @Output() close = new EventEmitter<void>();
    @Output() edit = new EventEmitter<Complaint>();
    @Output() remove = new EventEmitter<Complaint>();
    @Output() move = new EventEmitter<ComplaintMove>();
    @Output() assign = new EventEmitter<string | null>();
    @Output() setPriority = new EventEmitter<ComplaintPriority>();

    readonly statuses = ALL_STATUSES;
    readonly statusMeta = STATUS;
    readonly priorityOptions = PRIORITY_OPTIONS;
    readonly limits = COMPLAINT_LIMITS;
    readonly Urgent = ComplaintPriority.Urgent;
    readonly subject = subjectOf;
    readonly ticket = ticketOf;
    readonly status = statusOf;
    readonly priority = priorityOf;
    readonly category = categoryOf;
    readonly moves = movesOf;
    readonly raised = isRaised;
    readonly open = isOpen;
    readonly age = ageLabel;

    /** The priority shown in the picker; put back to the saved value when a change fails. */
    priorityDraft: ComplaintPriority | null = null;
    handingOver = false;
    /** The name being typed for a hand-over; kept when saving fails. */
    ownerDraft = '';

    ngOnChanges(changes: SimpleChanges): void {
        const next = changes['complaint'];
        if (next) {
            const cur = next.currentValue as Complaint | null;
            const prev = next.previousValue as Complaint | null;
            // A different complaint starts with the hand-over form closed.
            if (cur?.id !== prev?.id) {
                this.handingOver = false;
                this.ownerDraft = '';
            }
            this.priorityDraft = cur?.priority ?? null;
        }
        if (changes['assignSaved'] && !changes['assignSaved'].firstChange) {
            this.handingOver = false;
            this.ownerDraft = '';
        }
        // When a priority save ends without a new complaint (it failed), show the saved value again.
        if (changes['busy'] && changes['busy'].previousValue === 'priority' && !this.busy) {
            this.priorityDraft = this.complaint?.priority ?? null;
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (!this.complaint) return;
        if (this.handingOver && this.busy !== 'assign') this.handingOver = false;
        else this.close.emit();
    }

    onPriorityPicked(c: Complaint, value: ComplaintPriority | null): void {
        if (value === null || value === c.priority || this.busy) return;
        this.setPriority.emit(value);
    }

    startHandOver(c: Complaint): void {
        this.ownerDraft = c.assignedTo ?? '';
        this.handingOver = true;
    }

    submitHandOver(c: Complaint): void {
        const name = this.ownerDraft.trim();
        if (!name || name === c.assignedTo || this.busy) return;
        this.assign.emit(name);
    }

    mailto(c: Complaint): string {
        return `mailto:${c.email}?subject=${encodeURIComponent(`Re: ${ticketOf(c)} – ${subjectOf(c)}`)}`;
    }

    /** Closed tickets show every step done; the resolved date is what tells staff when it was answered. */
    stepState(c: Complaint, i: number): 'done' | 'current' | 'todo' {
        const at = ALL_STATUSES.indexOf(c.status);
        if (i < at) return 'done';
        if (i === at) return c.status === ComplaintStatus.Closed ? 'done' : 'current';
        return 'todo';
    }

    stepClass(c: Complaint, i: number): string {
        switch (this.stepState(c, i)) {
            case 'done': return 'bg-primary border-primary text-white';
            case 'current': return 'bg-surface border-primary text-primaryDeep ring-2 ring-primary/20';
            default: return 'bg-surface border-borderGray text-secondary';
        }
    }

    stepSr(c: Complaint, i: number): string {
        const state = this.stepState(c, i);
        return state === 'done' ? ' (done)' : state === 'current' ? ' (current status)' : '';
    }
}
