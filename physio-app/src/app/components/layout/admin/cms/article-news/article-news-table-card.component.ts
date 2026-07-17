import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { ArticleCategory, ArticleStatus } from "../../../../../shared/enums/article";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Article } from "../../../../../shared/types/article.types";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'cms-article-news-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    BooIconComponent
  ],
  template: `
    <div class="bg-surface rounded-[6px] border border-gray-200 h-full overflow-hidden">
      <boo-table-admin
        [data]="data?.items ?? []"
        tdClass="px-4 py-3"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? filter.pageNumber"
        [pageSize]="data?.pageSize ?? filter.pageSize"
        [totalItems]="data?.totalCount ?? 0"
        (pageChange)="onPageClick($event)"
        [loading]="loadingSrv.isLoading('search')"
      >
        <ng-template appColumnDef="select" type="checkbox" width="48px"></ng-template>

        <ng-template appColumnDef="coverImageUrl" headerLabel="Cover" headerClass="text-left" width="64px" let-item>
          <img
            *ngIf="item.coverImageUrl; else noCover"
            [src]="item.coverImageUrl"
            [alt]="item.title"
            class="w-10 h-10 rounded-md object-cover bg-gray-100"
          />
          <ng-template #noCover>
            <div class="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
              <boo-icon name="image" [size]="16" color="#9ca3af"></boo-icon>
            </div>
          </ng-template>
        </ng-template>

        <ng-template
          appColumnDef="title"
          headerLabel="Title"
          headerClass="text-left"
          [sortable]="true"
          [draggable]="true"
          [hasActions]="true"
          let-item
        >
          <div class="min-w-0" (click)="onEditClick(item.id)">
            <div class="truncate text-sm font-semibold text-danger cursor-pointer" [title]="item.title">
              {{ item.title }}
            </div>
            <div class="truncate text-xs text-secondary">{{ item.slug }}</div>
          </div>
        </ng-template>

        <ng-template
            appColumnDef="category"
            headerLabel="Category"
            headerClass="text-left"
            [sortable]="true"
            [draggable]="true"
            [hasActions]="true"
            let-item
        >
          <span
            class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            [ngClass]="{
              'bg-blue-100 text-blue-700': item.category === ArticleCategory.Medical,
              'bg-purple-100 text-purple-700': item.category === ArticleCategory.Research,
              'bg-indigo-100 text-indigo-700': item.category === ArticleCategory.Technology,
              'bg-emerald-100 text-emerald-700': item.category === ArticleCategory.Wellness,
              'bg-amber-100 text-amber-700': item.category === ArticleCategory.Community
            }"
          >
            {{ ArticleCategory[item.category] }}
          </span>
        </ng-template>

        <ng-template
            appColumnDef="status"
            headerLabel="Status"
            headerClass="text-left"
            [sortable]="true"
            [draggable]="true"
            [hasActions]="true"
            let-item
        >
          <span
            class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            [ngClass]="{
              'bg-gray-100 text-gray-700': item.status === ArticleStatus.Draft,
              'bg-green-100 text-green-700': item.status === ArticleStatus.Published,
              'bg-slate-100 text-slate-500': item.status === ArticleStatus.Archived
            }"
          >
            {{ ArticleStatus[item.status] }}
          </span>
        </ng-template>

        <ng-template
            appColumnDef="author"
            headerLabel="Author"
            headerClass="text-left"
            [draggable]="true"
            [hasActions]="true"
            let-item
        >
          <div class="text-sm">{{ item.author }}</div>
        </ng-template>

        <ng-template
            appColumnDef="publishDate"
            headerLabel="Publish Date"
            headerClass="text-left"
            [sortable]="true"
            [draggable]="true"
            [hasActions]="true"
            let-item
        >
          <div class="text-sm">{{ item.publishDate ? (item.publishDate | date:'mediumDate') : '—' }}</div>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
          <div class="relative">
            <boo-action-admin
              [items]="tableActions"
              [data]="item"
            />
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .pi {
        font-size: 0.875rem;
      }
    }
  `]
})
export class CmsArticleNewsTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<Article> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Output() pageChange = new EventEmitter<number>();
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();

  ArticleCategory = ArticleCategory;
  ArticleStatus = ArticleStatus;

  readonly tableActions: ActionItem[] = [
    {
      label: 'Delete',
      isDanger: true,
      onClick: (item: any) => this.onDeleteClick(item.id)
    }
  ];
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    protected loadingSrv: LocalLoadingService
  ) { }
  // #endregion

  // #region Methods
  onPageClick(page: number) {
    this.pageChange.emit(page);
  }

  onEditClick(id: string) {
    this.editClick.emit(id);
  }

  onDeleteClick(id: string) {
    this.deleteClick.emit(id);
  }
  // #endregion
}
