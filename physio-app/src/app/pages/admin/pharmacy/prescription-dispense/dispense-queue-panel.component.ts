import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooFilterChip, BooFilterChipsComponent, BooSearchFieldComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { DispenseQueueItem, DispenseQueueStatus } from "../../../../shared/types/dispensing.types";
import { DISPENSE_STATUS_OPTIONS, dispenseStatusLabel, dispenseStatusTone, priorityTone } from "../../../../shared/utils/dispensing.utils";

export type DispenseFilterKey = 'search' | 'status' | 'date';

interface DispenseFilterChip extends BooFilterChip {
  key: DispenseFilterKey;
}

@Component({
  selector: 'dispense-queue-panel',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooSearchFieldComponent, BooSelectComponent, BooDatepickerComponent, BooFilterChipsComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent],
  template: `
    <section class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden" aria-labelledby="dispense-queue-title">
      <div class="p-4 border-b border-borderGray/60 space-y-3">
        <div class="flex items-center justify-between">
          <h2 id="dispense-queue-title" class="text-base font-semibold text-regular m-0">Prescriptions</h2>
          <span class="text-xs text-secondary" aria-live="polite">{{ loading ? 'Loading…' : items.length + (items.length === 1 ? ' result' : ' results') }}</span>
        </div>

        <boo-search-field size="middle" label="Search prescriptions" placeholder="Patient, MRN or Rx number"
          [ngModel]="search" (ngModelChange)="searchChange.emit($event)" (clear)="searchChange.emit('')" [busy]="searching"></boo-search-field>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <boo-select label="Status" [options]="statusOptions" bindLabel="label" bindValue="value"
            [ngModel]="status" (ngModelChange)="statusChange.emit($event)"></boo-select>
          <boo-datepicker label="Issued on" [ngModel]="date" (ngModelChange)="dateChange.emit($event)"></boo-datepicker>
        </div>

        <boo-filter-chips [chips]="chips" (remove)="clearFilter.emit($event.key)"></boo-filter-chips>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto">
        <div *ngIf="loading" class="p-3 space-y-3" aria-busy="true" aria-label="Loading prescriptions">
          <div *ngFor="let i of skeletonRows" class="rounded-2 border border-borderGray/60 p-3 space-y-2 animate-pulse">
            <div class="h-3 w-1/3 bg-gray-200 rounded"></div>
            <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
            <div class="h-3 w-1/2 bg-gray-100 rounded"></div>
          </div>
        </div>

        <boo-error-state *ngIf="!loading && error" icon="triangle-alert" title="Couldn't load prescriptions" [description]="error" (retry)="retry.emit()"></boo-error-state>

        <boo-empty-state *ngIf="!loading && !error && !items.length"
          [icon]="hasFilters ? 'search' : 'inbox'"
          [title]="hasFilters ? 'No prescriptions match' : 'No prescriptions to dispense'"
          [description]="hasFilters ? 'Try a different search or clear the filters.' : 'Issued prescriptions will appear here.'">
          <button *ngIf="hasFilters" boo-button variant="secondary" size="sm" (click)="clearAll.emit()">Clear filters</button>
        </boo-empty-state>

        <ul *ngIf="!loading && !error && items.length" class="list-none m-0 p-3 space-y-2">
          <li *ngFor="let item of items; trackBy: trackById">
            <button type="button" (click)="select.emit(item)" [attr.aria-current]="item.queueId === selectedId ? 'true' : null"
              class="w-full text-left rounded-2 border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              [ngClass]="item.queueId === selectedId ? 'border-primary bg-primarySoft' : 'border-borderGray/60 bg-surface hover:border-primary/40 hover:bg-gray-50'">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-semibold text-secondary truncate">#{{ item.queueNumber }} · {{ item.prescriptionNumber }}</span>
                <boo-status-badge [label]="statusLabel(item.status)" [tone]="statusTone(item.status)" dotted></boo-status-badge>
              </div>
              <div class="flex items-center gap-2 mt-1.5">
                <span class="text-sm font-semibold text-regular truncate">{{ item.patientName }}</span>
                <boo-status-badge *ngIf="item.priority !== 'Normal'" [label]="item.priority + ' priority'" [tone]="priorityTone(item.priority)"></boo-status-badge>
              </div>
              <p class="text-xs text-secondary mt-0.5 mb-0 truncate">{{ item.mrn }}<ng-container *ngIf="item.wardOrClinic"> · {{ item.wardOrClinic }}</ng-container></p>
              <p class="text-xs text-secondary mt-1.5 mb-0 flex items-center justify-between gap-2">
                <span class="truncate">Dr. {{ item.prescribingDoctor }} · {{ item.medicationCount }} {{ item.medicationCount === 1 ? 'medicine' : 'medicines' }}</span>
                <span class="shrink-0">{{ item.createdAt | date:'dd MMM, HH:mm' }}</span>
              </p>
            </button>
          </li>
        </ul>
      </div>
    </section>
  `,
})
export class DispenseQueuePanelComponent {
  @Input() items: DispenseQueueItem[] = [];
  @Input() selectedId: string | null = null;
  @Input() loading = false;
  @Input() searching = false;
  @Input() error: string | null = null;
  @Input() search = '';
  @Input() status: DispenseQueueStatus | null = null;
  @Input() date: string | null = null;

  @Output() select = new EventEmitter<DispenseQueueItem>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<DispenseQueueStatus | null>();
  @Output() dateChange = new EventEmitter<string | null>();
  @Output() clearFilter = new EventEmitter<DispenseFilterKey>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  readonly statusOptions = DISPENSE_STATUS_OPTIONS;
  readonly skeletonRows = [1, 2, 3, 4];
  readonly statusLabel = dispenseStatusLabel;
  readonly statusTone = dispenseStatusTone;
  readonly priorityTone = priorityTone;

  get hasFilters(): boolean {
    return !!(this.search.trim() || this.status || this.date);
  }

  get chips(): DispenseFilterChip[] {
    const chips: DispenseFilterChip[] = [];
    if (this.search.trim()) chips.push({ key: 'search', label: `Search: ${this.search.trim()}` });
    if (this.status) chips.push({ key: 'status', label: `Status: ${dispenseStatusLabel(this.status)}` });
    if (this.date) chips.push({ key: 'date', label: `Issued: ${this.date}` });
    return chips;
  }

  trackById(_: number, item: DispenseQueueItem): string {
    return item.queueId;
  }
}
