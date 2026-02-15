import { Component, computed, EventEmitter, input, Output } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { BooButtonAdminComponent } from "../../button/boo-button-admin/boo-button-admin.component";

@Component({
    selector: 'boo-pagination-admin',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent
    ],
    template: `
        <div class="flex items-center gap-1 select-none">   
            @if (loading()) {
                <div class="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>

                <div class="flex gap-1">
                @for (item of [1,2,3,4,5]; track $index) {
                    <div class="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                }
                </div>

                <div class="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            }

            @else {
                <boo-button-admin
                    [icon]="{ name: 'chevron-left', size: 16, iconClass: currentPage() === 1 ? '!stroke-placeholder' : '!stroke-regular' }"
                    [padding]="'0'" 
                    [radius]="4"
                    [buttonClass]="getNavButtonClass(currentPage() === 1)"
                    (click)="onPrev()"
                ></boo-button-admin>

                @for (page of visiblePages(); track $index) {
                    @if (page !== '...') {
                        <boo-button-admin 
                            [active]="page === currentPage()"
                            [background]="'#1565C0'" 
                            [radius]="4"
                            [padding]="'0 10px'"
                            [fontWeight]="page === currentPage() ? '600' : '400'"    
                            [buttonClass]="page === currentPage() ? 'min-w-[32px] h-8 !text-white' : 'min-w-[32px] h-8 hover:bg-gray-100 !text-regular'"
                            (click)="onPageClick(page)"
                        >
                            {{ page }}
                        </boo-button-admin>
                    } 
                    @else {
                        <span class="w-8 h-8 flex items-center justify-center text-gray-400 cursor-default">...</span>
                    }
                }

                <boo-button-admin
                    [icon]="{ name: 'chevron-right', size: 16, iconClass: currentPage() === totalPages() ? '!stroke-placeholder' : '!stroke-regular' }"
                    [padding]="'0'"
                    [radius]="4"
                    [buttonClass]="getNavButtonClass(currentPage() === totalPages())"
                    (click)="onNext()"
                ></boo-button-admin>
            }
        </div>
  `
})
export class PaginationComponent {
    // #region Inputs, Outputs, Properties
    currentPage = input.required<number>();
    totalItems = input.required<number>();
    pageSize = input.required<number>();
    loading = input<boolean>(false);

    @Output() pageChange = new EventEmitter<number>();
    totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const delta = 1;

        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const range: (number | string)[] = [];
        const left = current - delta;
        const right = current + delta;

        range.push(1);

        if (left > 3) {
            range.push('...');
        } else if (left === 3) {
            range.push(2);
        }

        for (let i = 2; i < total; i++) {
            if (i >= left && i <= right) {
                range.push(i);
            }
        }

        if (right < total - 2) {
            range.push('...');
        } else if (right === total - 2) {
            range.push(total - 1);
        }

        range.push(total);

        return range;
    });
    // #endregion

    // #region Methods
    getNavButtonClass(isDisabled: boolean): string {
        const base = 'w-8 h-8 flex items-center justify-center !bg-transparent';
        return isDisabled
            ? `${base} opacity-50 cursor-not-allowed`
            : `${base} hover:bg-gray-100`;
    }

    onPageClick(page: string | number) {
        if (page === '...' || page === this.currentPage()) return;
        this.pageChange.emit(Number(page));
    }

    onPrev() {
        if (this.currentPage() > 1) {
            this.pageChange.emit(this.currentPage() - 1);
        }
    }

    onNext() {
        if (this.currentPage() < this.totalPages()) {
            this.pageChange.emit(this.currentPage() + 1);
        }
    }
    // #endregion
}