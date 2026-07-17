import { Component, OnInit, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { DoctorDeskService } from "../../../../services/admin/doctor-desk.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { DoctorDeskContext, QueuePatient, StatDef } from "../../../../shared/types/doctor-desk.types";
import { CompletedListComponent } from "./components/completed-list.component";
import { CurrentPatientAction, CurrentPatientPanelComponent } from "./components/current-patient-panel.component";
import { DeskHeaderComponent } from "./components/desk-header.component";
import { WaitingQueuePanelComponent } from "./components/waiting-queue-panel.component";
import { LoadingKeys } from "../../../../shared/types/loading";

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
    context = signal<DoctorDeskContext | null>(null);
    patients = signal<QueuePatient[]>([]);
    currentPatient = signal<QueuePatient | null>(null);

    waitingPatients = computed(() =>
        this.patients()
            .filter(p => p.status === 'waiting')
            .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === 'urgent' ? -1 : 1))
    );
    completedPatients = computed(() => this.patients().filter(p => p.status === 'completed'));

    readonly stats: StatDef[] = [
        { label: 'Patients Today', icon: 'users-round', tone: 'primary', value: () => this.patients().length },
        { label: 'Waiting', icon: 'clock', tone: 'warning', value: () => this.waitingPatients().length },
        { label: 'In Consultation', icon: 'stethoscope', tone: 'primary', value: () => this.currentPatient() ? 1 : 0 },
        { label: 'Completed', icon: 'circle-check-big', tone: 'success', value: () => this.completedPatients().length },
        { label: 'Urgent', icon: 'triangle-alert', tone: 'danger', value: () => this.waitingPatients().filter(p => p.priority === 'urgent').length },
    ];

    LoadingKeys = LoadingKeys;
    // #endregion

    // #region Inject Services
    private readonly doctorDeskSrv = inject(DoctorDeskService);
    private readonly toastSrv = inject(ToastService);
    private readonly router = inject(Router);
    protected readonly loadingSrv = inject(LocalLoadingService);
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.doctorDeskSrv.getSnapshot().subscribe({
            next: (snapshot) => {
                this.context.set(snapshot.context);
                this.patients.set(snapshot.patients);
                this.currentPatient.set(snapshot.patients.find(p => p.status === 'in-consultation') ?? null);
            }
        });
    }
    // #endregion

    // #region Methods
    callNextPatient(): void {
        const next = this.waitingPatients()[0];
        if (!next) return;
        this.startConsultation(next);
    }

    callPatient(patient: QueuePatient): void {
        this.startConsultation(patient);
    }

    private startConsultation(patient: QueuePatient): void {
        this.patients.update(list => list.map(p =>
            p.id === patient.id
                ? { ...p, status: 'in-consultation', consultationStartedAt: new Date().toISOString() }
                : p
        ));
        this.currentPatient.set({ ...patient, status: 'in-consultation', consultationStartedAt: new Date().toISOString() });
    }

    onCurrentPatientAction(action: CurrentPatientAction): void {
        const current = this.currentPatient();
        if (!current) return;

        switch (action) {
            case 'complete':
                this.patients.update(list => list.map(p => p.id === current.id ? { ...p, status: 'completed' } : p));
                this.currentPatient.set(null);
                this.toastSrv.success('Consultation completed');
                break;
            case 'transfer':
                this.patients.update(list => list.map(p => p.id === current.id ? { ...p, status: 'waiting' } : p));
                this.currentPatient.set(null);
                this.toastSrv.success('Patient returned to queue for transfer');
                break;
            case 'record':
                this.router.navigate(['/admin/clinic/medical-record'], { queryParams: { patientId: current.id } });
                break;
            case 'print':
                this.toastSrv.success('Printing prescription…');
                break;
        }
    }
    // #endregion
}
