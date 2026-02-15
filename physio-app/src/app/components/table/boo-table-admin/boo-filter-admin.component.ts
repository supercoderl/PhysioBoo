import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { BooButtonAdminComponent } from '../../button/boo-button-admin/boo-button-admin.component';
import { FilterConfig } from '../../../shared/types/filter';

@Component({
    selector: 'boo-filter-admin',
    standalone: true,
    imports: [
    SharedModule,
    BooButtonAdminComponent
],
    template: `
<div class="relative inline-block text-left">
      <boo-button-admin
        (click)="toggle()"
        [icon]="{ name: 'funnel', size: 14, color: hasActiveFilter ? '#3b82f6' : '#6C7688' }"
        buttonClass="!bg-surface h-full"
        [border]="{ width: 1, color: hasActiveFilter ? '#3b82f6' : '#e3e3e3' }"
      >
        <span class="text-placeholder">Filter</span> 
        <span *ngIf="hasActiveFilter" class="ml-1 w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
      </boo-button-admin>

      <div *ngIf="isOpen" class="absolute right-0 mt-2 w-80 bg-surface rounded-lg shadow-xl border border-gray-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
        
        <div class="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">
          
          <div *ngFor="let config of filters" class="filter-group">
            <label class="text-xs font-bold text-slate-500 uppercase mb-2 block">{{ config.label }}</label>

            <div *ngIf="config.type === 'range-number'" class="flex items-center gap-2">
               <input type="number" [(ngModel)]="config.value.min" [placeholder]="'Min'" class="w-1/2 border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none">
               <span class="text-gray-400">-</span>
               <input type="number" [(ngModel)]="config.value.max" [placeholder]="'Max'" class="w-1/2 border border-gray-300 rounded px-2 py-1.5 text-sm focus:border-blue-500 outline-none">
            </div>

            <div *ngIf="config.type === 'boolean'" class="bg-surface border border-borderGray p-1 rounded-md flex gap-1">
                <button (click)="config.value = null"
                    class="flex-1 py-1.5 text-[11px] font-semibold rounded transition-all duration-200 text-center uppercase tracking-wide"
                    [class.bg-secondary]="config.value === null"
                    [class.text-white]="config.value === null"
                    [class.shadow-sm]="config.value === null"
                    [class.text-regular]="config.value !== null"
                    [class.hover:text-slate-600]="config.value !== null">
                    All
                </button>

                <button (click)="config.value = true"
                    class="flex-1 py-1.5 text-[11px] font-semibold rounded transition-all duration-200 text-center uppercase tracking-wide"
                    [class.bg-secondary]="config.value === true"
                    [class.text-white]="config.value === true"
                    [class.shadow-sm]="config.value === true"
                    [class.text-regular]="config.value !== true"
                    [class.hover:text-slate-600]="config.value !== true">
                    {{ config.trueLabel || 'Active' }}
                </button>

                <button (click)="config.value = false"
                    class="flex-1 py-1.5 text-[11px] font-semibold rounded transition-all duration-200 text-center uppercase tracking-wide"
                    [class.bg-secondary]="config.value === false"
                    [class.text-white]="config.value === false" 
                    [class.shadow-sm]="config.value === false"
                    [class.text-regular]="config.value !== false"
                    [class.hover:text-slate-600]="config.value !== false">
                    {{ config.falseLabel || 'Inactive' }}
                </button>
            </div>
            <select *ngIf="config.type === 'select'" [(ngModel)]="config.value" class="w-full border border-gray-300 rounded p-2 text-sm">
              <option [ngValue]="null">Tất cả</option>
              <option *ngFor="let opt of config.options" [value]="opt.value">{{ opt.label }}</option>
            </select>
             <div *ngIf="config.type === 'color'" class="flex flex-wrap gap-2">
               <button *ngFor="let opt of config.options"
                (click)="selectColor(config, opt.value)"
                [style.background-color]="opt.colorCode"
                class="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform relative"
                [class.ring-2]="config.value === opt.value"
                [class.ring-offset-1]="config.value === opt.value"
                [class.ring-blue-500]="config.value === opt.value"
                [title]="opt.label">
              </button>
              <button (click)="config.value = null" *ngIf="config.value" class="text-xs text-gray-400 underline ml-auto">Clear</button>
             </div>

          </div>
        </div>

        <div class="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
          <button (click)="reset()" class="text-xs text-red-500 font-medium hover:underline">Reset All</button>
          <button (click)="applyFilter()" class="bg-primary text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
            Apply Filter
          </button>
        </div>
      </div>

      <div *ngIf="isOpen" (click)="isOpen = false" class="fixed inset-0 z-40 bg-transparent"></div>
    </div>
  `
})
export class BooFilterAdminComponent {
    // #region Inputs, Outputs, Properties
    @Input() filters: FilterConfig[] = [];
    @Output() apply = new EventEmitter<any>();

    isOpen = false;

    get hasActiveFilter(): boolean {
        return this.filters.some(f => {
            if (f.type === 'range-number') return f.value?.min != null || f.value?.max != null;
            return f.value !== null && f.value !== undefined && f.value !== '';
        });
    }

    // #endregion

    // #region Methods
    toggle() { this.isOpen = !this.isOpen; }

    selectColor(config: FilterConfig, value: any) {
        config.value = config.value === value ? null : value;
    }

    applyFilter() {
        const result: any = {};
        this.filters.forEach(f => {
            if (f.type === 'range-number') {
                if (f.value?.min != null) result[`min${f.key}`] = f.value.min;
                if (f.value?.max != null) result[`max${f.key}`] = f.value.max;
            } else {
                if (f.value !== null && f.value !== undefined) {
                    result[f.key] = f.value;
                }
            }
        });

        this.apply.emit(result);
        this.isOpen = false;
    }

    reset() {
        this.filters.forEach(f => {
            if (f.type === 'range-number') f.value = { min: null, max: null };
            else f.value = null;
        });
        this.apply.emit({});
        this.isOpen = false;
    }
    // #endregion
}