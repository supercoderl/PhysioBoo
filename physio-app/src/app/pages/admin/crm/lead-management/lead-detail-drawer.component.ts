import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { LeadPriority, LeadStatus } from '../../../../shared/enums/lead';
import { Lead } from '../../../../shared/types/lead.types';
import {
    LeadMove,
    NEEDS_EMAIL,
    PIPELINE,
    STAGE,
    ageLabel,
    canSave,
    displayName,
    isWaiting,
    movesOf,
    noteRoom,
    priorityOf,
    stageOf,
    waitLabel,
} from './lead.utils';

/** What is in flight for the lead on show, so the matching control shows progress. */
export type LeadBusy = LeadStatus | 'delete' | 'assign' | 'note';

/**
 * One lead: where it is in the pipeline and the moves from there, how to reach them, what they asked about, who
 * owns the follow-up, and the notes log. Requests are handed to the list, which owns them.
 */
@Component({
    selector: 'crm-lead-detail-drawer',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        FormsModule,
        RouterLink,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooStatusBadgeComponent,
        BooTextareaComponent,
        CustomScrollbarDirective,
    ],
    template: `
        <drawer [isOpen]="!!lead" (close)="close.emit()">
            <div
                *ngIf="lead as l"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="lead-detail-title"
                [attr.aria-busy]="!!busy"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">
                            Received {{ l.createdAt | date: 'd MMM y, HH:mm' }}<span aria-hidden="true"> · </span>{{ l.source || 'Unknown source' }}
                        </p>
                        <h2 id="lead-detail-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ name(l) }}</h2>
                        <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <boo-status-badge dotted [label]="stage(l).label" [tone]="stage(l).tone" />
                            <boo-status-badge *ngIf="l.priority === High" label="High priority" tone="danger" />
                            <span *ngIf="waiting(l)" class="text-xs font-medium text-amber-700">{{ wait(l) }}</span>
                        </div>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close lead details" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <!-- Pipeline position and the moves from here -->
                <div class="flex-none px-6 py-4 border-b border-rowDivider bg-body/60">
                    <ol class="m-0 p-0 list-none flex items-center gap-1.5" aria-label="Lead progress">
                        <ng-container *ngFor="let s of pipeline; let i = index; let last = last">
                            <li class="flex items-center gap-1.5 min-w-0" [attr.aria-current]="s === l.status ? 'step' : null">
                                <span
                                    class="flex-none w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-semibold"
                                    [ngClass]="stepClass(l, i)"
                                    aria-hidden="true"
                                >
                                    <physio-icon *ngIf="stepState(l, i) === 'done'; else stepNo" name="check" [size]="12" />
                                    <ng-template #stepNo>{{ i + 1 }}</ng-template>
                                </span>
                                <span
                                    class="text-xs truncate"
                                    [class.font-semibold]="s === l.status"
                                    [class.text-regular]="stepState(l, i) !== 'todo'"
                                    [class.text-secondary]="stepState(l, i) === 'todo'"
                                >{{ stages[s].label }}<span class="sr-only">{{ stepSr(l, i) }}</span></span>
                            </li>
                            <li *ngIf="!last" class="flex-1 min-w-3 h-px" [ngClass]="stepState(l, i + 1) === 'todo' ? 'bg-borderGray' : 'bg-primary'" aria-hidden="true"></li>
                        </ng-container>
                    </ol>
                    <p class="m-0 mt-3 text-xs" [class.text-secondary]="l.status !== Lost" [class.text-danger]="l.status === Lost">
                        <ng-container *ngIf="l.status === Lost">Marked as lost. </ng-container>{{ stage(l).hint }}
                    </p>

                    <ng-container *ngIf="canUpdate">
                        <div *ngIf="savable(l); else needsEmailTpl" class="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Change lead stage">
                            <button
                                *ngFor="let m of moves(l); let first = first"
                                type="button"
                                boo-button
                                size="sm"
                                [variant]="first && !m.danger ? 'primary' : m.danger ? 'ghost' : 'secondary'"
                                [ngClass]="m.danger ? '!text-danger ml-auto' : ''"
                                [disabled]="!!busy"
                                [loading]="busy === m.to"
                                (click)="move.emit(m)"
                            >
                                <physio-icon *ngIf="busy !== m.to" [name]="m.icon" [size]="15" aria-hidden="true" />{{ m.label }}
                            </button>
                        </div>
                        <ng-template #needsEmailTpl>
                            <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-amber-700" role="note">
                                <span class="flex items-start gap-1.5 min-w-0 flex-1 basis-60">
                                    <physio-icon name="circle-alert" [size]="14" class="flex-none mt-px" aria-hidden="true" />{{ needsEmail }}
                                </span>
                                <button type="button" boo-button variant="secondary" size="sm" aria-haspopup="dialog" [disabled]="!!busy" (click)="edit.emit(l)">
                                    <physio-icon name="pencil" [size]="15" aria-hidden="true" />Add email
                                </button>
                            </div>
                        </ng-template>
                    </ng-container>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <!-- Contact -->
                    <section aria-labelledby="ld-contact">
                        <h3 id="ld-contact" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Contact</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Phone</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums break-all">{{ l.phone || '—' }}</dd>
                            </div>
                            <div class="min-w-0">
                                <dt class="text-xs text-secondary">Email</dt>
                                <dd class="m-0 font-medium break-all" [class.text-regular]="l.email" [class.text-placeholder]="!l.email">{{ l.email || 'No email on file' }}</dd>
                            </div>
                        </dl>
                        <div *ngIf="l.phone || l.email" class="mt-3 flex flex-wrap gap-2">
                            <a *ngIf="l.phone" boo-button variant="secondary" size="sm" [href]="'tel:' + l.phone" [attr.aria-label]="'Call ' + name(l)">
                                <physio-icon name="phone" [size]="15" aria-hidden="true" />Call
                            </a>
                            <a *ngIf="l.email" boo-button variant="secondary" size="sm" [href]="'mailto:' + l.email" [attr.aria-label]="'Email ' + name(l)">
                                <physio-icon name="mail" [size]="15" aria-hidden="true" />Email
                            </a>
                        </div>
                    </section>

                    <!-- Interest -->
                    <section aria-labelledby="ld-interest" class="pt-5 border-t border-rowDivider">
                        <h3 id="ld-interest" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Enquiry</h3>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div class="sm:col-span-2 min-w-0">
                                <dt class="text-xs text-secondary">Interested in</dt>
                                <dd class="m-0 font-medium text-regular break-words">{{ l.service || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Source</dt>
                                <dd class="m-0 font-medium text-regular break-words">{{ l.source || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Priority</dt>
                                <dd class="m-0 font-medium" [class.text-danger]="l.priority === High" [class.text-regular]="l.priority !== High">{{ priority(l).label }}</dd>
                            </div>
                        </dl>
                        <p *ngIf="registerLink && (l.status === Qualified || l.status === Converted)" class="m-0 mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-secondary">
                            <physio-icon name="user-plus" [size]="14" aria-hidden="true" />
                            Marking a lead converted doesn't create a patient record.
                            <a boo-button variant="link" size="sm" [routerLink]="registerLink" (click)="close.emit()">Register at reception</a>
                        </p>
                    </section>

                    <!-- Owner -->
                    <section aria-labelledby="ld-owner" class="pt-5 border-t border-rowDivider">
                        <h3 id="ld-owner" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Follow-up owner</h3>
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="flex items-center gap-2 min-w-0">
                                <physio-icon name="user-round" [size]="16" class="flex-none text-secondary" aria-hidden="true" />
                                <span class="text-sm font-medium break-words" [class.text-regular]="l.assignedTo" [class.text-placeholder]="!l.assignedTo">{{ l.assignedTo || 'Unassigned' }}</span>
                            </div>
                            <div *ngIf="canUpdate && savable(l)" class="flex items-center gap-2">
                                <button
                                    *ngIf="me && l.assignedTo !== me"
                                    type="button"
                                    boo-button
                                    variant="secondary"
                                    size="sm"
                                    [disabled]="!!busy"
                                    [loading]="busy === 'assign' && pendingOwner === me"
                                    (click)="assign.emit(me)"
                                >{{ l.assignedTo ? 'Take over' : 'Assign to me' }}</button>
                                <button
                                    *ngIf="l.assignedTo"
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
                    </section>

                    <!-- Notes log -->
                    <section aria-labelledby="ld-notes" class="pt-5 border-t border-rowDivider">
                        <h3 id="ld-notes" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Notes</h3>
                        <p *ngIf="l.notes; else noNotesTpl" class="m-0 text-sm text-regular whitespace-pre-wrap break-words">{{ l.notes }}</p>
                        <ng-template #noNotesTpl><p class="m-0 text-sm text-placeholder">No notes yet</p></ng-template>

                        <form *ngIf="canUpdate && savable(l)" class="mt-4" (ngSubmit)="submitNote(l)" novalidate>
                            <label for="ld-note" class="block mb-1 text-[13px] font-medium text-regular">Log a follow-up</label>
                            <boo-textarea
                                id="ld-note"
                                name="ld-note"
                                label="e.g. Called, left a voicemail. Try again Thursday."
                                [rows]="3"
                                [maxlength]="room(l)"
                                [(ngModel)]="draft"
                                [ngModelOptions]="{ standalone: true }"
                                aria-describedby="ld-note-hint"
                            />
                            <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
                                <p id="ld-note-hint" class="m-0 text-xs" [class.text-secondary]="room(l) > 0" [class.text-danger]="room(l) <= 0">
                                    <ng-container *ngIf="room(l) > 0; else fullTpl">Added to the notes with today's date{{ me ? ' and your name' : '' }} · {{ room(l) - draft.length }} characters left</ng-container>
                                    <ng-template #fullTpl>The notes are full. Edit the lead to shorten them first.</ng-template>
                                </p>
                                <button
                                    type="submit"
                                    boo-button
                                    variant="secondary"
                                    size="sm"
                                    [disabled]="!draft.trim() || room(l) <= 0 || (!!busy && busy !== 'note')"
                                    [loading]="busy === 'note'"
                                ><physio-icon *ngIf="busy !== 'note'" name="sticky-note" [size]="15" aria-hidden="true" />Add note</button>
                            </div>
                        </form>
                    </section>
                </div>

                <footer *ngIf="canUpdate || canDelete" class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canDelete" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="!!busy" [loading]="busy === 'delete'" (click)="remove.emit(l)">
                        <physio-icon *ngIf="busy !== 'delete'" name="trash" [size]="15" aria-hidden="true" />Delete
                    </button>
                    <button *ngIf="canUpdate" boo-button variant="secondary" size="sm" aria-haspopup="dialog" [disabled]="!!busy" (click)="edit.emit(l)">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit lead
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class CrmLeadDetailDrawerComponent implements OnChanges {
    @Input() lead: Lead | null = null;
    @Input() canUpdate = false;
    @Input() canDelete = false;
    /** A request about this lead is in flight. */
    @Input() busy: LeadBusy | null = null;
    /** The owner being set while an assignment is in flight. */
    @Input() pendingOwner: string | null = null;
    /** The signed-in user's name, for "Assign to me" and signing notes. */
    @Input() me: string | null = null;
    /** Where new patients are registered, when the user may do so. */
    @Input() registerLink: string | null = null;
    /** Bumped by the list each time a note is saved, so the draft can be cleared. */
    @Input() noteSaved = 0;
    @Output() close = new EventEmitter<void>();
    @Output() edit = new EventEmitter<Lead>();
    @Output() remove = new EventEmitter<Lead>();
    @Output() move = new EventEmitter<LeadMove>();
    @Output() assign = new EventEmitter<string | null>();
    @Output() addNote = new EventEmitter<string>();

    readonly pipeline = PIPELINE;
    readonly stages = STAGE;
    readonly needsEmail = NEEDS_EMAIL;
    readonly High = LeadPriority.High;
    readonly Lost = LeadStatus.Lost;
    readonly Qualified = LeadStatus.Qualified;
    readonly Converted = LeadStatus.Converted;
    readonly name = displayName;
    readonly stage = stageOf;
    readonly priority = priorityOf;
    readonly moves = movesOf;
    readonly savable = canSave;
    readonly waiting = isWaiting;
    readonly age = ageLabel;
    readonly wait = waitLabel;

    /** The note being written; kept when saving fails. */
    draft = '';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['noteSaved'] && !changes['noteSaved'].firstChange) this.draft = '';
        const lead = changes['lead'];
        // A different lead starts with an empty note.
        if (lead && (lead.currentValue as Lead | null)?.id !== (lead.previousValue as Lead | null)?.id) this.draft = '';
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.lead) this.close.emit();
    }

    room(l: Lead): number {
        return Math.max(0, noteRoom(l.notes, this.me));
    }

    submitNote(l: Lead): void {
        const text = this.draft.trim();
        if (!text || this.busy || text.length > this.room(l)) return;
        this.addNote.emit(text);
    }

    /** Lost leads show the path they left greyed out. */
    stepState(l: Lead, i: number): 'done' | 'current' | 'todo' {
        if (l.status === LeadStatus.Lost) return 'todo';
        const at = PIPELINE.indexOf(l.status);
        if (i < at) return 'done';
        if (i === at) return l.status === LeadStatus.Converted ? 'done' : 'current';
        return 'todo';
    }

    stepClass(l: Lead, i: number): string {
        switch (this.stepState(l, i)) {
            case 'done': return 'bg-primary border-primary text-white';
            case 'current': return 'bg-surface border-primary text-primaryDeep ring-2 ring-primary/20';
            default: return 'bg-surface border-borderGray text-secondary';
        }
    }

    stepSr(l: Lead, i: number): string {
        const state = this.stepState(l, i);
        return state === 'done' ? ' (done)' : state === 'current' ? ' (current stage)' : '';
    }
}
