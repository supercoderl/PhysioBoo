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
    IonThumbnail,
    IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { businessOutline, refreshOutline, locationOutline, chevronForwardOutline, medkitOutline } from 'ionicons/icons';
import { HospitalService } from '../../../services/domain/hospital.service';
import { Hospital } from '../../../shared/types/facility.types';
import { PaginationData, PaginationDataWithInit } from '../../../shared/types/common';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { LoadingKeys } from '../../../shared/types/loading';

const PAGE_SIZE = 15;

@Component({
    selector: 'app-facility-list',
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
        IonThumbnail,
        IonBadge,
    ],
    templateUrl: './facility-list.page.html',
    styleUrl: './facility-list.page.scss',
})
export class FacilityListPage implements OnInit {
    private hospitalSrv = inject(HospitalService);
    private router = inject(Router);
    protected loadingSrv = inject(LocalLoadingService);

    private search$ = new Subject<string>();

    hospitals: Hospital[] = [];
    page: PaginationData<Hospital> = PaginationDataWithInit<Hospital>();
    searchTerm = '';
    pageNumber = 1;
    loadError = false;
    isFirstLoading = this.loadingSrv.getLoadingSignal(LoadingKeys.HOSPITAL.SEARCH);

    constructor() {
        addIcons({ businessOutline, refreshOutline, locationOutline, chevronForwardOutline, medkitOutline });
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
        this.hospitalSrv
            .search({ pageNumber: this.pageNumber, pageSize: PAGE_SIZE, search: this.searchTerm, filter: {} })
            .subscribe({
                next: (res) => {
                    this.page = res.data ?? PaginationDataWithInit<Hospital>();
                    this.hospitals = this.page.items;
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
        this.hospitalSrv
            .search({ pageNumber: this.pageNumber, pageSize: PAGE_SIZE, search: this.searchTerm, filter: {} })
            .subscribe({
                next: (res) => {
                    this.page = res.data ?? this.page;
                    this.hospitals = [...this.hospitals, ...this.page.items];
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
        this.router.navigate(['/hospitals', id]);
    }
}
