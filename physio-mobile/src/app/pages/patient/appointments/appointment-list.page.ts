import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonSkeletonText,
    IonTitle,
    IonToolbar,
    RefresherCustomEvent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, chevronForwardOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { AppointmentService } from '../../../services/domain/appointment.service';
import { AppointmentRecord } from '../../../shared/types/appointment.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

type Segment = 'upcoming' | 'past';

@Component({
    selector: 'app-appointment-list',
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonRefresher,
        IonRefresherContent,
        IonSegment,
        IonSegmentButton,
        IonLabel,
        IonList,
        IonItem,
        IonIcon,
        IonSkeletonText,
        IonFab,
        IonFabButton,
        StateMessageComponent
    ],
    templateUrl: './appointment-list.page.html',
    styleUrls: ['./appointment-list.page.scss']
})
export class AppointmentListPage implements OnInit {
    private readonly authSrv = inject(AuthService);
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly router = inject(Router);

    segment = signal<Segment>('upcoming');
    loading = signal(true);
    loadFailed = signal(false);
    /** null = patient profile not linked to an account (distinct empty state). */
    notLinked = signal(false);
    appointments = signal<AppointmentRecord[]>([]);

    constructor() {
        addIcons({ addOutline, chevronForwardOutline });
    }

    ngOnInit(): void {
        this.load();
    }

    onSegmentChange(value: string): void {
        this.segment.set(value as Segment);
        this.load();
    }

    load(refresher?: RefresherCustomEvent): void {
        const patientId = this.authSrv.getPatientId();
        if (!patientId) {
            this.notLinked.set(true);
            this.loading.set(false);
            this.loadFailed.set(false);
            this.appointments.set([]);
            refresher?.target.complete();
            return;
        }

        this.notLinked.set(false);
        this.loading.set(true);
        this.loadFailed.set(false);

        const todayIso = new Date().toISOString().slice(0, 10);
        const filter = this.segment() === 'upcoming'
            ? { patientId, start: todayIso }
            : { patientId, end: todayIso };

        this.appointmentSrv
            .search({ pageNumber: 1, pageSize: 50, filter, sort: this.segment() === 'upcoming' ? 'scheduledDate' : '-scheduledDate' })
            .subscribe({
                next: (res) => {
                    this.loading.set(false);
                    refresher?.target.complete();
                    if (res.success && res.data) {
                        const items = res.data.items ?? [];
                        this.appointments.set(this.filterBySegment(items));
                    } else {
                        this.loadFailed.set(true);
                    }
                },
                error: () => {
                    this.loading.set(false);
                    this.loadFailed.set(true);
                    refresher?.target.complete();
                }
            });
    }

    private filterBySegment(items: AppointmentRecord[]): AppointmentRecord[] {
        const upcomingStatuses = ['Scheduled', 'Confirmed', 'CheckedIn', 'InProgress'];
        const filtered = this.segment() === 'upcoming'
            ? items.filter(a => upcomingStatuses.includes(a.status))
            : items.filter(a => !upcomingStatuses.includes(a.status));
        return filtered.sort((a, b) => {
            const cmp = `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`);
            return this.segment() === 'upcoming' ? cmp : -cmp;
        });
    }

    onRefresh(event: RefresherCustomEvent): void {
        this.load(event);
    }

    openDetail(appt: AppointmentRecord): void {
        this.router.navigateByUrl(`/patient/appointments/${appt.id}`);
    }

    goBook(): void {
        this.router.navigateByUrl('/patient/appointments/book');
    }
}
