import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { MedicalServiceService } from '../../../../services/admin/medical-service.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { CreateServiceRequest, MedicalService, ServiceAvailability, ServiceStatus } from '../../../../shared/types/service.types';
import { AVAILABILITY_OPTIONS, CURRENCY_OPTIONS, LookupOption, STATUS } from './service.utils';

/** Column limits from the medical service table and the server validators. */
const MAX = { code: 32, name: 120, shortName: 60, description: 2000 };

/**
 * Add a service (POST /api/medical-services) or edit one (PATCH /api/medical-services/{id}).
 * The form edits the primary department and doctor; any other departments and doctors the service is linked to are
 * kept. Failures are reported by the global HTTP error toast and the form keeps what was entered.
 */
@Component({
    selector: 'cms-service-edit-drawer',
    standalone: true,
    imports: [
        NgIf,
        ReactiveFormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInputComponent,
        BooCheckboxComponent,
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
                aria-labelledby="service-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">{{ service ? 'Edit service' : 'New service' }}</p>
                        <h2 id="service-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">
                            {{ service ? service.name : 'Add a service to the catalog' }}
                        </h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close service form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <!-- Identity -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Identity</legend>
                        <div class="flex flex-col gap-4">
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label for="se-code" class="block mb-1 text-[13px] font-medium text-regular">Code <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="se-code" formControlName="code" label="Code" [maxlength]="max.code" />
                                    <p class="m-0 mt-1 text-xs text-secondary">Unique, e.g. ECG-001.</p>
                                </div>
                                <div class="sm:col-span-2">
                                    <label for="se-name" class="block mb-1 text-[13px] font-medium text-regular">Name <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="se-name" formControlName="name" label="Service name" [maxlength]="max.name" />
                                </div>
                            </div>
                            <div>
                                <label for="se-short" class="block mb-1 text-[13px] font-medium text-regular">Short name</label>
                                <boo-input name="se-short" formControlName="shortName" label="Short name" [maxlength]="max.shortName" />
                                <p class="m-0 mt-1 text-xs" [class.text-secondary]="!clearedOnEdit('shortName')" [class.text-amber-700]="clearedOnEdit('shortName')">
                                    {{ clearedOnEdit('shortName') ? keepNote : 'Optional. Used where space is tight, and searchable.' }}
                                </p>
                            </div>
                            <div>
                                <div class="flex items-baseline justify-between gap-3 mb-1">
                                    <label for="se-desc" class="text-[13px] font-medium text-regular">Description</label>
                                    <span class="text-xs text-secondary tabular-nums" aria-live="polite">{{ form.controls.description.value.length }} / {{ max.description }}</span>
                                </div>
                                <boo-textarea id="se-desc" formControlName="description" label="What the service includes and how patients should prepare" [rows]="4" [maxlength]="max.description" />
                                <p *ngIf="clearedOnEdit('description')" class="m-0 mt-1 text-xs text-amber-700">{{ keepNote }}</p>
                            </div>
                        </div>
                    </fieldset>

                    <!-- Departments and doctors -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Departments and doctors</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="se-dept" class="block mb-1 text-[13px] font-medium text-regular">Primary department</label>
                                <boo-select id="se-dept" formControlName="departmentId" label="No department" [options]="departmentOptions" />
                                <p class="m-0 mt-1 text-xs text-secondary">
                                    <ng-container *ngIf="!departmentOptions.length">No departments to choose from.</ng-container>
                                    <ng-container *ngIf="departmentOptions.length && extraDepartments">Also linked to {{ extraDepartments }} other {{ extraDepartments === 1 ? 'department' : 'departments' }}, which stay linked.</ng-container>
                                </p>
                            </div>
                            <div>
                                <label for="se-doctor" class="block mb-1 text-[13px] font-medium text-regular">Primary doctor</label>
                                <boo-select id="se-doctor" formControlName="doctorId" label="No doctor" [options]="doctorOptions" />
                                <p class="m-0 mt-1 text-xs" [class.text-secondary]="!clearedOnEdit('doctorId')" [class.text-amber-700]="clearedOnEdit('doctorId')">
                                    <ng-container *ngIf="clearedOnEdit('doctorId')">{{ keepNote }}</ng-container>
                                    <ng-container *ngIf="!clearedOnEdit('doctorId') && !doctorOptions.length">No doctors to choose from.</ng-container>
                                    <ng-container *ngIf="!clearedOnEdit('doctorId') && doctorOptions.length && extraDoctors">{{ extraDoctors }} other {{ extraDoctors === 1 ? 'doctor stays' : 'doctors stay' }} assigned.</ng-container>
                                </p>
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Price -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Price</legend>
                        <div class="flex flex-col gap-4">
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div class="sm:col-span-2">
                                    <label for="se-price" class="block mb-1 text-[13px] font-medium text-regular">Base price <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="se-price" type="number" formControlName="basePrice" label="Base price" />
                                    <p class="m-0 mt-1 text-xs text-secondary">0 or more. Use 0 for free services.</p>
                                </div>
                                <div>
                                    <label for="se-currency" class="block mb-1 text-[13px] font-medium text-regular">Currency <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="se-currency" formControlName="currency" label="Currency" required [options]="currencyOptions" />
                                </div>
                            </div>
                            <boo-checkbox name="se-vat" formControlName="vatIncluded" label="The base price includes VAT" />
                        </div>
                    </fieldset></div>

                    <!-- Booking -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Booking</legend>
                        <div class="flex flex-col gap-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="se-duration" class="block mb-1 text-[13px] font-medium text-regular">Duration (minutes) <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="se-duration" type="number" formControlName="durationMinutes" label="Duration" />
                                    <p class="m-0 mt-1 text-xs text-secondary">Whole minutes, at least 1.</p>
                                </div>
                                <div>
                                    <label for="se-availability" class="block mb-1 text-[13px] font-medium text-regular">Availability <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="se-availability" formControlName="availability" label="Availability" required [options]="availabilityOptions" />
                                </div>
                            </div>
                            <div class="flex flex-col gap-2.5">
                                <boo-checkbox name="se-appt" formControlName="requiresAppointment" label="Patients must book an appointment" />
                                <boo-checkbox name="se-ref" formControlName="requiresReferral" label="A referral is required" />
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Lifecycle -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Status</legend>
                        <div class="sm:w-1/2 sm:pr-2">
                            <label for="se-status" class="block mb-1 text-[13px] font-medium text-regular">Status <span class="text-danger" aria-hidden="true">*</span></label>
                            <boo-select id="se-status" formControlName="status" label="Status" required [options]="statusOptions" />
                            <p class="m-0 mt-1 text-xs text-secondary">{{ statusHint }}</p>
                        </div>
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!!service && !form.dirty">
                        {{ submitLabel }}
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CmsServiceEditDrawerComponent implements OnChanges {
    /** Open the drawer; with no service it creates a new one. */
    @Input() open = false;
    /** The service being edited, or null to add a new one. */
    @Input() service: MedicalService | null = null;
    @Input() departmentOptions: LookupOption[] = [];
    @Input() doctorOptions: LookupOption[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<{ service: MedicalService | null; id: string; created: boolean }>();

    private readonly fb = inject(FormBuilder);
    private readonly srv = inject(MedicalServiceService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly max = MAX;
    readonly currencyOptions = CURRENCY_OPTIONS;
    readonly availabilityOptions = AVAILABILITY_OPTIONS;
    /** The server ignores empty values on update, so clearing a saved value doesn't stick. */
    readonly keepNote = 'Clearing this isn’t saved yet; the current value is kept.';

    readonly form = this.fb.group({
        code: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(MAX.code)]),
        name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(MAX.name)]),
        shortName: this.fb.nonNullable.control('', Validators.maxLength(MAX.shortName)),
        description: this.fb.nonNullable.control('', Validators.maxLength(MAX.description)),
        departmentId: this.fb.control<string | null>(null),
        doctorId: this.fb.control<string | null>(null),
        basePrice: this.fb.control<number | string | null>(null, [Validators.required, Validators.min(0)]),
        currency: this.fb.nonNullable.control('VND', Validators.required),
        vatIncluded: this.fb.nonNullable.control(false),
        durationMinutes: this.fb.control<number | string | null>(30, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
        availability: this.fb.nonNullable.control<ServiceAvailability>('Available', Validators.required),
        requiresAppointment: this.fb.nonNullable.control(true),
        requiresReferral: this.fb.nonNullable.control(false),
        status: this.fb.nonNullable.control<ServiceStatus>('Draft', Validators.required),
    });

    submitting = false;
    /** Set when the form opens. Archiving has its own action; it is offered here only to keep an archived service's value. */
    statusOptions: { label: string; value: ServiceStatus }[] = [];

    get statusHint(): string {
        return STATUS[this.form.controls.status.value]?.hint ?? '';
    }

    get submitLabel(): string {
        if (this.service) return 'Save changes';
        return this.form.controls.status.value === 'Active' ? 'Add and publish' : 'Add as draft';
    }

    /** Linked departments other than the primary one, which the form leaves alone. */
    get extraDepartments(): number {
        return this.restOf(this.service?.departmentIds, this.service?.departmentIds?.[0], this.form.controls.departmentId.value).length;
    }

    get extraDoctors(): number {
        return this.restOf(this.service?.doctorIds, this.service?.primaryDoctorId, this.form.controls.doctorId.value).length;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes['open']?.currentValue === true && !changes['open'].previousValue;
        const prev = changes['service']?.previousValue as MedicalService | null | undefined;
        const swapped = !!changes['service'] && this.service?.id !== prev?.id;
        if (this.open && (opened || swapped)) this.fill(this.service);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    /** A saved value was cleared, which the update endpoint won't apply. */
    clearedOnEdit(field: 'shortName' | 'description' | 'doctorId'): boolean {
        const s = this.service;
        if (!s) return false;
        const saved = field === 'doctorId' ? s.primaryDoctorId : s[field];
        return !!saved && !this.form.controls[field].value;
    }

    submit(): void {
        if (!this.open || this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: 'center' }));
            return;
        }

        const existing = this.service;
        const body = this.buildBody();
        const save$: Observable<string> = existing
            ? this.srv.update(existing.id, body).pipe(map(() => existing.id))
            : this.srv.create(body).pipe(map(res => {
                if (!res?.success || !res.data) throw new Error('Service was not created');
                return res.data;
            }));

        this.submitting = true;
        save$
            .pipe(
                // The write returns only the id; read the record back so the page shows what the server stored.
                switchMap(id => this.srv.search_by_id(id).pipe(map(res => ({ id, res })))),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: ({ id, res }) => {
                    this.form.markAsPristine();
                    this.saved.emit({ service: res?.success && res.data ? res.data : null, id, created: !existing });
                },
                // The global HTTP error toast reports the failure (e.g. a duplicate code); the form keeps its values.
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

    private fill(s: MedicalService | null): void {
        const statuses: ServiceStatus[] = !s
            ? ['Draft', 'Active']
            : s.status === 'Archived' ? ['Draft', 'Active', 'Inactive', 'Archived'] : ['Draft', 'Active', 'Inactive'];
        this.statusOptions = statuses.map(value => ({ value, label: STATUS[value].label }));
        this.form.reset({
            code: s?.code ?? '',
            name: s?.name ?? '',
            shortName: s?.shortName ?? '',
            description: s?.description ?? '',
            departmentId: s?.departmentIds?.[0] ?? null,
            doctorId: s?.primaryDoctorId ?? null,
            basePrice: s ? s.basePrice : null,
            currency: s?.currency || 'VND',
            vatIncluded: s?.vatIncluded ?? false,
            durationMinutes: s?.durationMinutes ?? 30,
            availability: s?.availability ?? 'Available',
            requiresAppointment: s?.requiresAppointment ?? true,
            requiresReferral: s?.requiresReferral ?? false,
            status: s?.status ?? 'Draft',
        });
    }

    private buildBody(): CreateServiceRequest {
        const v = this.form.getRawValue();
        const s = this.service;
        const deptRest = this.restOf(s?.departmentIds, s?.departmentIds?.[0], v.departmentId);
        const docRest = this.restOf(s?.doctorIds, s?.primaryDoctorId, v.doctorId);
        return {
            code: v.code.trim(),
            name: v.name.trim(),
            shortName: v.shortName.trim() || null,
            description: v.description.trim() || null,
            departmentIds: v.departmentId ? [v.departmentId, ...deptRest] : deptRest,
            // Category and tags have no editor yet; send what is stored so nothing is lost.
            categoryId: s?.categoryId ?? null,
            tags: s?.tags ?? [],
            status: v.status,
            availability: v.availability,
            basePrice: Number(v.basePrice),
            currency: v.currency,
            vatIncluded: v.vatIncluded,
            durationMinutes: Number(v.durationMinutes),
            requiresAppointment: v.requiresAppointment,
            requiresReferral: v.requiresReferral,
            primaryDoctorId: v.doctorId || null,
            doctorIds: v.doctorId ? [v.doctorId, ...docRest] : docRest,
            hospitalId: s?.hospitalId ?? null,
        };
    }

    /** Linked ids other than the saved primary and the one now picked. */
    private restOf(ids: string[] | undefined, savedPrimary: string | null | undefined, picked: string | null): string[] {
        return (ids ?? []).filter(id => id !== savedPrimary && id !== picked);
    }
}
