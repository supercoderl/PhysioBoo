import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonText,
    IonSkeletonText,
    IonCard,
    IonCardContent,
    IonButton,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
    locationOutline,
    callOutline,
    mailOutline,
    globeOutline,
    medkitOutline,
    pulseOutline,
    refreshOutline,
    businessOutline,
} from 'ionicons/icons';
import { HospitalService } from '../../../services/domain/hospital.service';
import { DepartmentService } from '../../../services/domain/department.service';
import { Hospital, Department } from '../../../shared/types/facility.types';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { LoadingKeys } from '../../../shared/types/loading';

@Component({
    selector: 'app-facility-detail',
    standalone: true,
    imports: [
        CommonModule,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonIcon,
        IonText,
        IonSkeletonText,
        IonCard,
        IonCardContent,
        IonButton,
        IonBadge,
        IonList,
        IonItem,
        IonLabel,
    ],
    templateUrl: './facility-detail.page.html',
    styleUrl: './facility-detail.page.scss',
})
export class FacilityDetailPage implements OnInit {
    private route = inject(ActivatedRoute);
    private hospitalSrv = inject(HospitalService);
    private departmentSrv = inject(DepartmentService);
    protected loadingSrv = inject(LocalLoadingService);

    hospital: Hospital | null = null;
    departments: Department[] = [];
    departmentsLoaded = false;
    notFound = false;
    loadError = false;
    hospitalId = '';
    isLoading = this.loadingSrv.getLoadingSignal(LoadingKeys.HOSPITAL.GET_BY_ID);

    constructor() {
        addIcons({
            locationOutline,
            callOutline,
            mailOutline,
            globeOutline,
            medkitOutline,
            pulseOutline,
            refreshOutline,
            businessOutline,
        });
    }

    ngOnInit(): void {
        this.hospitalId = this.route.snapshot.paramMap.get('id') ?? '';
        this.load();
    }

    load(): void {
        if (!this.hospitalId) {
            this.notFound = true;
            return;
        }
        this.loadError = false;
        this.notFound = false;
        this.hospitalSrv.getById(this.hospitalId).subscribe({
            next: (res) => {
                this.hospital = res.data;
                if (!this.hospital) {
                    this.notFound = true;
                } else {
                    this.loadDepartments();
                }
            },
            error: () => {
                this.loadError = true;
            },
        });
    }

    formattedAddress(hospital: Hospital): string {
        return [hospital.address, hospital.city, hospital.country].filter((v) => !!v).join(', ');
    }

    private loadDepartments(): void {
        this.departmentSrv
            .search({ pageNumber: 1, pageSize: 20, filter: { hospitalId: this.hospitalId } })
            .subscribe({
                next: (res) => {
                    this.departments = res.data?.items ?? [];
                    this.departmentsLoaded = true;
                },
                error: () => {
                    // Departments are a nice-to-have on this screen; fail silently and just hide the section.
                    this.departmentsLoaded = true;
                },
            });
    }
}
