import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { formatStockTakeValue, StockTake, stockTakeStatusLabel, stockTakeStatusTone } from "../../../../shared/types/stock-take.types";
import { CountingStats } from "./stock-take-counting.model";

/** Session identity, count progress and the save / submit actions of the counting page. */
@Component({
    selector: 'stock-take-counting-header',
    standalone: true,
    imports: [SharedModule, BooButtonComponent, BooStatusBadgeComponent, ButtonIconComponent],
    host: { class: 'block' },
    template: `
    <header class="bg-surface border border-borderGray/60 rounded-2">
      <div class="px-4 sm:px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-start gap-3 min-w-0">
          <button-icon [icon]="{ name: 'arrow-left', size: 16 }" (onClick)="back.emit()" ariaLabel="Back to stock takes" buttonClass="!rounded-1.5 flex-none"></button-icon>
          <div class="min-w-0">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-xl font-bold text-regular leading-tight m-0">{{ stockTake.code }}</h1>
              <boo-status-badge [label]="statusLabel(stockTake.status)" [tone]="statusTone(stockTake.status)" dotted></boo-status-badge>
            </div>
            <p class="text-sm text-secondary mt-1 mb-0">
              {{ stockTake.warehouseName || '—' }} · {{ stockTake.departmentName || '—' }}
              · Scheduled {{ stockTake.scheduledDate | date:'mediumDate' }}
              · Counter: {{ stockTake.assignedToName || 'unassigned' }}
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-2 lg:justify-end">
          <p class="m-0 text-xs font-medium sm:mr-2" role="status" aria-live="polite" [ngClass]="saving ? 'text-secondary' : dirtyCount ? 'text-amber-700' : 'text-secondary'">
            <ng-container *ngIf="saving">Saving…</ng-container>
            <ng-container *ngIf="!saving && dirtyCount">{{ dirtyCount }} unsaved {{ dirtyCount === 1 ? 'change' : 'changes' }}</ng-container>
            <ng-container *ngIf="!saving && !dirtyCount && editable">All changes saved</ng-container>
          </p>
          <ng-container *ngIf="editable">
            <button boo-button variant="secondary" (click)="save.emit()" [disabled]="!dirtyCount || saving" [loading]="saving" aria-keyshortcuts="Control+S">
              <physio-icon name="save" [size]="16"></physio-icon>Save counts
            </button>
            <button boo-button variant="primary" (click)="submit.emit()" [disabled]="!!submitBlocker || saving || submitting" [loading]="submitting">
              <physio-icon name="circle-check" [size]="16"></physio-icon>Submit for approval
            </button>
          </ng-container>
        </div>
      </div>

      <p *ngIf="editable && submitBlocker" class="m-0 px-4 sm:px-5 pb-3 -mt-1 text-xs text-secondary text-right">{{ submitBlocker }}</p>

      <dl class="m-0 border-t border-borderGray/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-borderGray/60">
        <div class="px-4 sm:px-5 py-3 col-span-2 sm:col-span-3 lg:col-span-1 !border-l-0">
          <dt class="text-xs text-secondary">Counted</dt>
          <dd class="m-0 text-lg font-bold text-regular tabular-nums leading-tight">{{ stats.counted | number }} <span class="text-sm font-medium text-secondary">/ {{ stats.total | number }}</span></dd>
          <div class="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-label="Items counted"
            aria-valuemin="0" [attr.aria-valuemax]="stats.total" [attr.aria-valuenow]="stats.counted">
            <div class="h-full rounded-full bg-primary" [style.width.%]="stats.total ? stats.counted * 100 / stats.total : 0"></div>
          </div>
        </div>
        <div class="px-4 sm:px-5 py-3">
          <dt class="text-xs text-secondary">To count</dt>
          <dd class="m-0 text-lg font-bold tabular-nums leading-tight" [ngClass]="stats.remaining ? 'text-amber-700' : 'text-emerald-600'">{{ stats.remaining | number }}</dd>
        </div>
        <div class="px-4 sm:px-5 py-3">
          <dt class="text-xs text-secondary">Over system</dt>
          <dd class="m-0 text-lg font-bold tabular-nums leading-tight text-regular">{{ stats.over | number }}</dd>
        </div>
        <div class="px-4 sm:px-5 py-3">
          <dt class="text-xs text-secondary">Short of system</dt>
          <dd class="m-0 text-lg font-bold tabular-nums leading-tight" [ngClass]="stats.short ? 'text-rose-600' : 'text-regular'">{{ stats.short | number }}</dd>
        </div>
        <div class="px-4 sm:px-5 py-3">
          <dt class="text-xs text-secondary">Variance at cost <span class="font-normal">(saved)</span></dt>
          <dd class="m-0 text-lg font-bold tabular-nums leading-tight" [ngClass]="(valueDifference ?? 0) < 0 ? 'text-rose-600' : 'text-regular'">{{ valueDifference === null ? '—' : money(valueDifference) }}</dd>
        </div>
      </dl>
    </header>
  `,
})
export class StockTakeCountingHeaderComponent {
    @Input({ required: true }) stockTake!: StockTake;
    @Input({ required: true }) stats!: CountingStats;
    /** Server-side value of saved counts; null until the summary has loaded. */
    @Input() valueDifference: number | null = null;
    @Input() dirtyCount = 0;
    @Input() saving = false;
    @Input() submitting = false;
    /** The session is Counting and the user may save counts. */
    @Input() editable = false;
    /** Why the session cannot be submitted yet; empty when it can. */
    @Input() submitBlocker = '';

    @Output() back = new EventEmitter<void>();
    @Output() save = new EventEmitter<void>();
    @Output() submit = new EventEmitter<void>();

    readonly money = formatStockTakeValue;
    statusLabel = stockTakeStatusLabel;
    statusTone = stockTakeStatusTone;
}
