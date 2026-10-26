import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { LeadService } from '../../../../services/admin/lead.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { LeadPriority, LeadStatus } from '../../../../shared/enums/lead';
import { CreateLeadRequest, Lead } from '../../../../shared/types/lead.types';
import { LEAD_LIMITS, PRIORITY_OPTIONS, SOURCES, STAGE_OPTIONS, displayName } from './lead.utils';

/**
 * Add (POST /api/leads) or edit (PATCH /api/leads/{id}) a lead. The update replaces every field, so the form always
 * sends the whole lead. Failures are reported by the global HTTP error toast and the form keeps what was entered.
 */
@Component({
    selector: 'crm-lead-edit-drawer',
    standalone: true,
    imports: [
        NgIf,
        ReactiveFormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInputComponent,
        BooSelectComponent,
        BooTextareaComponent,
        CustomScrollbarDirective,
    ],
    template: `
        <drawer [isOpen]="open" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="open"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="lead-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">{{ lead ? 'Edit lead' : 'New lead' }}</p>
                        <h2 id="lead-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">
                            {{ lead ? name(lead) : 'Add a lead' }}
                        </h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">
                            <ng-container *ngIf="!lead">Someone who called, walked in or was referred. </ng-container>Fields marked <span class="text-danger">*</span> are required.
                        </p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close lead form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <!-- Contact -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Contact</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="sm:col-span-2">
                                <label for="le-name" class="block mb-1 text-[13px] font-medium text-regular">Full name <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="le-name" formControlName="name" label="e.g. Nguyen Van An" [maxlength]="limits.name" />
                            </div>
                            <div>
                                <label for="le-phone" class="block mb-1 text-[13px] font-medium text-regular">Phone <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="le-phone" type="tel" formControlName="phone" label="e.g. 0901 234 567" [maxlength]="limits.phone" />
                            </div>
                            <div>
                                <label for="le-email" class="block mb-1 text-[13px] font-medium text-regular">Email <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="le-email" type="email" formControlName="email" label="name@example.com" [maxlength]="limits.email" />
                            </div>
                        </div>
                    </fieldset>

                    <!-- Enquiry -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Enquiry</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="sm:col-span-2">
                                <label for="le-service" class="block mb-1 text-[13px] font-medium text-regular">Interested in <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="le-service" formControlName="service" label="e.g. Physiotherapy for lower back pain" [maxlength]="limits.service" />
                            </div>
                            <div>
                                <label for="le-source" class="block mb-1 text-[13px] font-medium text-regular">Source <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="le-source" formControlName="source" label="Source" required [options]="sourceOptions" />
                            </div>
                            <div>
                                <label for="le-priority" class="block mb-1 text-[13px] font-medium text-regular">Priority <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="le-priority" formControlName="priority" label="Priority" required [options]="priorityOptions" />
                            </div>
                            <div>
                                <label for="le-status" class="block mb-1 text-[13px] font-medium text-regular">Stage <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-select id="le-status" formControlName="status" label="Stage" required [options]="stageOptions" />
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Follow-up -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Follow-up</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <div class="flex items-end justify-between gap-2 mb-1">
                                    <label for="le-owner" class="block text-[13px] font-medium text-regular">Owner</label>
                                    <button
                                        *ngIf="me && form.controls.assignedTo.value !== me"
                                        type="button"
                                        boo-button
                                        variant="link"
                                        size="sm"
                                        classname="!h-auto"
                                        (click)="assignToMe()"
                                    >Assign to me</button>
                                </div>
                                <boo-input name="le-owner" formControlName="assignedTo" label="Who will follow this lead up" [maxlength]="limits.assignedTo" />
                            </div>
                            <div>
                                <label for="le-notes" class="block mb-1 text-[13px] font-medium text-regular">Notes</label>
                                <boo-textarea id="le-notes" formControlName="notes" label="What they asked about, when to call back…" [rows]="6" [maxlength]="limits.notes" />
                                <p class="m-0 mt-1 text-xs text-secondary text-right tabular-nums">{{ form.controls.notes.value.length }} / {{ limits.notes }}</p>
                            </div>
                        </div>
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!!lead && !form.dirty">
                        {{ lead ? 'Save changes' : 'Add lead' }}
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CrmLeadEditDrawerComponent implements OnChanges {
    /** The drawer is open while this is true. */
    @Input() open = false;
    /** The lead being edited; null adds a new one. */
    @Input() lead: Lead | null = null;
    /** The signed-in user's name, for "Assign to me". */
    @Input() me: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<{ lead: Lead; created: boolean }>();

    private readonly fb = inject(FormBuilder);
    private readonly leadSrv = inject(LeadService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly limits = LEAD_LIMITS;
    readonly stageOptions = STAGE_OPTIONS;
    readonly priorityOptions = PRIORITY_OPTIONS;
    readonly name = displayName;
    sourceOptions = SOURCES.map(s => ({ value: s, label: s }));

    readonly form = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.maxLength(LEAD_LIMITS.name)]],
        phone: ['', [Validators.required, Validators.maxLength(LEAD_LIMITS.phone)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(LEAD_LIMITS.email)]],
        service: ['', [Validators.required, Validators.maxLength(LEAD_LIMITS.service)]],
        source: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(LEAD_LIMITS.source)]),
        status: this.fb.nonNullable.control<LeadStatus>(LeadStatus.New, Validators.required),
        priority: this.fb.nonNullable.control<LeadPriority>(LeadPriority.Medium, Validators.required),
        assignedTo: ['', Validators.maxLength(LEAD_LIMITS.assignedTo)],
        notes: ['', Validators.maxLength(LEAD_LIMITS.notes)],
    });

    submitting = false;

    ngOnChanges(changes: SimpleChanges): void {
        // Opening the drawer starts from the lead's saved values, or a blank form for a new lead.
        if (changes['open'] && this.open) this.fill(this.lead);
        else if (changes['lead'] && this.open && this.lead?.id !== (changes['lead'].previousValue as Lead | null)?.id) this.fill(this.lead);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    assignToMe(): void {
        if (!this.me) return;
        this.form.controls.assignedTo.setValue(this.me);
        this.form.controls.assignedTo.markAsDirty();
    }

    submit(): void {
        if (!this.open || this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: 'center' }));
            return;
        }

        const body = this.buildRequest();
        const editing = this.lead;
        this.submitting = true;
        const id$: Observable<string> = editing
            ? this.leadSrv.update(editing.id, body).pipe(map(() => editing.id))
            : this.leadSrv.create(body).pipe(map(res => {
                if (!res?.success || !res.data) throw new Error('No id returned');
                return res.data;
            }));

        id$
            .pipe(
                // The save returns no lead; read it back so the list shows what the server stored.
                switchMap(id => this.leadSrv.search_by_id(id).pipe(
                    map(res => res?.success && res.data ? res.data : this.fallback(id, body)),
                    catchError(() => of(this.fallback(id, body))),
                )),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: lead => {
                    this.form.markAsPristine();
                    this.saved.emit({ lead, created: !editing });
                },
                // The global HTTP error toast reports the failure; the form keeps what was entered.
                error: () => undefined,
            });
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.discard();
    }

    /** Called once leaving is confirmed (the drawer backdrop asks itself when the form is dirty). */
    discard(): void {
        if (this.submitting) return;
        this.form.markAsPristine();
        this.close.emit();
    }

    private fill(l: Lead | null): void {
        // Keep a source the list doesn't know about (typed elsewhere) selectable.
        const known = SOURCES.map(s => ({ value: s, label: s }));
        this.sourceOptions = l?.source && !SOURCES.includes(l.source) ? [{ value: l.source, label: l.source }, ...known] : known;
        this.form.reset({
            name: l?.name ?? '',
            phone: l?.phone ?? '',
            email: l?.email ?? '',
            service: l?.service ?? '',
            source: l?.source || null,
            status: l?.status ?? LeadStatus.New,
            priority: l?.priority ?? LeadPriority.Medium,
            assignedTo: l?.assignedTo ?? '',
            notes: l?.notes ?? '',
        });
        // A lead from the website may have no email; show why it can't be saved yet straight away.
        if (l && !l.email) this.form.controls.email.markAsTouched();
    }

    private buildRequest(): CreateLeadRequest {
        const v = this.form.getRawValue();
        return {
            name: v.name.trim(),
            phone: v.phone.trim(),
            email: v.email.trim(),
            service: v.service.trim(),
            source: v.source!,
            status: v.status,
            priority: v.priority,
            assignedTo: v.assignedTo.trim() || null,
            notes: v.notes.trim() || null,
        };
    }

    private fallback(id: string, body: CreateLeadRequest): Lead {
        return { ...body, id, createdAt: this.lead?.createdAt ?? new Date().toISOString() };
    }
}
