import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { DatePipe } from '@angular/common';
import { DateRange, RangeType } from '../../../shared/types/date';
import { BooButtonAdminComponent } from '../../button/boo-button-admin/boo-button-admin.component';

@Component({
    selector: 'boo-date-admin',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent
    ],
    providers: [DatePipe],
    template: `
        <div class="relative inline-block text-left">
            <boo-button-admin
                (click)="toggle()"
                [icon]="{ name: 'calendar', size: 14, color: '#6C7688' }"
                buttonClass="!bg-surface h-full min-w-[180px] justify-between"
                [border]="{ width: 1, color: isOpen ? '#3b82f6' : '#e3e3e3' }"
            >
                <span class="text-[13px] font-medium text-placeholder">{{ displayText }}</span>
            </boo-button-admin>

            <div *ngIf="isOpen" 
                class="absolute right-0 mt-2 w-64 bg-surface rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
            >   
                <ul class="m-0 p-1 list-none bg-surface" [class.border-b]="activeType === 'custom'">
                    <li *ngFor="let item of ['today', 'yesterday', 'week', 'month', 'year']">
                        <button 
                            type="button"
                            (click)="selectPreset(item)"
                            class="w-full text-left px-3 py-2 text-sm rounded-md transition-colors capitalize flex justify-between items-center"
                            [class.bg-blue-50]="activeType === item"
                            [class.text-blue-600]="activeType === item"
                            [class.text-slate-600]="activeType !== item"
                            [class.hover:bg-gray-50]="activeType !== item"
                        >
                            <span>
                                {{ item !== 'today' && item !== 'yesterday' ? '1' : '' }}
                                {{ item === 'today' || item === 'yesterday' ? '' : item }}  
                                <ng-container *ngIf="item === 'today'">Today</ng-container>
                                <ng-container *ngIf="item === 'yesterday'">Yesterday</ng-container>
                            </span>
                            <lucide-icon *ngIf="activeType === item" name="check" class="w-3.5 h-3.5"></lucide-icon>
                        </button>
                    </li>
                    <li>
                        <button 
                            type="button"
                            (click)="selectPreset('custom')"
                            class="w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex justify-between items-center"
                            [class.bg-blue-50]="activeType === 'custom'"
                            [class.text-blue-600]="activeType === 'custom'"
                            [class.text-slate-600]="activeType !== 'custom'"
                            [class.hover:bg-gray-50]="activeType !== 'custom'"
                        >
                        Custom Range
                        <lucide-icon name="chevronRight" class="w-3.5 h-3.5"></lucide-icon>
                        </button>
                    </li>
                </ul>
                <div *ngIf="activeType === 'custom'" class="p-3 bg-gray-50 border-t border-gray-100">
                    <div class="flex flex-col gap-2 mb-3">
                        <div class="text-xs font-semibold text-gray-500">Start Date</div>
                        <input type="date" [(ngModel)]="customStart" class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none">
                        
                        <div class="text-xs font-semibold text-gray-500 mt-1">End Date</div>
                        <input type="date" [(ngModel)]="customEnd" class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none">
                    </div>
                    <button (click)="applyCustom()" 
                            [disabled]="!customStart || !customEnd"
                            class="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50">
                        Apply Date
                    </button>
                </div>
            </div>
            <div *ngIf="isOpen" (click)="isOpen = false" class="fixed inset-0 z-40 bg-transparent"></div>
        </div>
    `,
    styles: []
})
export class BooDateAdminComponent {
    // #region Inputs, Outputs, Properties
    @Input() startDate: Date | null = new Date();
    @Input() endDate: Date | null = new Date();

    @Output() rangeChange = new EventEmitter<DateRange>();

    isOpen = false;
    activeType: RangeType | null = null;

    customStart: string = '';
    customEnd: string = '';

    get displayText(): string {
        if (this.startDate && this.endDate) {
            const startStr = this.datePipe.transform(this.startDate, 'd MMM yy');
            const endStr = this.datePipe.transform(this.endDate, 'd MMM yy');
            return `${startStr} - ${endStr}`;
        }
        return 'Select Date';
    }
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(private datePipe: DatePipe) { }

    // #endregion

    // #region Methods
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen && this.activeType === 'custom' && this.startDate && this.endDate) {
            this.customStart = this.formatDateInput(this.startDate);
            this.customEnd = this.formatDateInput(this.endDate);
        }
    }

    selectPreset(type: string) {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (type) {
            case 'today':
                start = now;
                end = now;
                break;
            case 'yesterday':
                start.setDate(now.getDate() - 1);
                end.setDate(now.getDate() - 1);
                break;
            case 'week':
                const day = now.getDay() || 7;
                if (day !== 1) start.setHours(-24 * (day - 1));
                end = now;
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            case 'custom':
                this.activeType = 'custom';
                return;
        }

        this.activeType = type as RangeType;
        this.updateRange(start, end);
        this.isOpen = false;
    }

    applyCustom() {
        if (this.customStart && this.customEnd) {
            const start = new Date(this.customStart);
            const end = new Date(this.customEnd);
            this.updateRange(start, end);
            this.isOpen = false;
        }
    }

    private updateRange(start: Date, end: Date) {
        this.startDate = start;
        this.endDate = end;
        this.rangeChange.emit({ start, end, label: this.displayText });
    }

    private formatDateInput(date: Date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
    }
    // #endregion
}