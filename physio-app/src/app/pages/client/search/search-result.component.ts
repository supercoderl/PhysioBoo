import { Component, Input, OnChanges } from '@angular/core';
import { BooButtonComponent } from '@physioboo/ui';
import { SharedModule } from '../../../shared/shared-imports';

export type SearchResultKind = 'doctor' | 'service' | 'clinic' | 'article';

export interface SearchResultTag {
  icon: string;
  label: string;
}

/** One row of any result type; the search page maps each API item onto it. */
export interface SearchResultRow {
  kind: SearchResultKind;
  id: string;
  title: string;
  subtitle: string;
  lines: string[];
  tags: SearchResultTag[];
  link: string[];
  imageUrl: string | null;
}

const KIND: Record<SearchResultKind, { icon: string; action: string }> = {
  doctor: { icon: 'user', action: 'View profile' },
  service: { icon: 'heart-pulse', action: 'View service' },
  clinic: { icon: 'building-2', action: 'View clinic' },
  article: { icon: 'newspaper', action: 'Read article' },
};

/**
 * Search result row (design: SearchResult). Below `md` it switches to the compact layout:
 * smaller thumbnail and an inline action link instead of the button on the right.
 */
@Component({
  selector: 'search-result',
  standalone: true,
  imports: [BooButtonComponent, SharedModule],
  template: `
    <div *ngIf="skeleton || !row; else item" aria-hidden="true" class="bg-surface border border-gray-200 rounded-2xl p-4 md:px-5 md:py-[18px] flex gap-4 items-center">
      <span class="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#F4ECEF] flex-none animate-pulse motion-reduce:animate-none"></span>
      <div class="flex-1 flex flex-col gap-2 min-w-0">
        <span class="h-3 w-[30%] rounded-md bg-[#F4ECEF]"></span>
        <span class="h-4 w-[60%] rounded-md bg-gray-200"></span>
        <span class="h-3 w-[85%] rounded-md bg-[#F4ECEF]"></span>
      </div>
      <span class="hidden md:block w-[120px] h-11 rounded-[10px] bg-[#F4ECEF] flex-none"></span>
    </div>

    <ng-template #item>
      <article *ngIf="row as r" class="bg-surface border border-gray-200 rounded-2xl p-4 md:px-5 md:py-[18px] flex gap-4 items-start md:items-center min-w-0 text-gray-900 motion-card">
        <span
          *ngIf="r.kind === 'doctor'"
          aria-hidden="true"
          class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primarySoft text-primaryDeep font-semibold text-lg flex items-center justify-center flex-none overflow-hidden"
        >
          <img *ngIf="showImage; else initialsTpl" [src]="r.imageUrl" alt="" appImgFade class="w-full h-full object-cover" (error)="imageFailed = true" />
          <ng-template #initialsTpl>{{ initials }}</ng-template>
        </span>
        <span
          *ngIf="r.kind !== 'doctor'"
          aria-hidden="true"
          class="w-14 h-14 md:w-[88px] md:h-[72px] rounded-xl bg-[#FAF1F3] text-[#B8A3AC] flex items-center justify-center flex-none overflow-hidden"
        >
          <img *ngIf="showImage; else iconTpl" [src]="r.imageUrl" alt="" appImgFade class="w-full h-full object-cover" (error)="imageFailed = true" />
          <ng-template #iconTpl><physio-icon [name]="icon" [size]="24" /></ng-template>
        </span>

        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <span *ngIf="r.subtitle" class="text-[13px] leading-[19px] font-semibold text-primaryDeep">{{ r.subtitle }}</span>
          <h3 class="m-0 text-[17px] leading-[25px] font-semibold">
            <a [routerLink]="r.link" class="text-gray-900 hover:text-primaryDeep hover:underline">{{ r.title }}</a>
          </h3>
          <p *ngFor="let l of r.lines" class="m-0 text-sm leading-[21px] text-gray-800 line-clamp-2">{{ l }}</p>
          <div *ngIf="r.tags.length" class="flex gap-1.5 flex-wrap mt-1">
            <span *ngFor="let t of r.tags" class="text-xs leading-[18px] font-medium text-gray-800 bg-[#FAF1F3] rounded-full px-2.5 py-0.5 flex gap-1 items-center">
              <physio-icon [name]="t.icon" [size]="12" />{{ t.label }}
            </span>
          </div>
          <a
            [routerLink]="r.link"
            [attr.aria-label]="ariaAction"
            class="md:hidden min-h-11 flex gap-1.5 items-center text-[15px] font-semibold text-primaryDeep self-start motion-arrow"
          >{{ action }}<physio-icon name="arrow-right" [size]="16" /></a>
        </div>

        <a boo-button variant="secondary"
          [routerLink]="r.link"
          tabindex="-1"
          aria-hidden="true" class="hidden md:flex flex-none"
        >{{ action }}<physio-icon name="arrow-right" [size]="16" /></a>
      </article>
    </ng-template>
  `,
})
export class SearchResultComponent implements OnChanges {
  @Input() row: SearchResultRow | null = null;
  @Input() skeleton = false;

  imageFailed = false;

  ngOnChanges(): void {
    this.imageFailed = false;
  }

  get showImage(): boolean {
    return !!this.row?.imageUrl && !this.imageFailed;
  }

  get icon(): string {
    return KIND[this.row?.kind ?? 'doctor'].icon;
  }

  get action(): string {
    return KIND[this.row?.kind ?? 'doctor'].action;
  }

  get ariaAction(): string {
    return `${this.action}: ${this.row?.title ?? ''}`;
  }

  /** Last two words, so Vietnamese names show the given name. */
  get initials(): string {
    return (this.row?.title ?? '').split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase();
  }
}
