import { Component, OnDestroy, OnInit, computed, inject, signal } from "@angular/core";
import { Subject, debounceTime, switchMap } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { PrescriptionService } from "../../../../services/admin/prescription.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { LoadingKeys } from "../../../../shared/types/loading";
import {
    FavoriteMedication,
    PrescriptionDraft,
    PrescriptionTemplate,
    RecentPrescriptionSummary,
    RxDiagnosisEntry,
    RxMedicationItem,
} from "../../../../shared/types/prescription-rx.types";
import { PrescriptionActionBarComponent } from "./components/prescription-action-bar.component";
import { PrescriptionDiagnosisSectionComponent } from "./components/prescription-diagnosis-section.component";
import { PrescriptionFooterComponent } from "./components/prescription-footer.component";
import { PrescriptionMedicationDrawerComponent } from "./components/prescription-medication-drawer.component";
import { PrescriptionMedicationTableComponent } from "./components/prescription-medication-table.component";
import { PrescriptionPatientSummaryComponent } from "./components/prescription-patient-summary.component";
import { PrescriptionSidebarComponent } from "./components/prescription-sidebar.component";
import { hasUnacknowledgedAtOrAbove, severityRank } from "./prescription-rx.util";

@Component({
    selector: 'admin-prescription',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent,
        ErrorStateComponent,
        PrescriptionActionBarComponent,
        PrescriptionPatientSummaryComponent,
        PrescriptionDiagnosisSectionComponent,
        PrescriptionMedicationTableComponent,
        PrescriptionSidebarComponent,
        PrescriptionMedicationDrawerComponent,
        PrescriptionFooterComponent,
    ],
    template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <div *ngIf="loadingSrv.isLoading(LoadingKeys.PRESCRIPTION.GET_DRAFT)" class="p-6 max-w-7xl mx-auto w-full space-y-4">
        <div class="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
        <div class="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        <div class="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      <div *ngIf="!loadingSrv.isLoading(LoadingKeys.PRESCRIPTION.GET_DRAFT) && error()" class="p-6 max-w-7xl mx-auto w-full">
        <boo-error-state title="Couldn't load prescription" [description]="error()" (retry)="retryLoad()"></boo-error-state>
      </div>

      <ng-container *ngIf="!loadingSrv.isLoading(LoadingKeys.PRESCRIPTION.GET_DRAFT) && !error() && draft() as d">
        <rx-action-bar
          [draft]="d" [editable]="editable()" [saving]="loadingSrv.isLoading(LoadingKeys.PRESCRIPTION.SAVE_DRAFT)" [canIssue]="canIssue()"
          (saveDraft)="saveDraft()" (preview)="openPreview()" (print)="printRx()" (issue)="issueRx()" (cancel)="cancelRx()">
        </rx-action-bar>

        <div class="flex-1 max-w-7xl mx-auto w-full p-6 space-y-4">
          <rx-patient-summary [patient]="d.patient"></rx-patient-summary>

          <rx-diagnosis-section
            [primaryDiagnosis]="d.primaryDiagnosis" [secondaryDiagnoses]="d.secondaryDiagnoses"
            [symptoms]="d.symptoms" [clinicalNotes]="d.clinicalNotes" [editable]="editable()"
            (primaryDiagnosisChange)="updatePrimaryDiagnosis($event)"
            (secondaryDiagnosesChange)="updateSecondaryDiagnoses($event)"
            (symptomsChange)="updateSymptoms($event)"
            (clinicalNotesChange)="updateClinicalNotes($event)">
          </rx-diagnosis-section>

          <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
            <rx-medication-table
              [items]="d.items" [editable]="editable()"
              (itemsChange)="updateItems($event)"
              (addMedication)="openAddDrawer()"
              (editMedication)="openEditDrawer($event)">
            </rx-medication-table>

            <rx-sidebar
              [items]="d.items" [primaryDiagnosis]="d.primaryDiagnosis" [secondaryDiagnoses]="d.secondaryDiagnoses"
              [recent]="recent()" [favorites]="favorites()" [templates]="templates()" [doctorNotes]="d.doctorNotes" [editable]="editable()"
              (scrollToRow)="scrollToRow($event)"
              (applyFavorite)="applyFavorite($event)"
              (applyTemplate)="applyTemplate($event)"
              (doctorNotesChange)="updateDoctorNotes($event)">
            </rx-sidebar>
          </div>
        </div>

        <rx-footer
          [editable]="editable()" [saving]="loadingSrv.isLoading(LoadingKeys.PRESCRIPTION.ISSUE)" [canIssue]="canIssue()" [autosaveLabel]="autosaveLabel()"
          (saveDraft)="saveDraft()" (preview)="openPreview()" (print)="printRx()" (issue)="issueRx()">
        </rx-footer>
      </ng-container>
      <rx-medication-drawer
        [isOpen]="drawerOpen()" [editingItem]="editingItem()" [patientId]="draft()?.patient?.patientId || ''"
        (close)="closeDrawer()" (save)="onDrawerSave($event)">
      </rx-medication-drawer>
      <div *ngIf="previewOpen()" class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-6" (click)="previewOpen.set(false)">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8" (click)="$event.stopPropagation()" id="rx-print-area">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-primary">Prescription Preview</h2>
            <button (click)="previewOpen.set(false)" class="text-secondary hover:text-primary"><boo-icon name="x" [size]="20"></boo-icon></button>
          </div>
          <ng-container *ngIf="draft() as d">
            <div class="text-sm text-secondary mb-1">{{ d.prescriptionNumber }} · {{ d.createdAt | date:'mediumDate' }}</div>
            <div class="font-semibold text-primary">{{ d.doctor.fullName }} — {{ d.doctor.department }}</div>
            <div class="h-px bg-gray-200 my-4"></div>
            <div class="font-semibold text-primary">{{ d.patient.fullName }}</div>
            <div class="text-sm text-secondary">{{ d.patient.gender }} · {{ d.patient.ageYears }}y</div>
            <div *ngIf="d.primaryDiagnosis" class="text-sm mt-2"><strong>Diagnosis:</strong> {{ d.primaryDiagnosis.code }} — {{ d.primaryDiagnosis.description }}</div>
            <div class="h-px bg-gray-200 my-4"></div>
            <table class="w-full text-sm">
              <thead><tr class="text-left text-xs text-secondary uppercase"><th class="py-1">Medication</th><th class="py-1">Dose</th><th class="py-1">Frequency</th><th class="py-1">Duration</th><th class="py-1 text-right">Qty</th></tr></thead>
              <tbody>
                <tr *ngFor="let i of d.items" class="border-t border-gray-100">
                  <td class="py-2">{{ i.name }} <span class="text-secondary">{{ i.strength }}</span></td>
                  <td class="py-2">{{ i.dose }}</td>
                  <td class="py-2">{{ i.frequency }}</td>
                  <td class="py-2">{{ i.durationDays }}d</td>
                  <td class="py-2 text-right">{{ i.quantity }} {{ i.unit }}</td>
                </tr>
              </tbody>
            </table>
          </ng-container>
          <div class="mt-6 flex justify-end gap-2">
            <button (click)="printRx()" class="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90">Print</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminPrescriptionComponent implements OnInit, OnDestroy {
    // #region Inputs, Outputs, Properties
    draft = signal<PrescriptionDraft | null>(null);
    autosaveLabel = signal('');
    previewOpen = signal(false);
    drawerOpen = signal(false);
    editingItem = signal<RxMedicationItem | null>(null);

    recent = signal<RecentPrescriptionSummary[]>([]);
    favorites = signal<FavoriteMedication[]>([]);
    templates = signal<PrescriptionTemplate[]>([]);
    error = signal<string | null>(null);

    editable = computed(() => this.draft()?.status === 'Draft');
    canIssue = computed(() => this.editable() && (this.draft()?.items.length ?? 0) > 0);

    private autosave$ = new Subject<void>();
    private prescriptionId = 'new';

    LoadingKeys = LoadingKeys;
    // #endregion

    // #region Inject Services
    private rxSrv = inject(PrescriptionService);
    private dialogSrv = inject(DialogService);
    private toastSrv = inject(ToastService);
    protected loadingSrv = inject(LocalLoadingService);
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.loadDraft();

        this.autosave$.pipe(
            debounceTime(1200),
            switchMap(() => {
                const d = this.draft();
                if (!d) throw new Error('no draft');
                return this.rxSrv.saveDraft(d);
            }),
        ).subscribe({
            next: () => { this.autosaveLabel.set('Saved ' + new Date().toLocaleTimeString()); },
        });
    }

    ngOnDestroy(): void {
        this.autosave$.complete();
    }
    // #endregion

    // #region Methods
    private loadDraft(): void {
        this.error.set(null);
        this.rxSrv.getDraft(this.prescriptionId).subscribe({
            next: res => {
                this.draft.set(res.data);
                const patientId = res.data.patient.patientId;
                const doctorId = res.data.doctor.doctorId;
                this.rxSrv.getRecentPrescriptions(patientId).subscribe(r => this.recent.set(r.data ?? []));
                this.rxSrv.getFavorites(doctorId).subscribe(r => this.favorites.set(r.data ?? []));
                this.rxSrv.getTemplates(doctorId).subscribe(r => this.templates.set(r.data ?? []));
            },
            error: () => {
                this.error.set('Failed to load the prescription. Please try again.');
            },
        });
    }

    retryLoad(): void {
        this.loadDraft();
    }

    private patch(fn: (d: PrescriptionDraft) => PrescriptionDraft) {
        const current = this.draft();
        if (!current) return;
        this.draft.set(fn(current));
        this.autosave$.next();
    }

    updatePrimaryDiagnosis(v: RxDiagnosisEntry | null) {
        this.patch(d => ({ ...d, primaryDiagnosis: v }));
    }

    updateSecondaryDiagnoses(v: RxDiagnosisEntry[]) {
        this.patch(d => ({ ...d, secondaryDiagnoses: v }));
    }

    updateSymptoms(v: string) {
        this.patch(d => ({ ...d, symptoms: v }));
    }

    updateClinicalNotes(v: string) {
        this.patch(d => ({ ...d, clinicalNotes: v }));
    }

    updateDoctorNotes(v: string) {
        this.patch(d => ({ ...d, doctorNotes: v }));
    }

    updateItems(items: RxMedicationItem[]) {
        this.patch(d => ({ ...d, items }));
        this.refreshCds(items);
    }

    private refreshCds(items: RxMedicationItem[]) {
        const patientId = this.draft()?.patient.patientId;
        if (!patientId || !items.length) return;
        this.rxSrv.checkClinicalWarnings(patientId, items).subscribe(res => {
            const map = res.data ?? {};
            this.patch(d => ({ ...d, items: d.items.map(i => ({ ...i, warnings: map[i.id] ?? i.warnings })) }));
        });
    }

    openAddDrawer() {
        this.editingItem.set(null);
        this.drawerOpen.set(true);
    }

    openEditDrawer(item: RxMedicationItem) {
        this.editingItem.set(item);
        this.drawerOpen.set(true);
    }

    closeDrawer() {
        this.drawerOpen.set(false);
        this.editingItem.set(null);
    }

    onDrawerSave(payload: { item: RxMedicationItem; continueAdding: boolean }) {
        this.patch(d => {
            const exists = d.items.some(i => i.id === payload.item.id);
            const items = exists ? d.items.map(i => i.id === payload.item.id ? payload.item : i) : [...d.items, payload.item];
            return { ...d, items };
        });
        this.refreshCds(this.draft()?.items ?? []);
        if (!payload.continueAdding) this.closeDrawer();
        else this.editingItem.set(null);
        this.toastSrv.success(`${payload.item.name} added to prescription`);
    }

    applyFavorite(fav: FavoriteMedication) {
        const item: RxMedicationItem = {
            id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            medicineId: fav.medicineId,
            name: fav.name,
            genericName: fav.name,
            brandName: null,
            strength: fav.strength,
            dosageForm: null,
            route: 'Oral',
            dose: fav.dose,
            frequency: fav.frequency,
            timing: {},
            beforeMeal: false,
            afterMeal: false,
            prn: fav.frequency === 'PRN',
            durationDays: fav.durationDays,
            quantity: fav.quantity,
            unit: fav.unit,
            refillCount: 0,
            instructions: null,
            pharmacyNotes: null,
            insuranceCovered: true,
            stockStatus: 'InStock',
            isControlledSubstance: false,
            isAntibiotic: false,
            isHighAlert: false,
            isOtc: false,
            isPrescriptionOnly: true,
            isCustomMedication: false,
            status: 'Active',
            unitPrice: 0,
            warnings: [],
        };
        this.patch(d => ({ ...d, items: [...d.items, item] }));
        this.refreshCds(this.draft()?.items ?? []);
        this.toastSrv.success(`${fav.name} added from favorites`);
    }

    applyTemplate(tpl: PrescriptionTemplate) {
        const items: RxMedicationItem[] = tpl.items.map(i => ({
            ...i,
            id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            warnings: [],
        }));
        this.patch(d => ({ ...d, items: [...d.items, ...items] }));
        this.refreshCds(this.draft()?.items ?? []);
        this.toastSrv.success(`${tpl.name} template applied (${items.length} medications)`);
    }

    scrollToRow(itemId: string) {
        document.getElementById('rx-row-' + itemId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    saveDraft() {
        const d = this.draft();
        if (!d) return;
        this.rxSrv.saveDraft(d).subscribe({
            next: () => { this.autosaveLabel.set('Saved ' + new Date().toLocaleTimeString()); this.toastSrv.success('Prescription saved as draft'); },
            error: () => { this.toastSrv.error('Could not save draft'); },
        });
    }

    openPreview() {
        this.previewOpen.set(true);
    }

    printRx() {
        window.print();
    }

    issueRx() {
        const d = this.draft();
        if (!d) return;
        if (!d.items.length) {
            this.toastSrv.error('Add at least one medication before issuing');
            return;
        }
        const hasCritical = hasUnacknowledgedAtOrAbove(d.items, severityRank('Critical'));
        if (hasCritical) {
            this.toastSrv.error('Resolve or acknowledge all Critical warnings before issuing');
            return;
        }
        const unacknowledgedMedium = hasUnacknowledgedAtOrAbove(d.items, severityRank('Medium'));
        const message = unacknowledgedMedium
            ? `This prescription has unacknowledged clinical warnings. Issue ${d.items.length} medication(s) anyway?`
            : `Issue this prescription with ${d.items.length} medication(s)? This action cannot be undone.`;

        this.dialogSrv.confirm(message, () => {
            this.rxSrv.issue(d).subscribe({
                next: res => { this.draft.set(res.data); this.toastSrv.success('Prescription issued successfully'); },
                error: () => this.toastSrv.error('Failed to issue prescription'),
            });
        }, 'Issue Prescription', 'warning', 'Issue', 'Keep Editing');
    }

    cancelRx() {
        const d = this.draft();
        if (!d) return;
        this.dialogSrv.confirmDelete(() => {
            this.rxSrv.cancel(d, 'Cancelled by doctor').subscribe({
                next: res => { this.draft.set(res.data); this.toastSrv.success('Prescription cancelled'); },
                error: () => this.toastSrv.error('Failed to cancel prescription'),
            });
        }, 'this prescription');
    }
    // #endregion
}
