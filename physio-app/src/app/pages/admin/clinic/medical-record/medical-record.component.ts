import { Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { MedicalRecordService } from "../../../../services/admin/medical-record.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import {
    BillingSummary,
    ClinicalNoteRow,
    ClinicalSnapshot,
    DiagnosisRow,
    EncounterRow,
    HistoricalSummary,
    ImagingStudyRow,
    LabReportRow,
    LabResultRow,
    PatientAllergy,
    PatientContext,
    PatientDemographics,
    PrescriptionRow,
} from "../../../../shared/types/medical-record.types";
import { ClinicalSnapshotComponent } from "./components/clinical-snapshot.component";
import { PatientContextHeaderComponent } from "./components/patient-context-header.component";
import { BillingTabComponent } from "./tabs/billing-tab.component";
import { ClinicalNotesTabComponent } from "./tabs/clinical-notes-tab.component";
import { DiagnosesTabComponent } from "./tabs/diagnoses-tab.component";
import { EncountersTabComponent } from "./tabs/encounters-tab.component";
import { ImagingTabComponent } from "./tabs/imaging-tab.component";
import { LaboratoryTabComponent } from "./tabs/laboratory-tab.component";
import { OverviewTabComponent } from "./tabs/overview-tab.component";
import { PrescriptionsTabComponent } from "./tabs/prescriptions-tab.component";

type TabKey = 'overview' | 'encounters' | 'diagnoses' | 'prescriptions' | 'lab' | 'imaging' | 'notes' | 'billing';

interface TabDef {
    key: TabKey;
    label: string;
    icon: string;
    badge?: () => number | null;
}

@Component({
    selector: 'admin-medical-record',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent,
        ErrorStateComponent,
        PatientContextHeaderComponent,
        ClinicalSnapshotComponent,
        OverviewTabComponent,
        EncountersTabComponent,
        DiagnosesTabComponent,
        PrescriptionsTabComponent,
        LaboratoryTabComponent,
        ImagingTabComponent,
        ClinicalNotesTabComponent,
        BillingTabComponent,
    ],
    templateUrl: './medical-record.component.html',
    host: { class: 'block h-full min-h-0 bg-gray-50' },
})
export class AdminMedicalRecordComponent implements OnInit {
    // ─── State ─────────────────────────────────────────────────────────
    patient = signal<PatientContext | null>(null);
    snapshot = signal<ClinicalSnapshot | null>(null);
    demographics = signal<PatientDemographics | null>(null);
    history = signal<HistoricalSummary | null>(null);
    allergies = signal<PatientAllergy[]>([]);
    encounters = signal<EncounterRow[]>([]);
    diagnoses = signal<DiagnosisRow[]>([]);
    prescriptions = signal<PrescriptionRow[]>([]);
    labResults = signal<LabResultRow[]>([]);
    labReports = signal<LabReportRow[]>([]);
    imaging = signal<ImagingStudyRow[]>([]);
    notes = signal<ClinicalNoteRow[]>([]);
    billing = signal<BillingSummary | null>(null);

    isLoading = signal(true);
    error = signal<string | null>(null);
    activeTab = signal<TabKey>('overview');

    readonly tabs: TabDef[] = [
        { key: 'overview', label: 'Overview', icon: 'layout-dashboard' },
        { key: 'encounters', label: 'Encounters', icon: 'calendar-clock', badge: () => this.encounters().length },
        { key: 'diagnoses', label: 'Diagnoses', icon: 'stethoscope', badge: () => this.diagnoses().filter(d => d.currentStatus === 'Active').length },
        { key: 'prescriptions', label: 'Prescriptions', icon: 'pill', badge: () => this.prescriptions().filter(p => p.status === 'Active').length },
        { key: 'lab', label: 'Laboratory', icon: 'flask-conical', badge: () => this.labResults().filter(r => r.isCritical || (r.abnormalFlag && r.abnormalFlag !== 'N')).length },
        { key: 'imaging', label: 'Imaging', icon: 'scan', badge: () => this.imaging().length },
        { key: 'notes', label: 'Clinical Notes', icon: 'file-text', badge: () => this.notes().length },
        { key: 'billing', label: 'Billing', icon: 'wallet', badge: () => this.billing()?.outstandingBalance && this.billing()!.outstandingBalance > 0 ? 1 : null },
    ];

    // #region Inject Services
    private srv = inject(MedicalRecordService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private toastSrv = inject(ToastService);

    // #endregion

    private patientId = '';

    ngOnInit(): void {
        const patientId = this.route.snapshot.paramMap.get('patientId');
        if (!patientId) {
            this.router.navigate(['/admin/reception/patient-lookup']);
            return;
        }
        this.patientId = patientId;
        this.loadAll(patientId);
    }

    retryLoad(): void {
        if (this.patientId) this.loadAll(this.patientId);
    }

    private loadAll(patientId: string): void {
        this.isLoading.set(true);
        this.error.set(null);
        forkJoin({
            ctx: this.srv.getContext(patientId),
            snap: this.srv.getSnapshot(patientId),
            demo: this.srv.getDemographics(patientId),
            hist: this.srv.getHistory(patientId),
            allg: this.srv.getAllergies(patientId),
            enc: this.srv.getEncounters(patientId),
            dx: this.srv.getDiagnoses(patientId),
            rx: this.srv.getPrescriptions(patientId),
            lab: this.srv.getLab(patientId),
            img: this.srv.getImaging(patientId),
            note: this.srv.getNotes(patientId),
            bill: this.srv.getBilling(patientId),
        }).subscribe({
            next: (r) => {
                if (r.ctx.success) this.patient.set(r.ctx.data);
                if (r.snap.success) this.snapshot.set(r.snap.data);
                if (r.demo.success) this.demographics.set(r.demo.data);
                if (r.hist.success) this.history.set(r.hist.data);
                if (r.allg.success) this.allergies.set(r.allg.data?.items ?? []);
                if (r.enc.success) this.encounters.set(r.enc.data?.items ?? []);
                if (r.dx.success) this.diagnoses.set(r.dx.data?.items ?? []);
                if (r.rx.success) this.prescriptions.set(r.rx.data?.items ?? []);
                if (r.lab.success) {
                    this.labResults.set(r.lab.data?.results ?? []);
                    this.labReports.set(r.lab.data?.reports ?? []);
                }
                if (r.img.success) this.imaging.set(r.img.data?.items ?? []);
                if (r.note.success) this.notes.set(r.note.data?.items ?? []);
                if (r.bill.success) this.billing.set(r.bill.data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.error.set('Failed to load the patient medical record. Please try again.');
            },
        });
    }

    setTab(k: TabKey): void { this.activeTab.set(k); }

    onQuickAction(action: string): void {
        // Wire to real flows when the corresponding endpoints / drawers exist.
        const messages: Record<string, string> = {
            encounter: 'New encounter — not wired yet',
            note: 'Add note — not wired yet',
            prescribe: 'Prescribe medication — not wired yet',
            lab: 'Order lab test — not wired yet',
            imaging: 'Order imaging — not wired yet',
            print: 'Printing medical record…',
            discharge: 'Discharge workflow — not wired yet',
        };
        this.toastSrv.success(messages[action] || action);
    }
}
