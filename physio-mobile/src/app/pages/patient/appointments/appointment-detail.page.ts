import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonSkeletonText,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chatbubbleOutline, medicalOutline, personOutline, timeOutline } from 'ionicons/icons';
import { AppointmentService } from '../../../services/domain/appointment.service';
import { AppointmentRecord } from '../../../shared/types/appointment.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-appointment-detail',
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonIcon,
        IonSkeletonText,
        StateMessageComponent
    ],
    templateUrl: './appointment-detail.page.html',
    styleUrls: ['./appointment-detail.page.scss']
})
export class AppointmentDetailPage implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly appointmentSrv = inject(AppointmentService);

    loading = signal(true);
    loadFailed = signal(false);
    appointment = signal<AppointmentRecord | null>(null);

    constructor() {
        addIcons({ calendarOutline, timeOutline, personOutline, medicalOutline, chatbubbleOutline });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.loading.set(false);
            this.loadFailed.set(true);
            return;
        }
        this.appointmentSrv.getById(id).subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.success && res.data) {
                    this.appointment.set(res.data);
                } else {
                    this.loadFailed.set(true);
                }
            },
            error: () => {
                this.loading.set(false);
                this.loadFailed.set(true);
            }
        });
    }

    goBack(): void {
        this.router.navigateByUrl('/patient/appointments');
    }
}
