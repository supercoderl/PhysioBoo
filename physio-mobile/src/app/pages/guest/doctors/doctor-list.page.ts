import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSearchbar,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonIcon,
    IonSkeletonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardContent,
    IonButton,
    IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { medicalOutline, refreshOutline, timeOutline, chevronForwardOutline } from 'ionicons/icons';
import { DoctorService } from '../../../services/domain/doctor.service';
import { Doctor } from '../../../shared/types/doctor.types';
import { PaginationData, PaginationDataWithInit } from '../../../shared/types/common';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { LoadingKeys } from '../../../shared/types/loading';

const PAGE_SIZE = 15;

@Component({
    selector: 'app-doctor-list',
    standalone: true,
    imports: [
        CommonModule,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonSearchbar,
        IonList,
        IonItem,
        IonAvatar,
        IonLabel,
        IonIcon,
        IonSkeletonText,
        IonInfiniteScroll,
        IonInfiniteScrollContent,
        IonRefresher,
        IonRefresherContent,
        IonCard,
        IonCardContent,
        IonButton,
        IonText,
    ],
    templateUrl: './doctor-list.page.html',
    styleUrl: './doctor-list.page.scss',
})
export class DoctorListPage implements OnInit {
    private doctorSrv = inject(DoctorService);
    private router = inject(Router);
    protected loadingSrv = inject(LocalLoadingService);

    private search$ = new Subject<string>();

    doctors: Doctor[] = [];
    page: PaginationData<Doctor> = PaginationDataWithInit<Doctor>();
    searchTerm = '';
    pageNumber = 1;
    loadError = false;
    isFirstLoading = this.loadingSrv.getLoadingSignal(LoadingKeys.DOCTOR.SEARCH);

    constructor() {
        addIcons({ medicalOutline, refreshOutline, timeOutline, chevronForwardOutline });
    }

    ngOnInit(): void {
        this.search$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
            this.searchTerm = term;
            this.resetAndLoad();
        });
        this.resetAndLoad();
    }

    onSearchChange(ev: any): void {
        this.search$.next(ev.detail.value ?? '');
    }

    resetAndLoad(complete?: () => void): void {
        this.pageNumber = 1;
        this.loadError = false;
        this.doctorSrv
            .search({ pageNumber: this.pageNumber, pageSize: PAGE_SIZE, search: this.searchTerm, filter: {} })
            .subscribe({
                next: (res) => {
                    this.page = res.data ?? PaginationDataWithInit<Doctor>();
                    this.doctors = this.page.items;
                    complete?.();
                },
                error: () => {
                    this.loadError = true;
                    complete?.();
                },
            });
    }

    loadMore(ev: any): void {
        if (!this.page.hasNext) {
            ev.target.complete();
            ev.target.disabled = true;
            return;
        }
        this.pageNumber++;
        this.doctorSrv
            .search({ pageNumber: this.pageNumber, pageSize: PAGE_SIZE, search: this.searchTerm, filter: {} })
            .subscribe({
                next: (res) => {
                    this.page = res.data ?? this.page;
                    this.doctors = [...this.doctors, ...this.page.items];
                    ev.target.complete();
                },
                error: () => {
                    this.pageNumber--;
                    ev.target.complete();
                },
            });
    }

    onRefresh(ev: any): void {
        this.resetAndLoad(() => ev.target.complete());
    }

    goToDetail(id: string): void {
        this.router.navigate(['/doctors', id]);
    }
}
