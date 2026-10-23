import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from "@angular/core";
import {
  BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooPaginationComponent, BooSearchFieldComponent,
  BooStatusBadgeComponent
} from '@physioboo/ui';
import { Observable, finalize } from "rxjs";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { LaboratoryService } from "../../../../../services/admin/laboratory.service";
import { AuthService } from "../../../../../services/auth/auth.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PagedResponse } from "../../../../../shared/types/common";
import { LabResultEntry, LabResultFlag, LabVerificationStatus } from "../../../../../shared/types/laboratory.types";
import { LabResultForm, LabResultTarget, LaboratoryResultEntryDrawerComponent } from "../drawers/laboratory-result-entry-drawer.component";
import { LaboratoryReasonDrawerComponent } from "../drawers/laboratory-reason-drawer.component";
import { FLAG_LABELS, flagTone, statusLabel, verificationTone } from "../laboratory-display";

const PAGE_SIZE = 25;

type ActionKind = 'edit' | 'reject' | 'return';

@Component({
  selector: 'laboratory-result-verification-tab',
  standalone: true,
  imports: [
    SharedModule, BooSearchFieldComponent, BooSelectComponent, BooButtonComponent, BooPaginationComponent, BooStatusBadgeComponent,
    BooEmptyStateComponent, BooErrorStateComponent, LaboratoryResultEntryDrawerComponent, LaboratoryReasonDrawerComponent,
  ],
  template: `
    <div *ngIf="isLoading()" aria-hidden="true" class="h-64 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="isLoading()" class="sr-only" role="status">Loading results…</span>

    <boo-error-state *ngIf="!isLoading() && error()" appearance="panel" icon="cloud-off" title="We couldn't load the results"
      description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <ng-container *ngIf="!isLoading() && !error()">
      <div class="flex flex-wrap items-end gap-3 mb-4">
        <boo-search-field class="w-full md:w-80" label="Search results" placeholder="Order #, patient, MRN or test"
          [(ngModel)]="search" (ngModelChange)="applyFilters()" (clear)="search = ''; applyFilters()" />
        <boo-select class="w-56" label="Verification" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()" [options]="statusOptions" />
        <boo-select class="w-48" label="Flag" [(ngModel)]="flagFilter" (ngModelChange)="applyFilters()" [options]="flagOptions" />
        <button *ngIf="hasFilters()" boo-button variant="ghost" size="sm" type="button" (click)="clearFilters()">Clear filters</button>
      </div>

      <p *ngIf="truncated()" class="m-0 mb-3 text-xs text-secondary" role="status">
        Showing the newest {{ results().length }} of {{ total() }} results.
      </p>
      <p *ngIf="canEnter" class="m-0 mb-3 text-xs text-secondary">
        Results appear here once a value has been entered. Enter the first value from the specimen's row in Sample Collection &amp; Tracking.
      </p>

      <boo-empty-state *ngIf="!filtered().length" icon="clipboard-check" appearance="panel"
        [title]="results().length ? 'No results match these filters' : 'No results entered yet'"
        [description]="results().length ? 'Try a different search or clear the filters.' : 'Entered results awaiting or past verification appear here.'" />

      <div *ngIf="filtered().length" class="bg-surface border border-gray-200 rounded-lg overflow-x-auto">
        <table class="w-full min-w-[1000px] text-sm">
          <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th scope="col" class="px-4 py-3 text-left">Order #</th>
              <th scope="col" class="px-4 py-3 text-left">Patient</th>
              <th scope="col" class="px-4 py-3 text-left">Test</th>
              <th scope="col" class="px-4 py-3 text-left">Result</th>
              <th scope="col" class="px-4 py-3 text-left">Unit</th>
              <th scope="col" class="px-4 py-3 text-left">Reference range</th>
              <th scope="col" class="px-4 py-3 text-left">Flag</th>
              <th scope="col" class="px-4 py-3 text-left">Verification</th>
              <th scope="col" class="px-4 py-3 text-left"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let r of pageItems(); trackBy: trackById" [ngClass]="isCritical(r.flag) ? 'bg-rose-50' : ''">
              <td class="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{{ r.orderNumber }}</td>
              <td class="px-4 py-3">{{ r.patientName }} <span class="text-gray-500">({{ r.mrn }})</span></td>
              <td class="px-4 py-3 text-gray-700">{{ r.testName }}</td>
              <td class="px-4 py-3">
                <span class="font-semibold text-gray-800 tabular-nums">{{ r.value }}</span>
                <span *ngIf="r.comments" class="block max-w-[14rem] truncate text-xs text-gray-500" [attr.title]="r.comments">{{ r.comments }}</span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ r.unit || '—' }}</td>
              <td class="px-4 py-3 text-gray-500">{{ r.referenceRange || '—' }}</td>
              <td class="px-4 py-3">
                <boo-status-badge [label]="r.flag" [tone]="flagTone(r.flag)" />
                <span class="sr-only">{{ flagLabels[r.flag] }}</span>
              </td>
              <td class="px-4 py-3">
                <boo-status-badge [label]="label(r.verificationStatus)" [tone]="verificationTone(r.verificationStatus)" />
                <span *ngIf="r.verifiedAt" class="block text-xs text-gray-500 mt-1">{{ r.verifiedAt | date: 'MMM d, HH:mm' }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1 justify-end">
                  <button *ngIf="canEnter && r.verificationStatus !== 'Verified'" boo-button variant="ghost" size="sm" type="button"
                    [disabled]="busyId() === r.id" (click)="open('edit', r)" [attr.aria-label]="'Edit result for ' + r.testName">Edit</button>
                  <ng-container *ngIf="canVerify && r.verificationStatus === 'PendingVerification'">
                    <button boo-button variant="soft" size="sm" type="button" [loading]="busyId() === r.id" [disabled]="!!busyId()"
                      (click)="confirmApprove(r)" [attr.aria-label]="'Approve result for ' + r.testName">Approve</button>
                    <button boo-button variant="ghost" size="sm" type="button" [disabled]="!!busyId()"
                      (click)="open('return', r)" [attr.aria-label]="'Return result for ' + r.testName + ' for review'">Return</button>
                    <button boo-button variant="ghost" size="sm" type="button" classname="!text-danger" [disabled]="!!busyId()"
                      (click)="open('reject', r)" [attr.aria-label]="'Reject result for ' + r.testName">Reject</button>
                  </ng-container>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="filtered().length" class="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs text-secondary tabular-nums" role="status">{{ rangeLabel() }}</span>
        <boo-pagination *ngIf="totalPages() > 1" [page]="page()" [totalPages]="totalPages()" appearance="labelled" (pageChange)="page.set($event)" />
      </div>
    </ng-container>

    <laboratory-result-entry-drawer [isOpen]="kind() === 'edit'" [target]="resultTarget()" [submitting]="submitting()" [failed]="failed()"
      (confirm)="saveResult($event)" (close)="closeAction()" />

    <laboratory-reason-drawer [isOpen]="kind() === 'reject' || kind() === 'return'" [submitting]="submitting()" [failed]="failed()"
      [title]="kind() === 'reject' ? 'Reject result' : 'Return for review'"
      [subtitle]="target() ? target()!.testName + ' · ' + target()!.orderNumber : null"
      [description]="kind() === 'reject' ? 'The result is marked rejected during verification.' : 'The result goes back to the technician for review.'"
      [reasonLabel]="kind() === 'reject' ? 'Rejection reason' : 'Review reason'"
      [confirmLabel]="kind() === 'reject' ? 'Reject result' : 'Return for review'"
      [tone]="kind() === 'reject' ? 'danger' : 'primary'"
      (confirm)="withReason($event)" (close)="closeAction()" />
  `,
})
export class LaboratoryResultVerificationTabComponent implements OnChanges {
  @Input() refreshKey = 0;
  /** Verifying or correcting a result moves the dashboard counters and can raise alerts, so the page reloads them. */
  @Output() changed = new EventEmitter<void>();

  private readonly srv = inject(LaboratoryService);
  private readonly toastSrv = inject(ToastService);
  private readonly dialogSrv = inject(DialogService);
  private readonly authSrv = inject(AuthService);

  readonly canEnter = this.authSrv.hasPermission(Permissions.Lab.ResultEnter);
  readonly canVerify = this.authSrv.hasPermission(Permissions.Lab.ResultVerify);

  readonly flagLabels = FLAG_LABELS;
  readonly flagTone = flagTone;
  readonly verificationTone = verificationTone;
  readonly label = statusLabel;

  isLoading = signal(true);
  error = signal(false);
  results = signal<LabResultEntry[]>([]);
  total = signal(0);
  filtered = signal<LabResultEntry[]>([]);
  page = signal(1);

  kind = signal<ActionKind | null>(null);
  target = signal<LabResultEntry | null>(null);
  submitting = signal(false);
  failed = signal(false);
  /** The row whose approval is in flight; verification buttons stay locked until it settles. */
  busyId = signal<string | null>(null);

  search = '';
  statusFilter: LabVerificationStatus | null = null;
  flagFilter: 'abnormal' | 'critical' | null = null;
  readonly statusOptions: { label: string; value: LabVerificationStatus | null }[] = [
    { label: 'All verification', value: null },
    { label: 'Pending verification', value: 'PendingVerification' }, { label: 'Verified', value: 'Verified' },
    { label: 'Rejected', value: 'Rejected' }, { label: 'Returned for review', value: 'ReturnedForReview' },
  ];
  readonly flagOptions: { label: string; value: 'abnormal' | 'critical' | null }[] = [
    { label: 'All flags', value: null },
    { label: 'Abnormal (H / L)', value: 'abnormal' }, { label: 'Critical (HH / LL)', value: 'critical' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshKey']) this.load();
  }

  // #region Loading and filtering
  load(): void {
    if (!this.results().length) this.isLoading.set(true);
    this.error.set(false);
    this.srv.getResults().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: res => {
        if (!res.success) { this.error.set(true); return; }
        this.results.set(res.data.items);
        this.total.set(res.data.totalCount);
        this.applyFilters(false);
      },
      error: () => this.error.set(true),
    });
  }

  truncated(): boolean { return this.total() > this.results().length; }

  hasFilters(): boolean { return !!(this.search || this.statusFilter || this.flagFilter); }

  isCritical(flag: LabResultFlag): boolean { return flag === 'HH' || flag === 'LL'; }

  applyFilters(resetPage = true): void {
    const q = this.search.trim().toLowerCase();
    this.filtered.set(this.results().filter(r =>
      (!this.statusFilter || r.verificationStatus === this.statusFilter) &&
      (!this.flagFilter || (this.flagFilter === 'critical' ? this.isCritical(r.flag) : r.flag !== 'N' && !this.isCritical(r.flag))) &&
      (!q || [r.orderNumber, r.patientName, r.mrn, r.testName].some(v => v.toLowerCase().includes(q)))
    ));
    if (resetPage) this.page.set(1);
    else this.page.set(Math.min(this.page(), this.totalPages()));
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = null;
    this.flagFilter = null;
    this.applyFilters();
  }

  totalPages(): number { return Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)); }

  pageItems(): LabResultEntry[] {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  }

  rangeLabel(): string {
    const count = this.filtered().length;
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    return `${start}–${Math.min(count, start + PAGE_SIZE - 1)} of ${count} results`;
  }

  trackById(_: number, r: LabResultEntry): string { return r.id; }
  // #endregion

  // #region Actions
  open(kind: ActionKind, r: LabResultEntry): void {
    this.failed.set(false);
    this.target.set(r);
    this.kind.set(kind);
  }

  closeAction(): void {
    if (this.submitting()) return;
    this.kind.set(null);
  }

  resultTarget(): LabResultTarget | null {
    const r = this.target();
    return r ? { id: r.id, testName: r.testName, patientName: r.patientName, orderNumber: r.orderNumber, unit: r.unit, referenceRange: r.referenceRange, value: r.value, comments: r.comments } : null;
  }

  saveResult(form: LabResultForm): void {
    const r = this.target();
    if (r) this.run(this.srv.updateResultValue(r.id, form.value, form.comments), 'Result saved and sent for verification');
  }

  withReason(reason: string): void {
    const r = this.target();
    if (!r) return;
    if (this.kind() === 'reject') this.run(this.srv.rejectResult(r.id, reason), 'Result rejected');
    else this.run(this.srv.returnResultForReview(r.id, reason), 'Result returned for review');
  }

  confirmApprove(r: LabResultEntry): void {
    this.dialogSrv.confirm(
      `Verify and release the ${r.testName} result (${r.value}${r.unit ? ' ' + r.unit : ''}) for ${r.patientName}?`,
      () => this.approve(r),
      'Verify result',
      'warning',
      'Approve',
    );
  }

  private approve(r: LabResultEntry): void {
    if (this.busyId()) return;
    this.busyId.set(r.id);
    this.srv.approveResult(r.id).pipe(finalize(() => this.busyId.set(null))).subscribe({
      next: res => {
        if (!res.success) { this.toastSrv.error('The laboratory system did not accept this change'); return; }
        this.toastSrv.success('Result approved');
        this.load();
        this.changed.emit();
      },
    });
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
        // The server recomputes the flag and resets verification, so show what it stored.
        this.load();
        this.changed.emit();
      },
      error: () => this.failed.set(true),
    });
  }
  // #endregion
}
