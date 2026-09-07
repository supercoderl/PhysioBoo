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
import { newspaperOutline, refreshOutline, calendarOutline, personOutline } from 'ionicons/icons';
import { ArticleService } from '../../../services/domain/article.service';
import { Article } from '../../../shared/types/article.types';
import { PaginationData, PaginationDataWithInit } from '../../../shared/types/common';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { LoadingKeys } from '../../../shared/types/loading';

const PAGE_SIZE = 12;

@Component({
    selector: 'app-news-list',
    standalone: true,
    imports: [
        CommonModule,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonSearchbar,
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
    templateUrl: './news-list.page.html',
    styleUrl: './news-list.page.scss',
})
export class NewsListPage implements OnInit {
    private articleSrv = inject(ArticleService);
    private router = inject(Router);
    protected loadingSrv = inject(LocalLoadingService);

    private search$ = new Subject<string>();

    articles: Article[] = [];
    page: PaginationData<Article> = PaginationDataWithInit<Article>();
    searchTerm = '';
    pageNumber = 1;
    loadError = false;
    isFirstLoading = this.loadingSrv.getLoadingSignal(LoadingKeys.ARTICLE.SEARCH);

    constructor() {
        addIcons({ newspaperOutline, refreshOutline, calendarOutline, personOutline });
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
        this.articleSrv
            .search({ pageNumber: this.pageNumber, pageSize: PAGE_SIZE, search: this.searchTerm, filter: {} })
            .subscribe({
                next: (res) => {
                    this.page = res.data ?? PaginationDataWithInit<Article>();
                    this.articles = this.page.items;
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
        this.articleSrv
            .search({ pageNumber: this.pageNumber, pageSize: PAGE_SIZE, search: this.searchTerm, filter: {} })
            .subscribe({
                next: (res) => {
                    this.page = res.data ?? this.page;
                    this.articles = [...this.articles, ...this.page.items];
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
        this.router.navigate(['/news', id]);
    }
}
