import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from "@angular/core";
import {
  BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooPaginationComponent, BooSearchFieldComponent,
  BooStatusBadgeComponent
} from '@physioboo/ui';
import { Observable, finalize } from "rxjs";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { LaboratoryService } from "../../../../../services/admin/laboratory.service";
import { AuthService } from "../../../../../services/auth/auth.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { PagedResponse } from "../../../../../shared/types/common";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabSample, LabSampleTimelineEvent, SampleCollectionStatus } from "../../../../../shared/types/laboratory.types";
import { code128Svg } from "../../../../../shared/utils/barcode.utils";
import { escapeHtml, printHtmlDocument } from "../../../../../shared/utils/print.utils";
import { LabCollectForm, LaboratoryCollectDrawerComponent } from "../drawers/laboratory-collect-drawer.component";
import { LaboratoryReasonDrawerComponent } from "../drawers/laboratory-reason-drawer.component";
import { LabResultForm, LabResultTarget, LaboratoryResultEntryDrawerComponent } from "../drawers/laboratory-result-entry-drawer.component";
import { collectionTone, statusLabel } from "../laboratory-display";

const PAGE_SIZE = 20;

const STAGE_LABELS: Record<LabSampleTimelineEvent['stage'], string> = {
  Ordered: 'Ordered', Collected: 'Collected', Received: 'Received', Processing: 'Processing',
  QualityCheck: 'Quality Check', Completed: 'Completed', Verified: 'Verified', ReportReleased: 'Report Released',
};

type ActionKind = 'collect' | 'recollect' | 'reject' | 'result';

@Component({
  selector: 'laboratory-sample-tracking-tab',
  standalone: true,
  imports: [
    SharedModule, BooSearchFieldComponent, BooSelectComponent, BooButtonComponent, BooPaginationComponent, BooStatusBadgeComponent,
    BooEmptyStateComponent, BooErrorStateComponent, LaboratoryCollectDrawerComponent, LaboratoryReasonDrawerComponent,
    LaboratoryResultEntryDrawerComponent,
  ],
  template: `
    <div *ngIf="isLoading()" aria-hidden="true" class="h-64 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="isLoading()" class="sr-only" role="status">Loading specimens…</span>

    <boo-error-state *ngIf="!isLoading() && error()" appearance="panel" icon="cloud-off" title="We couldn't load the specimens"
      description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <ng-container *ngIf="!isLoading() && !error()">
      <div class="flex flex-wrap items-end gap-3 mb-4">
        <boo-search-field class="w-full md:w-80" label="Search specimens" placeholder="Barcode, test, patient or order #"
          [(ngModel)]="search" (ngModelChange)="applyFilters()" (clear)="search = ''; applyFilters()" />
        <boo-select class="w-52" label="Collection" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()" [options]="statusOptions" />
        <button *ngIf="hasFilters()" boo-button variant="ghost" size="sm" type="button" (click)="clearFilters()">Clear filters</button>
      </div>

      <p *ngIf="truncated()" class="m-0 mb-3 text-xs text-secondary" role="status">
        Showing the newest {{ samples().length }} of {{ total() }} specimens.
      </p>

      <boo-empty-state *ngIf="!filtered().length" icon="test-tube" appearance="panel"
        [title]="samples().length ? 'No specimens match these filters' : 'No specimens to collect or track'"
        [description]="samples().length ? 'Try a different search or clear the filters.' : 'Specimens appear here once tests are ordered.'" />

      <ul *ngIf="filtered().length" class="m-0 p-0 list-none space-y-3">
        <li *ngFor="let s of pageItems(); trackBy: trackById" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
          <button type="button" (click)="toggleExpand(s.id)" [attr.aria-expanded]="expanded() === s.id" [attr.aria-controls]="'sample-' + s.id"
            class="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
            <div class="flex items-center gap-4 min-w-0">
              <physio-icon name="scan-barcode" [size]="18" [class]="'text-gray-400 shrink-0'"></physio-icon>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-800 truncate">{{ s.barcode }} · {{ s.testName }}</div>
                <div class="text-xs text-gray-500 truncate">{{ s.patientName }} · {{ s.orderNumber }} · {{ s.sampleType }} ({{ s.containerType }})</div>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <boo-status-badge [label]="label(s.collectionStatus)" [tone]="tone(s.collectionStatus)" />
              <physio-icon name="chevron-down" [size]="16" [ngClass]="expanded() === s.id ? 'rotate-180' : ''" [class]="'text-gray-400 transition-transform'"></physio-icon>
            </div>
          </button>

          <div *ngIf="expanded() === s.id" [id]="'sample-' + s.id" class="border-t border-gray-100 px-4 py-4 bg-gray-50">
            <dl class="m-0 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><dt class="text-gray-500">Collected</dt><dd class="m-0 font-medium text-gray-800">{{ s.collectionTime ? (s.collectionTime | date: 'MMM d, y, HH:mm') : '—' }}</dd></div>
              <div><dt class="text-gray-500">Collected by</dt><dd class="m-0 font-medium text-gray-800">{{ s.collectorName || '—' }}</dd></div>
              <div><dt class="text-gray-500">Specimen</dt><dd class="m-0 font-medium text-gray-800">{{ s.sampleType }}</dd></div>
              <div><dt class="text-gray-500">Container</dt><dd class="m-0 font-medium text-gray-800">{{ s.containerType }}</dd></div>
            </dl>

            <div class="flex flex-wrap items-center gap-2 mb-4">
              <button boo-button variant="secondary" size="sm" type="button" (click)="printBarcode(s)">
                <physio-icon name="printer" [size]="14"></physio-icon> Print barcode
              </button>
              <button *ngIf="canManage && canCollect(s)" boo-button variant="primary" size="sm" type="button" (click)="open('collect', s)">
                {{ s.collectionStatus === 'Rejected' ? 'Collect new specimen' : 'Mark collected' }}
              </button>
              <button *ngIf="canEnterResult && canResult(s)" boo-button variant="soft" size="sm" type="button" (click)="open('result', s)">Enter result</button>
              <button *ngIf="canManage && canRecollect(s)" boo-button variant="outline" size="sm" type="button" (click)="open('recollect', s)">Recollect</button>
              <button *ngIf="canManage && canReject(s)" boo-button variant="outline" size="sm" type="button" classname="!border-danger !text-danger" (click)="open('reject', s)">Reject specimen</button>
            </div>

            <ol class="m-0 p-0 list-none flex items-center overflow-x-auto pb-1" aria-label="Specimen timeline">
              <ng-container *ngFor="let ev of s.timeline; let last = last">
                <li class="flex flex-col items-center gap-1 shrink-0 w-28">
                  <div class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
                    [ngClass]="ev.occurredAt ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'">
                    <physio-icon [name]="ev.occurredAt ? 'check' : 'circle'" [size]="14"></physio-icon>
                  </div>
                  <span class="text-[11px] font-medium text-gray-700 text-center">{{ stageLabels[ev.stage] }}</span>
                  <span class="text-[10px] text-gray-500 text-center">{{ ev.occurredAt ? (ev.occurredAt | date: 'MMM d, HH:mm') : 'Pending' }}</span>
                </li>
                <li *ngIf="!last" aria-hidden="true" class="h-0.5 flex-1 min-w-[16px]" [ngClass]="ev.occurredAt ? 'bg-primary' : 'bg-gray-200'"></li>
              </ng-container>
            </ol>
          </div>
        </li>
      </ul>

      <div *ngIf="filtered().length" class="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs text-secondary tabular-nums" role="status">{{ rangeLabel() }}</span>
        <boo-pagination *ngIf="totalPages() > 1" [page]="page()" [totalPages]="totalPages()" appearance="labelled" (pageChange)="page.set($event)" />
      </div>
    </ng-container>

    <laboratory-collect-drawer [isOpen]="kind() === 'collect'" [sample]="target()" [submitting]="submitting()" [failed]="failed()"
      (confirm)="collect($event)" (close)="closeAction()" />

    <laboratory-reason-drawer [isOpen]="kind() === 'recollect' || kind() === 'reject'" [submitting]="submitting()" [failed]="failed()"
      [title]="kind() === 'reject' ? 'Reject specimen' : 'Request recollection'"
      [subtitle]="target() ? target()!.barcode + ' · ' + target()!.testName : null"
      [description]="kind() === 'reject' ? 'The specimen will be marked rejected and a sample-rejected alert is raised.' : 'The specimen goes back to the collection queue.'"
      [reasonLabel]="kind() === 'reject' ? 'Rejection reason' : 'Recollection reason'"
      [confirmLabel]="kind() === 'reject' ? 'Reject specimen' : 'Request recollection'"
      [tone]="kind() === 'reject' ? 'danger' : 'primary'"
      (confirm)="withReason($event)" (close)="closeAction()" />

    <laboratory-result-entry-drawer [isOpen]="kind() === 'result'" [target]="resultTarget()" [submitting]="submitting()" [failed]="failed()"
      (confirm)="saveResult($event)" (close)="closeAction()" />
  `,
})
export class LaboratorySampleTrackingTabComponent implements OnChanges {
  @Input() refreshKey = 0;
  /** Specimen and result changes move the dashboard counters and can raise alerts, so the page reloads them. */
  @Output() changed = new EventEmitter<void>();

  private readonly srv = inject(LaboratoryService);
  private readonly toastSrv = inject(ToastService);
  private readonly authSrv = inject(AuthService);

  readonly canManage = this.authSrv.hasPermission(Permissions.Lab.SampleManage);
  readonly canEnterResult = this.authSrv.hasPermission(Permissions.Lab.ResultEnter);

  readonly stageLabels = STAGE_LABELS;
  readonly label = statusLabel;
  readonly tone = collectionTone;

  isLoading = signal(true);
  error = signal(false);
  samples = signal<LabSample[]>([]);
  total = signal(0);
  filtered = signal<LabSample[]>([]);
  page = signal(1);
  expanded = signal<string | null>(null);

  kind = signal<ActionKind | null>(null);
  target = signal<LabSample | null>(null);
  submitting = signal(false);
  failed = signal(false);

  search = '';
  statusFilter: SampleCollectionStatus | null = null;
  readonly statusOptions: { label: string; value: SampleCollectionStatus | null }[] = [
    { label: 'All collection', value: null },
    { label: 'Not collected', value: 'NotCollected' }, { label: 'Collected', value: 'Collected' },
    { label: 'In transit', value: 'InTransit' }, { label: 'Received', value: 'Received' }, { label: 'Rejected', value: 'Rejected' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshKey']) this.load();
  }

  // #region Loading and filtering
  load(): void {
    if (!this.samples().length) this.isLoading.set(true);
    this.error.set(false);
    this.srv.getSamples().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: res => {
        if (!res.success) { this.error.set(true); return; }
        this.samples.set(res.data.items);
        this.total.set(res.data.totalCount);
        this.applyFilters(false);
      },
      error: () => this.error.set(true),
    });
  }

  truncated(): boolean { return this.total() > this.samples().length; }

  hasFilters(): boolean { return !!(this.search || this.statusFilter); }

  applyFilters(resetPage = true): void {
    const q = this.search.trim().toLowerCase();
    this.filtered.set(this.samples().filter(s =>
      (!this.statusFilter || s.collectionStatus === this.statusFilter) &&
      (!q || [s.barcode, s.testName, s.patientName, s.orderNumber].some(v => v.toLowerCase().includes(q)))
    ));
    if (resetPage) this.page.set(1);
    else this.page.set(Math.min(this.page(), this.totalPages()));
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = null;
    this.applyFilters();
  }

  totalPages(): number { return Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)); }

  pageItems(): LabSample[] {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  }

  rangeLabel(): string {
    const count = this.filtered().length;
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    return `${start}–${Math.min(count, start + PAGE_SIZE - 1)} of ${count} specimens`;
  }

  toggleExpand(id: string): void { this.expanded.set(this.expanded() === id ? null : id); }

  trackById(_: number, s: LabSample): string { return s.id; }
  // #endregion

  // #region Which actions the backend accepts for a specimen
  // The server only refuses recollect/reject once the result is verified; it reports that in its error message.
  canCollect(s: LabSample): boolean { return s.collectionStatus === 'NotCollected' || s.collectionStatus === 'Rejected'; }
  canRecollect(s: LabSample): boolean { return s.collectionStatus === 'Collected' || s.collectionStatus === 'InTransit' || s.collectionStatus === 'Received'; }
  canReject(s: LabSample): boolean { return s.collectionStatus !== 'Rejected'; }
  canResult(s: LabSample): boolean { return s.collectionStatus !== 'Rejected'; }
  // #endregion

  // #region Actions
  open(kind: ActionKind, s: LabSample): void {
    this.failed.set(false);
    this.target.set(s);
    this.kind.set(kind);
  }

  closeAction(): void {
    if (this.submitting()) return;
    this.kind.set(null);
  }

  resultTarget(): LabResultTarget | null {
    const s = this.target();
    // The specimen list carries no result, unit or range; the result list does once a value exists.
    return s ? { id: s.id, testName: s.testName, patientName: s.patientName, orderNumber: s.orderNumber, unit: null, referenceRange: null, value: '', comments: null } : null;
  }

  collect(form: LabCollectForm): void {
    const s = this.target();
    if (s) this.run(this.srv.markSampleCollected(s.id, form.collectorName, form.containerType), 'Specimen marked collected');
  }

  withReason(reason: string): void {
    const s = this.target();
    if (!s) return;
    if (this.kind() === 'reject') this.run(this.srv.rejectSample(s.id, reason), 'Specimen rejected');
    else this.run(this.srv.recollectSample(s.id, reason), 'Recollection requested');
  }

  saveResult(form: LabResultForm): void {
    const s = this.target();
    if (s) this.run(this.srv.updateResultValue(s.id, form.value, form.comments), 'Result saved and sent for verification');
  }

  /** One request at a time; on failure the drawer stays open with what was typed. */
  private run(request: Observable<PagedResponse<string>>, success: string): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.failed.set(false);
    request.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: res => {
        if (!res.success) { this.failed.set(true); this.toastSrv.error('The laboratory system did not accept this change'); return; }
        this.kind.set(null);
        this.toastSrv.success(success);
        this.load();
        this.changed.emit();
      },
      error: () => this.failed.set(true),
    });
  }
  // #endregion

  /** Prints a specimen label (Code 128) sized for a 50 x 25 mm label printer. */
  printBarcode(s: LabSample): void {
    const label = `
      <div class="label">
        <div class="name">${escapeHtml(s.patientName)}</div>
        <div>${escapeHtml(s.testName)} · ${escapeHtml(s.sampleType)}</div>
        ${code128Svg(s.barcode, 40, 1.2)}
        <div class="code">${escapeHtml(s.barcode)}</div>
      </div>`;
    printHtmlDocument(`Label ${s.barcode}`, label,
      `@page { size: 50mm 25mm; margin: 1mm; } body { margin: 0; font-size: 8px; } .label { text-align: center; } .name { font-weight: 700; } .code { font-family: monospace; letter-spacing: 1px; } p.muted { display: none; }`);
  }
}
