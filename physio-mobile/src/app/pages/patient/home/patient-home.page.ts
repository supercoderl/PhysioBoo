import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonSkeletonText,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chevronForwardOutline, documentTextOutline, timeOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { AppointmentService } from '../../../services/domain/appointment.service';
import { AppointmentRecord } from '../../../shared/types/appointment.types';
import { UserProfileBase } from '../../../shared/types/core.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-patient-home',
    standalone: true,
    imports: [
        CommonModule,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonCard,
        IonCardContent,
        IonButton,
        IonIcon,
        IonSkeletonText,
        StateMessageComponent
    ],
    templateUrl: './patient-home.page.html',
    styleUrls: ['./patient-home.page.scss']
})
export class PatientHomePage implements OnInit {
    private readonly authSrv = inject(AuthService);
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly router = inject(Router);

    readonly userInfo$ = this.authSrv.userInfo$;

    loading = signal(true);
    /** true once we know the call failed (403 permission gap today, or any other error/success:false). */
    loadFailed = signal(false);
    nextAppointment = signal<AppointmentRecord | null>(null);

    constructor() {
        addIcons({ calendarOutline, chevronForwardOutline, documentTextOutline, timeOutline });
    }

    ngOnInit(): void {
        this.loadNextAppointment();
    }

    private loadNextAppointment(): void {
        const patientId = this.authSrv.getPatientId();
        if (!patientId) {
            this.loading.set(false);
            this.loadFailed.set(false);
            this.nextAppointment.set(null);
            return;
        }

        this.loading.set(true);
        this.loadFailed.set(false);

        const todayIso = new Date().toISOString().slice(0, 10);

        this.appointmentSrv
            .search({
                pageNumber: 1,
                pageSize: 10,
                filter: { patientId, start: todayIso }
            })
            .subscribe({
                next: (res) => {
                    this.loading.set(false);
                    if (res.success && res.data) {
                        const upcoming = (res.data.items ?? [])
                            .filter(a => ['Scheduled', 'Confirmed', 'CheckedIn'].includes(a.status))
                            .sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`));
                        this.nextAppointment.set(upcoming[0] ?? null);
                    } else {
                        // res.success === false -> treat the same as a caught error (permission gap).
                        this.loadFailed.set(true);
                    }
                },
                error: () => {
                    this.loading.set(false);
                    this.loadFailed.set(true);
                }
            });
    }

    initials(user: UserProfileBase | null): string {
        if (!user) return '';
        return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
    }

    goBook(): void {
        this.router.navigateByUrl('/patient/appointments/book');
    }

    goRecords(): void {
        this.router.navigateByUrl('/patient/records');
    }

    goAppointmentDetail(): void {
        const appt = this.nextAppointment();
        if (appt) this.router.navigateByUrl(`/patient/appointments/${appt.id}`);
    }
}
