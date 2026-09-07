import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonAvatar,
    IonChip,
    IonIcon,
    IonText,
    IonSkeletonText,
    IonCard,
    IonCardContent,
    IonButton,
    IonLabel,
    IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    starOutline,
    timeOutline,
    languageOutline,
    businessOutline,
    videocamOutline,
    homeOutline,
    refreshOutline,
    calendarOutline,
    cashOutline,
} from 'ionicons/icons';
import { DoctorService } from '../../../services/domain/doctor.service';
import { Doctor } from '../../../shared/types/doctor.types';
import { AuthService } from '../../../services/auth/auth.service';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { LoadingKeys } from '../../../shared/types/loading';

@Component({
    selector: 'app-doctor-detail',
    standalone: true,
    imports: [
        CommonModule,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonAvatar,
        IonChip,
        IonIcon,
        IonText,
        IonSkeletonText,
        IonCard,
        IonCardContent,
        IonButton,
        IonLabel,
        IonFooter,
    ],
    templateUrl: './doctor-detail.page.html',
    styleUrl: './doctor-detail.page.scss',
})
export class DoctorDetailPage implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private doctorSrv = inject(DoctorService);
    private authSrv = inject(AuthService);
    protected loadingSrv = inject(LocalLoadingService);

    doctor: Doctor | null = null;
    notFound = false;
    loadError = false;
    doctorId = '';
    isLoading = this.loadingSrv.getLoadingSignal(LoadingKeys.DOCTOR.GET_BY_ID);

    constructor() {
        addIcons({
            starOutline,
            timeOutline,
            languageOutline,
            businessOutline,
            videocamOutline,
            homeOutline,
            refreshOutline,
            calendarOutline,
            cashOutline,
        });
    }

    ngOnInit(): void {
        this.doctorId = this.route.snapshot.paramMap.get('id') ?? '';
        this.load();
    }

    load(): void {
        if (!this.doctorId) {
            this.notFound = true;
            return;
        }
        this.loadError = false;
        this.notFound = false;
        this.doctorSrv.getById(this.doctorId).subscribe({
            next: (res) => {
                this.doctor = res.data;
                if (!this.doctor) this.notFound = true;
            },
            error: () => {
                this.loadError = true;
            },
        });
    }

    bookAppointment(): void {
        if (this.authSrv.isAuthenticated()) {
            this.router.navigate(['/patient/appointments/book'], { queryParams: { doctorId: this.doctorId } });
        } else {
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/doctors/${this.doctorId}` } });
        }
    }
}
