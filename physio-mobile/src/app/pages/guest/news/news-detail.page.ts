import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, personOutline, timeOutline, refreshOutline } from 'ionicons/icons';
import { ArticleService } from '../../../services/domain/article.service';
import { Article } from '../../../shared/types/article.types';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { LoadingKeys } from '../../../shared/types/loading';

@Component({
    selector: 'app-news-detail',
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
    ],
    templateUrl: './news-detail.page.html',
    styleUrl: './news-detail.page.scss',
})
export class NewsDetailPage implements OnInit {
    private route = inject(ActivatedRoute);
    private articleSrv = inject(ArticleService);
    private sanitizer = inject(DomSanitizer);
    protected loadingSrv = inject(LocalLoadingService);

    article: Article | null = null;
    safeContent: SafeHtml | null = null;
    notFound = false;
    loadError = false;
    articleId = '';
    isLoading = this.loadingSrv.getLoadingSignal(LoadingKeys.ARTICLE.GET_BY_ID);

    constructor() {
        addIcons({ calendarOutline, personOutline, timeOutline, refreshOutline });
    }

    ngOnInit(): void {
        this.articleId = this.route.snapshot.paramMap.get('id') ?? '';
        this.load();
    }

    load(): void {
        if (!this.articleId) {
            this.notFound = true;
            return;
        }
        this.loadError = false;
        this.notFound = false;
        this.articleSrv.getById(this.articleId).subscribe({
            next: (res) => {
                this.article = res.data;
                if (!this.article) {
                    this.notFound = true;
                } else {
                    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content || '');
                }
            },
            error: () => {
                this.loadError = true;
            },
        });
    }
}
