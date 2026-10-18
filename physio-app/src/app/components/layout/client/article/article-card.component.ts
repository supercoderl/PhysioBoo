import { Component, Input } from '@angular/core';
import { ArticleCategory } from '../../../../shared/enums/article';
import { SharedModule } from '../../../../shared/shared-imports';
import { PublicArticle } from '../../../../shared/types/public-article.types';

/** Public article card (design: ArticleCard.dc.html). The whole card links to /blog/:id. */
@Component({
  selector: 'article-card',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div *ngIf="skeleton; else card" aria-hidden="true" class="h-full border border-gray-200 rounded-2xl overflow-hidden bg-surface">
      <div class="aspect-[16/10] bg-[#F4ECEF] animate-pulse motion-reduce:animate-none"></div>
      <div class="p-5 flex flex-col gap-2.5">
        <span class="h-3 w-2/5 rounded-md bg-[#F4ECEF]"></span>
        <span class="h-[18px] w-[90%] rounded-md bg-gray-200"></span>
        <span class="h-[18px] w-3/5 rounded-md bg-gray-200"></span>
        <span class="h-3 w-full rounded-md bg-[#F7F0F2] mt-1.5"></span>
      </div>
    </div>

    <ng-template #card>
      <a
        *ngIf="article as a"
        [routerLink]="['/blog', a.id]"
        class="h-full flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-surface text-gray-900 hover:text-gray-900 hover:shadow-[0_12px_32px_rgba(38,20,26,.08)] transition-shadow"
      >
        <div class="relative aspect-[16/10] bg-[#FAF5F7]">
          <img
            *ngIf="a.coverImageUrl && !imageFailed"
            [src]="a.coverImageUrl"
            alt=""
            loading="lazy"
            class="absolute inset-0 w-full h-full object-cover"
            (error)="imageFailed = true"
          />
          <span *ngIf="!a.coverImageUrl || imageFailed" class="absolute inset-0 flex items-center justify-center text-[#C9B9C0]" aria-hidden="true">
            <physio-icon name="newspaper" [size]="36" />
          </span>
        </div>
        <div class="p-5 flex flex-col gap-2 flex-1">
          <div class="flex gap-2.5 items-center flex-wrap">
            <span class="text-xs font-semibold px-2.5 py-[3px] rounded-full bg-primarySoft text-primaryDeep">{{ category }}</span>
            <span *ngIf="a.publishDate" class="text-[13px] text-gray-700">{{ a.publishDate | date: 'd MMMM y' }}</span>
          </div>
          <h3 class="text-[17px] leading-[25px] font-semibold m-0 line-clamp-2">{{ a.title }}</h3>
          <p *ngIf="a.excerpt" class="text-sm leading-[21px] text-gray-700 m-0 line-clamp-2">{{ a.excerpt }}</p>
          <div *ngIf="showMeta && (a.author || a.readTime)" class="mt-auto pt-2.5 flex gap-x-3 gap-y-1.5 items-center flex-wrap text-[13px] text-gray-700">
            <span *ngIf="a.author" class="flex gap-2 items-center font-medium text-gray-800 min-w-0">
              <span aria-hidden="true" class="w-6 h-6 rounded-full bg-primarySoft text-primaryDeep text-[10px] font-semibold flex items-center justify-center flex-none">{{ initials }}</span>
              <span class="truncate">{{ a.author }}</span>
            </span>
            <span *ngIf="a.readTime" class="flex gap-1.5 items-center">
              <physio-icon name="clock" [size]="13" />{{ a.readTime }}
            </span>
          </div>
          <span class="pt-1.5 text-sm font-semibold text-primaryDeep flex gap-1.5 items-center" [class.mt-auto]="!showMeta || !(a.author || a.readTime)">
            {{ ctaLabel }}<physio-icon name="arrow-right" [size]="15" />
          </span>
        </div>
      </a>
    </ng-template>
  `
})
export class ArticleCardComponent {
  @Input() article: PublicArticle | null = null;
  @Input() skeleton = false;
  /** Shows author and read time; off by default so the related-article cards stay as they were. */
  @Input() showMeta = false;
  @Input() ctaLabel = 'Read article';

  imageFailed = false;

  get initials(): string {
    return (this.article?.author ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  get category(): string {
    return this.article ? ArticleCategory[this.article.category] ?? '' : '';
  }
}
