import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { ClaimPriority, ClaimStatus, InsuranceClaimCard } from "../../../../shared/types/insurance-claims.types";

const STATUS_TONE: Record<ClaimStatus, BadgeTone> = {
  Draft: 'neutral',
  WaitingDocuments: 'warning',
  ReadyToSubmit: 'primary',
  Submitted: 'primary',
  UnderReview: 'primary',
  NeedCorrection: 'warning',
  Approved: 'success',
  Rejected: 'danger',
  Appealed: 'warning',
  Settled: 'success',
};

const STATUS_LABEL: Record<ClaimStatus, string> = {
  Draft: 'Draft',
  WaitingDocuments: 'Waiting Documents',
  ReadyToSubmit: 'Ready to Submit',
  Submitted: 'Submitted',
  UnderReview: 'Under Review',
  NeedCorrection: 'Need Correction',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Appealed: 'Appealed',
  Settled: 'Settled',
};

const PRIORITY_COLOR: Record<ClaimPriority, string> = {
  Low: 'bg-[var(--ic-warm-gray-400)]',
  Normal: 'bg-[var(--ic-olive)]',
  High: 'bg-[var(--ic-amber)]',
  Urgent: 'bg-[var(--ic-rose)]',
};

@Component({
  selector: 'insurance-claim-card',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent],
  template: `
    <div
      class="group relative flex gap-0 bg-[var(--ic-ivory)] border rounded-1.5 cursor-pointer transition-all duration-150 overflow-hidden"
      [ngClass]="active ? 'border-[var(--ic-forest)] shadow-card ring-1 ring-[var(--ic-forest)]/30' : 'border-[var(--ic-warm-gray-200)] hover:border-[var(--ic-forest)]/40 hover:shadow-card'"
      (click)="open.emit(claim.id)"
      role="button"
      tabindex="0"
      (keydown.enter)="open.emit(claim.id)"
    >
      <div class="w-1 shrink-0" [ngClass]="priorityColor"></div>

      <div class="flex-1 min-w-0 p-3">
        <div class="flex items-start justify-between gap-2 mb-1.5">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-[var(--ic-graphite)] truncate">{{ claim.patientName }}</p>
            <p class="text-[11px] text-[var(--ic-warm-gray-600)]">{{ claim.claimNumber }} · {{ claim.mrn }}</p>
          </div>
          <boo-status-badge [label]="statusLabel" [tone]="statusTone"></boo-status-badge>
        </div>

        <div class="flex items-center gap-1.5 text-[11px] text-[var(--ic-warm-gray-700)] mb-1">
          <boo-icon name="shield" [size]="12" iconClass="text-[var(--ic-olive)]"></boo-icon>
          <span class="truncate">{{ claim.providerName }}</span>
          <span class="mx-0.5">·</span>
          <span class="font-semibold text-[var(--ic-forest)]">{{ formatAmount(claim.claimAmount) }}</span>
        </div>

        <p class="text-[11px] text-[var(--ic-warm-gray-600)] truncate mb-2">
          {{ claim.department }} · {{ claim.doctorName }}
        </p>

        <div class="flex items-center gap-2" *ngIf="mode !== 'compact'">
          <div class="flex-1 h-1.5 rounded-full bg-[var(--ic-warm-gray-200)] overflow-hidden">
            <div class="h-full rounded-full bg-[var(--ic-forest)]" [style.width.%]="claim.progressPercent"></div>
          </div>
          <span class="text-[10px] font-semibold text-[var(--ic-warm-gray-600)] shrink-0">{{ claim.progressPercent }}%</span>
        </div>

        <div class="flex items-center justify-between mt-2" *ngIf="mode !== 'compact'">
          <span class="text-[10px] text-[var(--ic-warm-gray-500)]">
            {{ claim.submissionDate ? ('Submitted ' + (claim.submissionDate | date:'dd/MM/yyyy')) : 'Not submitted' }}
          </span>
          <span *ngIf="claim.missingDocumentsCount > 0" class="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--ic-amber)]">
            <boo-icon name="file-warning" [size]="12" iconClass="text-[var(--ic-amber)]"></boo-icon>
            {{ claim.missingDocumentsCount }} missing
          </span>
        </div>
      </div>

      <!-- Hover quick actions -->
      <div class="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 bg-[var(--ic-ivory)]/95 rounded-1.5 shadow-sm p-0.5" *ngIf="mode !== 'kanban'">
        <button type="button" class="p-1 rounded hover:bg-[var(--ic-warm-gray-200)]" (click)="approve.emit(claim.id); $event.stopPropagation()" aria-label="Approve claim" title="Approve">
          <boo-icon name="check" [size]="14" iconClass="text-[var(--ic-emerald)]"></boo-icon>
        </button>
        <button type="button" class="p-1 rounded hover:bg-[var(--ic-warm-gray-200)]" (click)="reject.emit(claim.id); $event.stopPropagation()" aria-label="Reject claim" title="Reject">
          <boo-icon name="x" [size]="14" iconClass="text-[var(--ic-rose)]"></boo-icon>
        </button>
      </div>
    </div>
  `,
})
export class InsuranceClaimCardComponent {
  @Input({ required: true }) claim!: InsuranceClaimCard;
  @Input() mode: 'compact' | 'comfortable' | 'kanban' | 'timeline' = 'comfortable';
  @Input() active = false;
  @Output() open = new EventEmitter<string>();
  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  get statusTone(): BadgeTone {
    return STATUS_TONE[this.claim.status];
  }

  get statusLabel(): string {
    return STATUS_LABEL[this.claim.status];
  }

  get priorityColor(): string {
    return PRIORITY_COLOR[this.claim.priority];
  }

  formatAmount(n: number): string {
    return n.toLocaleString('vi-VN') + ' ₫';
  }
}
