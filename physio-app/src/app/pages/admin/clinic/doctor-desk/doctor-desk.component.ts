import { Component, DestroyRef, OnInit, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { switchMap, timer } from "rxjs";
import { AppointmentService } from "src/app/services/admin/appointment.service";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { DoctorDeskService } from "../../../../services/admin/doctor-desk.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PagedResponse } from "../../../../shared/types/common";
import { DoctorDeskSnapshot, QueuePatient, StatDef } from "../../../../shared/types/doctor-desk.types";
import { LoadingKeys } from "../../../../shared/types/loading";
import { CompletedListComponent } from "./components/completed-list.component";
import { CurrentPatientAction, CurrentPatientPanelComponent } from "./components/current-patient-panel.component";
import { DeskHeaderComponent } from "./components/desk-header.component";
import { WaitingQueuePanelComponent } from "./components/waiting-queue-panel.component";

@Component({
    selector: 'admin-doctor-desk',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent,
        StatCardComponent,
        DeskHeaderComponent,
        CurrentPatientPanelComponent,
        WaitingQueuePanelComponent,
        CompletedListComponent,
    ],
    templateUrl: './doctor-desk.component.html',
    host: { class: 'block h-full min-h-0 bg-body' },
})
export class AdminDoctorDeskComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly POLL_INTERVAL_MS = 30_000;
    snapshot = signal<DoctorDeskSnapshot>({ context: { doctorName: '', department: '', room: '', shift: '', isOnline: false }, patients: [] });
    currentPatient = signal<QueuePatient | null>(null);
    showCompleteModal = signal(false);
    completeForm = new FormGroup({
        diagnosis: new FormControl('', Validators.required),
        treatmentPlan: new FormControl(''),
        followUpDate: new FormControl(''),
        doctorNotes: new FormControl(''),
    });

    context = computed(() => this.snapshot().context);

    waitingPatients = computed(() =>
        this.snapshot()?.patients
            .filter(p => p.status === 'waiting')
            .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'urgent' ? -1 : 1))
    );
    completedPatients = computed(() => this.snapshot()?.patients.filter(p => p.status === 'completed'));

    readonly stats: StatDef[] = [
        { label: 'Patients Today', icon: 'users-round', tone: 'primary', value: () => this.snapshot()?.patients.length || 0 },
        { label: 'Waiting', icon: 'clock', tone: 'warning', value: () => this.waitingPatients()?.length || 0 },
        { label: 'In Consultation', icon: 'stethoscope', tone: 'primary', value: () => this.currentPatient() ? 1 : 0 },
        { label: 'Completed', icon: 'circle-check-big', tone: 'success', value: () => this.completedPatients()?.length || 0 },
        { label: 'Urgent', icon: 'triangle-alert', tone: 'danger', value: () => this.waitingPatients()?.filter(p => p.priority === 'urgent').length || 0 },
    ];

    LoadingKeys = LoadingKeys;
    // #endregion

    // #region Inject Services
    private readonly doctorDeskSrv = inject(DoctorDeskService);
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly toastSrv = inject(ToastService);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    protected readonly loadingSrv = inject(LocalLoadingService);
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        timer(0, this.POLL_INTERVAL_MS).pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap(() => this.doctorDeskSrv.getSnapshot())
        ).subscribe({
            next: (res) => this.applySnapshot(res),
            error: () => this.toastSrv.error('Failed to load queue')
        })
    }
    // #endregion

    // #region Snapshot loading
    private applySnapshot(res: PagedResponse<DoctorDeskSnapshot>): void {
        if (res.success) {
            if (!res.data) {
                this.toastSrv.error('No data received from server');
                window.history.back();
                return;
            }
            this.snapshot.set(res.data);
        }
    }

    refreshSnapshot(): void {
        this.doctorDeskSrv.getSnapshot().subscribe({
            next: (res) => this.applySnapshot(res),
            error: () => this.toastSrv.error('Failed to refresh queue')
        });
    }
    // #endregion

    // #region Methods
    callNextPatient(): void {
        const next = this.waitingPatients()?.[0];
        if (!next) return;
        this.startConsultation(next);
    }

    callPatient(patient: QueuePatient): void {
        this.startConsultation(patient);
    }

    private startConsultation(patient: QueuePatient): void {
        this.appointmentSrv
            .updateStatus(patient.appointmentId, 'InProgress')
            .subscribe({
                next: () => {
                    const consultationStartedAt = new Date().toISOString();
                    this.snapshot.update(s => ({
                        ...s,
                        patients: s.patients.map(p =>
                            p.id === patient.id
                                ? { ...p, status: 'in-consultation', consultationStartedAt }
                                : p
                        ),
                    }));
                    this.currentPatient.set({
                        ...patient,
                        status: 'in-consultation',
                        consultationStartedAt
                    });
                },
                error: () => this.toastSrv.error('Failed to start consultation')
            });
    }

    onCurrentPatientAction(action: CurrentPatientAction): void {
        const current = this.currentPatient();
        if (!current) return;

        switch (action) {
            case 'complete':
                this.showCompleteModal.set(true);
                break;
            case 'transfer':
                this.snapshot.update(s => ({
                    ...s,
                    patients: s.patients.map(p => p.id === current.id ? { ...p, status: 'waiting' } : p),
                }));
                this.currentPatient.set(null);
                this.toastSrv.success('Patient returned to queue for transfer');
                break;
            case 'record':
                this.router.navigate(['/admin/clinic/medical-record'], { queryParams: { patientId: current.patientId } });
                break;
            case 'print':
                this.toastSrv.success('Printing prescription…');
                break;
        }
    }

    onConfirmComplete(): void {
        if (this.completeForm.invalid) return;
        const current = this.currentPatient();
        if (!current) return;

        const formValue = this.completeForm.value;
        this.appointmentSrv
            .completeConsultation(current.appointmentId, {
                diagnosis: formValue.diagnosis ?? '',
                treatmentPlan: formValue.treatmentPlan ?? '',
                followUpDate: formValue.followUpDate ?? '',
                doctorNotes: formValue.doctorNotes ?? '',
            })
            .subscribe({
                next: () => {
                    this.snapshot.update(s => ({
                        ...s,
                        patients: s.patients.map(p => p.id === current.id ? { ...p, status: 'completed' } : p),
                    }));
                    this.currentPatient.set(null);
                    this.showCompleteModal.set(false);
                    this.completeForm.reset();
                    this.toastSrv.success('Consultation completed');
                    this.refreshSnapshot();
                },
                error: () => this.toastSrv.error('Failed to complete consultation')
            });
    }
    // #endregion
}
