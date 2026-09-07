import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonSkeletonText,
    IonAvatar,
    IonText,
    IonRefresher,
    IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    medicalOutline,
    businessOutline,
    newspaperOutline,
    arrowForwardOutline,
    starOutline,
    refreshOutline,
} from 'ionicons/icons';
import { DoctorService } from '../../../services/domain/doctor.service';
import { Doctor } from '../../../shared/types/doctor.types';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { LoadingKeys } from '../../../shared/types/loading';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButton,
        IonIcon,
        IonCard,
        IonCardContent,
        IonSkeletonText,
        IonAvatar,
        IonText,
        IonRefresher,
        IonRefresherContent,
    ],
    templateUrl: './home.page.html',
    styleUrl: './home.page.scss',
})
export class HomePage implements OnInit {
    private doctorSrv = inject(DoctorService);
    private router = inject(Router);
    protected loadingSrv = inject(LocalLoadingService);

    featuredDoctors: Doctor[] = [];
    loadError = false;
    isLoadingFeatured = this.loadingSrv.getLoadingSignal(LoadingKeys.DOCTOR.SEARCH);

    constructor() {
        addIcons({ medicalOutline, businessOutline, newspaperOutline, arrowForwardOutline, starOutline, refreshOutline });
    }

    ngOnInit(): void {
        this.loadFeaturedDoctors();
    }

    loadFeaturedDoctors(complete?: () => void): void {
        this.loadError = false;
        this.doctorSrv.search({ pageNumber: 1, pageSize: 6, filter: {} }).subscribe({
            next: (res) => {
                this.featuredDoctors = res.data?.items ?? [];
                complete?.();
            },
            error: () => {
                this.loadError = true;
                complete?.();
            },
        });
    }

    onRefresh(ev: any): void {
        this.loadFeaturedDoctors(() => ev.target.complete());
    }

    goToDoctor(id: string): void {
        this.router.navigate(['/doctors', id]);
    }
}
