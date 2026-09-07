import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
    IonAvatar,
    IonButton,
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
import {
    cardOutline,
    chevronForwardOutline,
    createOutline,
    logOutOutline,
    mailOutline,
    callOutline,
    medicalOutline,
    shieldCheckmarkOutline
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { PatientService } from '../../../services/domain/patient.service';
import { Patient } from '../../../shared/types/patient.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonAvatar,
        IonList,
        IonItem,
        IonLabel,
        IonIcon,
        IonButton,
        IonSkeletonText,
        StateMessageComponent
    ],
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss']
})
export class ProfilePage implements OnInit {
    private readonly authSrv = inject(AuthService);
    private readonly patientSrv = inject(PatientService);
    private readonly router = inject(Router);

    readonly userInfo$ = this.authSrv.userInfo$;
    readonly patientId = this.authSrv.getPatientId();

    loading = signal(true);
    loadFailed = signal(false);
    patient = signal<Patient | null>(null);

    constructor() {
        addIcons({ mailOutline, callOutline, createOutline, cardOutline, logOutOutline, chevronForwardOutline, medicalOutline, shieldCheckmarkOutline });
    }

    ngOnInit(): void {
        if (!this.patientId) {
            this.loading.set(false);
            return;
        }
        this.patientSrv.getById(this.patientId).subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.success && res.data) {
                    this.patient.set(res.data);
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

    initials(fullName?: string): string {
        if (!fullName) return '';
        return fullName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p[0])
            .join('')
            .toUpperCase();
    }

    goEdit(): void {
        this.router.navigateByUrl('/patient/profile/edit');
    }

    goBilling(): void {
        this.router.navigateByUrl('/patient/profile/billing');
    }

    logout(): void {
        this.authSrv.logout().subscribe(() => this.router.navigateByUrl('/auth/login'));
    }
}
