import { DatePipe, DOCUMENT, NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
} from '@physioboo/ui';
import { Subject, interval, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { StatCardComponent } from '../../../../components/ui/stat-card.component';
import { AppointmentService } from '../../../../services/admin/appointment.service';
import { DoctorDeskService } from '../../../../services/admin/doctor-desk.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { SKIP_ERROR_TOAST } from '../../../../shared/contexts/option.context';
import { DoctorDeskSnapshot, QueuePatient } from '../../../../shared/types/doctor-desk.types';
import { CompleteConsultationDrawerComponent } from './components/complete-consultation-drawer.component';
import { CompletedListComponent } from './components/completed-list.component';
import { ConsultationPanelComponent } from './components/consultation-panel.component';
import { WaitingQueuePanelComponent } from './components/waiting-queue-panel.component';

type LoadError = 'forbidden' | 'noProfile' | 'failed';

const POLL_MS = 30_000;

/**
 * Doctor desk: today's visits of the signed-in doctor, from the doctor-desk snapshot API. A visit's place on the page
 * comes only from the status the server returns (checked in = waiting, in progress = with the doctor, completed), so a
 * reload shows the same state. Starting and completing a consultation use the appointment status and complete APIs.
 */
@Component({
    selector: 'admin-doctor-desk',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooIconComponent,
        BooInlineErrorComponent,
        StatCardComponent,
        ConsultationPanelComponent,
        WaitingQueuePanelComponent,
        CompletedListComponent,
        CompleteConsultationDrawerComponent,
    ],
    templateUrl: './doctor-desk.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminDoctorDeskComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly doctorDeskSrv = inject(DoctorDeskService);
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly authSrv = inject(AuthService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly document = inject(DOCUMENT);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    readonly today = new Date();

    /** Null until the first successful load. */
    readonly snapshot = signal<DoctorDeskSnapshot | null>(null);
    readonly context = computed(() => this.snapshot()?.context ?? null);
    readonly inConsultation = computed(() => (this.snapshot()?.patients ?? []).filter(p => p.status === 'inprogress'));
    readonly completedPatients = computed(() => (this.snapshot()?.patients ?? []).filter(p => p.status === 'completed'));
    /** Urgent first; the server already lists visits by check-in time and the sort is stable. */
    readonly waitingPatients = computed(() =>
        (this.snapshot()?.patients ?? [])
            .filter(p => p.status === 'checkedin')
            .sort((a, b) => Number(b.priority === 'urgent') - Number(a.priority === 'urgent')));
    readonly urgentWaiting = computed(() => this.waitingPatients().filter(p => p.priority === 'urgent').length);

    loading = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    lastUpdated: Date | null = null;

    /** Appointment whose consultation is being started. */
    startingId: string | null = null;
    /** The visit the completion drawer is for; kept while the drawer slides out so its header doesn't blank. */
    completing: QueuePatient | null = null;
    completeOpen = false;

    canStart = false;
    canComplete = false;
    recordLink: string | null = null;

    private readonly load$ = new Subject<void>();
    private readonly silent = new HttpContext().set(SKIP_ERROR_TOAST, true);
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        // switchMap drops a response the user has already refreshed past; the error is caught per request so the stream lives on.
        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    return this.doctorDeskSrv.getSnapshot(this.silent).pipe(
                        map(res => res?.success && res.data ? { data: res.data, error: null } : { data: null, error: 'failed' as LoadError }),
                        catchError((err: HttpErrorResponse) => of({ data: null, error: this.errorKind(err) })),
                        finalize(() => this.loading = false),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(({ data, error }) => this.applyResult(data, error));

        this.load();

        if (this.isBrowser) {
            // Check-ins and other screens move the queue, so refresh while the tab is visible and nothing is in flight.
            interval(POLL_MS)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    if (!this.document.hidden && !this.loading && !this.startingId && !this.loadError) this.load();
                });
        }
    }
    // #endregion

    // #region Getters
    /** Why Call is unavailable, or null. One consultation at a time keeps "With you" unambiguous. */
    get callBlockedReason(): string | null {
        return this.inConsultation().length ? 'Complete the consultation in progress before calling the next patient.' : null;
    }

    get errorTitle(): string {
        switch (this.loadError) {
            case 'forbidden': return 'You don’t have access to the doctor desk';
            case 'noProfile': return 'This account has no doctor profile';
            default: return 'We couldn’t load the doctor desk';
        }
    }

    get errorDescription(): string {
        switch (this.loadError) {
            case 'forbidden': return 'Ask an administrator to grant the doctor desk permission.';
            case 'noProfile': return 'The doctor desk lists the signed-in doctor’s visits. Ask an administrator to link your user to a doctor profile.';
            default: return 'Something went wrong while loading today’s visits. Try again.';
        }
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.snapshot() && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    callPatient(patient: QueuePatient): void {
        if (this.startingId || this.callBlockedReason) return;
        this.startingId = patient.appointmentId;
        // Failures are reported by the global HTTP error toast; the patient stays in the queue.
        this.appointmentSrv.updateStatus(patient.appointmentId, 'InProgress')
            .pipe(finalize(() => this.startingId = null), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.setStatus(patient.appointmentId, 'inprogress');
                    this.toastSrv.success(`${patient.name || 'Patient'} · ${patient.queueNumber}`, 'Consultation started');
                    this.load();
                },
                error: () => undefined,
            });
    }

    openComplete(patient: QueuePatient): void {
        this.completing = patient;
        this.completeOpen = true;
    }

    closeComplete(): void {
        this.completeOpen = false;
    }

    onCompleted(patient: QueuePatient): void {
        this.completeOpen = false;
        this.setStatus(patient.appointmentId, 'completed');
        this.load();
    }

    trackById(_: number, p: QueuePatient): string {
        return p.appointmentId;
    }
    // #endregion

    // #region Helpers
    private applyResult(data: DoctorDeskSnapshot | null, error: LoadError | null): void {
        if (data) {
            this.snapshot.set(data);
            this.loadError = null;
            this.refreshErrorState = 'default';
            this.lastUpdated = new Date();
            return;
        }
        // A failed refresh keeps the previous visits on screen; a failed first load shows the error state.
        this.refreshErrorState = this.snapshot() && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
        this.loadError = error ?? 'failed';
    }

    /** Moves a visit now so the page doesn't wait for the reload; the reload then confirms it. */
    private setStatus(appointmentId: string, status: string): void {
        this.snapshot.update(s => s && ({
            ...s,
            patients: s.patients.map(p => p.appointmentId === appointmentId ? { ...p, status } : p),
        }));
    }

    private errorKind(err: HttpErrorResponse): LoadError {
        if (err?.status === 403) return 'forbidden';
        // The API answers "not found" when the signed-in user has no doctor record.
        if (err?.status === 404) return 'noProfile';
        return 'failed';
    }

    private applyPermissions(perms: string[]): void {
        // Each action follows the permission its API enforces.
        this.canStart = perms.includes(Permissions.Scheduling.AppointmentUpdate);
        this.canComplete = perms.includes(Permissions.Scheduling.EncounterComplete);
        this.recordLink = perms.includes(Permissions.Clinical.MedicalRecordRead) ? '/admin/clinic/medical-record' : null;
    }
    // #endregion
}
