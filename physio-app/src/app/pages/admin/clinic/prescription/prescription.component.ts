import { HttpErrorResponse } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooIconComponent,
    BooInlineErrorComponent,
} from '@physioboo/ui';
import { Subscription, combineLatest, filter, finalize, take } from 'rxjs';
import { PrescriptionService } from '../../../../services/admin/prescription.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import {
    CdsCheckRequest,
    PatientPrescriptionRow,
    Prescription,
    PrescriptionItemInput,
    PrescriptionStatus,
    normalizePrescriptionStatus,
} from '../../../../shared/types/prescription-rx.types';
import { PrescriptionActionBarComponent } from './components/prescription-action-bar.component';
import { PrescriptionCancelDrawerComponent } from './components/prescription-cancel-drawer.component';
import { PrescriptionDiagnosisSectionComponent, RX_TEXT_MAX } from './components/prescription-diagnosis-section.component';
import { PrescriptionFooterComponent } from './components/prescription-footer.component';
import { PrescriptionMedicationDrawerComponent } from './components/prescription-medication-drawer.component';
import { PrescriptionMedicationTableComponent } from './components/prescription-medication-table.component';
import { PrescriptionPatientListComponent } from './components/prescription-patient-list.component';
import { PrescriptionPatientSummaryComponent } from './components/prescription-patient-summary.component';
import { PrescriptionLine, formatAmount, isUnacknowledgedCritical, lineTotal, newLineKey, toLine } from './prescription-rx.util';

type LoadError = 'forbidden' | 'notFound' | 'failed';
type Busy = 'save' | 'issue' | 'cancel' | 'check';
type Mode = 'empty' | 'patient' | 'detail';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Prescription workspace. `?id=` opens one prescription (view, edit while Draft, issue, cancel); `?patientId=` lists the
 * patient's prescriptions to pick from. Creating a prescription is not offered: the create API needs a medical record
 * id, a hospital id and a prescription number that no existing API provides for a visit (see docs/prescription-redesign.md).
 */
@Component({
    selector: 'admin-prescription',
    standalone: true,
    imports: [
        NgIf,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooIconComponent,
        BooInlineErrorComponent,
        PrescriptionActionBarComponent,
        PrescriptionPatientSummaryComponent,
        PrescriptionDiagnosisSectionComponent,
        PrescriptionMedicationTableComponent,
        PrescriptionMedicationDrawerComponent,
        PrescriptionCancelDrawerComponent,
        PrescriptionPatientListComponent,
        PrescriptionFooterComponent,
    ],
    templateUrl: './prescription.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminPrescriptionComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
    private readonly rxSrv = inject(PrescriptionService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild(PrescriptionCancelDrawerComponent) cancelDrawer?: PrescriptionCancelDrawerComponent;

    mode: Mode = 'empty';
    loading = signal(false);
    loadError = signal<LoadError | null>(null);
    busy = signal<Busy | null>(null);

    prescription = signal<Prescription | null>(null);
    lines = signal<PrescriptionLine[]>([]);
    patientRows = signal<PatientPrescriptionRow[]>([]);
    private linesDirty = signal(false);

    drawerOpen = false;
    editingLine: PrescriptionLine | null = null;
    cancelOpen = false;

    readonly form = this.fb.nonNullable.group({
        diagnosis: ['', Validators.maxLength(RX_TEXT_MAX)],
        instructions: ['', Validators.maxLength(RX_TEXT_MAX)],
    });

    private perms = signal<string[]>([]);
    canUpdate = computed(() => this.perms().includes(Permissions.Pharmacy.PrescriptionUpdate));
    canIssuePerm = computed(() => this.perms().includes(Permissions.Pharmacy.PrescriptionIssue));
    canCancelPerm = computed(() => this.perms().includes(Permissions.Pharmacy.PrescriptionCancel));
    canSearchMedicines = computed(() => this.perms().includes(Permissions.Pharmacy.MedicineInventoryRead));
    canListPatientRx = computed(() => this.perms().includes(Permissions.Clinical.MedicalRecordViewPrescriptions));

    status = computed<PrescriptionStatus | null>(() => {
        const p = this.prescription();
        return p ? normalizePrescriptionStatus(p.status) : null;
    });
    /** Only a Draft can be edited, and only by users the update API allows. */
    editable = computed(() => this.status() === 'Draft' && this.canUpdate());
    showIssue = computed(() => this.status() === 'Draft' && this.canIssuePerm());
    showCancel = computed(() => (this.status() === 'Draft' || this.status() === 'Issued') && this.canCancelPerm());
    linesTotal = computed(() => formatAmount(this.lines().reduce((sum, l) => sum + lineTotal(l.input), 0)));
    existingMedicineIds = computed(() => this.lines().map(l => l.input.medicineId));
    criticalLines = computed(() => this.lines().filter(l => l.stored.some(isUnacknowledgedCritical)));

    private loadSub?: Subscription;
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        const perms$ = this.authSrv.permissions$.pipe(filter((p): p is string[] => p !== null));
        perms$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p => this.perms.set(p));

        // Permissions are awaited once so the first load knows what the user may call; later changes only update the flags.
        combineLatest([this.route.queryParamMap, perms$.pipe(take(1))])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(([q]) => this.open(q.get('id'), q.get('patientId')));
    }

    /** Warns before a reload or tab close would throw away unsaved edits. */
    @HostListener('window:beforeunload', ['$event'])
    onBeforeUnload(event: BeforeUnloadEvent): void {
        if (this.dirty) event.preventDefault();
    }
    // #endregion

    // #region Methods
    get dirty(): boolean {
        return this.mode === 'detail' && this.editable() && (this.linesDirty() || this.form.dirty);
    }

    /** Why Issue is unavailable right now, or null. A method because it reads the form's dirty flag, which is not a signal. */
    issueBlockedReason(): string | null {
        if (this.dirty) return 'Save your changes before issuing.';
        if (!this.prescription()?.items.length) return 'Add a medication before issuing.';
        const n = this.criticalLines().length;
        return n ? `${n} medication${n > 1 ? 's have' : ' has'} an unacknowledged critical warning. Remove ${n > 1 ? 'them' : 'it'} to issue.` : null;
    }

    private open(id: string | null, patientId: string | null): void {
        this.loadSub?.unsubscribe();
        this.prescription.set(null);
        this.lines.set([]);
        this.patientRows.set([]);
        this.linesDirty.set(false);
        this.loadError.set(null);
        this.drawerOpen = false;
        this.cancelOpen = false;
        this.form.reset();

        if (id) {
            this.mode = 'detail';
            if (GUID.test(id)) this.loadDetail(id);
            else this.loadError.set('notFound');
        } else if (patientId) {
            this.mode = 'patient';
            if (!GUID.test(patientId)) this.loadError.set('notFound');
            else if (!this.canListPatientRx()) this.loadError.set('forbidden');
            else this.loadPatient(patientId);
        } else {
            this.mode = 'empty';
        }
    }

    private errorKind(err: HttpErrorResponse): LoadError {
        if (err?.status === 403) return 'forbidden';
        if (err?.status === 404) return 'notFound';
        return 'failed';
    }

    loadDetail(id: string): void {
        this.loadSub?.unsubscribe();
        this.loading.set(true);
        this.loadError.set(null);
        this.loadSub = this.rxSrv.get(id)
            .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res.data) { this.loadError.set('notFound'); return; }
                    this.apply(res.data);
                },
                error: err => this.loadError.set(this.errorKind(err)),
            });
    }

    private loadPatient(patientId: string): void {
        this.loadSub?.unsubscribe();
        this.loading.set(true);
        this.loadError.set(null);
        this.loadSub = this.rxSrv.getPatientPrescriptions(patientId)
            .pipe(finalize(() => this.loading.set(false)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => this.patientRows.set(res.data?.items ?? []),
                error: err => this.loadError.set(this.errorKind(err)),
            });
    }

    /** Puts the server copy on screen and clears every local edit. */
    private apply(p: Prescription): void {
        this.prescription.set(p);
        this.lines.set((p.items ?? []).map(toLine));
        this.form.reset({ diagnosis: p.diagnosis ?? '', instructions: p.instructions ?? '' });
        this.linesDirty.set(false);
    }

    retry(): void {
        const q = this.route.snapshot.queryParamMap;
        this.open(q.get('id'), q.get('patientId'));
    }

    refresh(): void {
        const id = this.prescription()?.id ?? this.route.snapshot.queryParamMap.get('id');
        if (!id || this.loading() || this.busy()) return;
        if (this.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.loadDetail(id));
        else this.loadDetail(id);
    }

    openPrescription(id: string): void {
        this.router.navigate([], { queryParams: { id }, relativeTo: this.route });
    }

    backToPatient(): void {
        const patientId = this.prescription()?.patientId;
        if (!patientId) return;
        const go = () => this.router.navigate([], { queryParams: { patientId }, relativeTo: this.route });
        if (this.dirty) this.dialogSrv.confirmUnsavedChanges(go);
        else go();
    }

    // Medication lines
    openAdd(): void {
        this.editingLine = null;
        this.drawerOpen = true;
    }

    openEdit(line: PrescriptionLine): void {
        this.editingLine = line;
        this.drawerOpen = true;
    }

    closeDrawer(): void {
        this.drawerOpen = false;
    }

    onItemSaved(input: PrescriptionItemInput): void {
        const editing = this.editingLine;
        if (editing) {
            this.lines.update(ls => ls.map(l => l.key === editing.key ? { ...l, input, checked: null } : l));
        } else {
            this.lines.update(ls => [...ls, { key: newLineKey(), input, stored: [], checked: null, quantityDispensed: 0 }]);
        }
        this.linesDirty.set(true);
        this.drawerOpen = false;
    }

    removeLine(line: PrescriptionLine): void {
        this.dialogSrv.confirm(
            `Remove ${line.input.medicineName} from this prescription? It is deleted from the saved prescription when you save changes.`,
            () => {
                this.lines.update(ls => ls.filter(l => l.key !== line.key));
                this.linesDirty.set(true);
            },
            'Remove medication',
            'warning',
            'Remove',
            'Keep',
        );
    }

    checkWarnings(): void {
        const p = this.prescription();
        const lines = this.lines();
        if (!p || !lines.length || this.busy()) return;
        const request: CdsCheckRequest = {
            patientId: p.patientId,
            excludePrescriptionId: p.id,
            items: lines.map(l => ({
                itemKey: l.key,
                medicineId: l.input.medicineId,
                medicineName: l.input.medicineName,
                genericName: l.input.genericName,
                dosageInstructions: l.input.dosageInstructions,
                frequency: l.input.frequency,
                durationInDays: l.input.durationInDays,
            })),
        };
        this.busy.set('check');
        this.rxSrv.checkWarnings(request)
            .pipe(finalize(() => this.busy.set(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    const byKey = new Map(Object.entries(res.data ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
                    this.lines.update(ls => ls.map(l => ({ ...l, checked: byKey.get(l.key.toLowerCase()) ?? [] })));
                    const found = this.lines().reduce((n, l) => n + (l.checked?.length ?? 0), 0);
                    if (found) this.toastSrv.info(`${found} warning${found > 1 ? 's' : ''} found. See the medication list.`);
                    else this.toastSrv.success('No warnings found.');
                },
                error: () => undefined,
            });
    }

    // Save, issue, cancel. Failures are reported by the global HTTP error toast; every form keeps what was entered.
    save(): void {
        const p = this.prescription();
        if (!p || this.busy() || !this.editable() || !this.dirty) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        const v = this.form.getRawValue();
        this.busy.set('save');
        this.rxSrv.update({
            id: p.id,
            diagnosis: v.diagnosis.trim() || null,
            instructions: v.instructions.trim() || null,
            items: this.lines().map(l => l.input),
        })
            .pipe(finalize(() => this.busy.set(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success('Prescription saved.');
                    // The server copy is now the truth; mark clean first so a failed reload does not show a false "unsaved" state.
                    this.form.markAsPristine();
                    this.linesDirty.set(false);
                    this.loadDetail(p.id);
                },
                error: () => undefined,
            });
    }

    confirmIssue(): void {
        const p = this.prescription();
        if (!p || this.busy() || !this.showIssue() || this.issueBlockedReason()) return;
        const n = p.items.length;
        this.dialogSrv.confirm(
            `Issue ${p.prescriptionNumber} with ${n} medication${n > 1 ? 's' : ''}? An issued prescription can no longer be edited.`,
            () => this.issue(p.id),
            'Issue prescription',
            'warning',
            'Issue',
            'Keep editing',
        );
    }

    private issue(id: string): void {
        if (this.busy()) return;
        this.busy.set('issue');
        this.rxSrv.issue(id)
            .pipe(finalize(() => this.busy.set(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success('Prescription issued.');
                    this.loadDetail(id);
                },
                error: () => undefined,
            });
    }

    openCancel(): void {
        if (this.busy() || !this.showCancel()) return;
        this.cancelOpen = true;
    }

    closeCancel(): void {
        this.cancelOpen = false;
    }

    cancelPrescription(reason: string): void {
        const p = this.prescription();
        if (!p || this.busy()) return;
        this.busy.set('cancel');
        this.rxSrv.cancel(p.id, reason)
            .pipe(finalize(() => this.busy.set(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success('Prescription cancelled.');
                    this.cancelOpen = false;
                    this.cancelDrawer?.reset();
                    this.loadDetail(p.id);
                },
                error: () => undefined,
            });
    }
    // #endregion
}
