import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PrescriptionDraft, PrescriptionRxStatus } from "../../../../../shared/types/prescription-rx.types";

@Component({
    selector: 'rx-action-bar',
    standalone: true,
    imports: [SharedModule, BooIconComponent, StatusBadgeComponent],
    template: `
    <div class="sticky top-0 z-30 bg-surface border-b border-gray-200 shadow-sm">
      <div class="px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <!-- Left: identity -->
        <div class="flex items-center gap-3 min-w-0">
          <span class="font-mono text-sm text-secondary bg-gray-100 px-2.5 py-1 rounded">{{ draft?.prescriptionNumber }}</span>
          <boo-status-badge [label]="draft?.status || 'Draft'" [tone]="statusTone()" [dotted]="true"></boo-status-badge>
          <span class="text-sm text-secondary hidden md:inline">{{ draft?.createdAt | date:'mediumDate' }}</span>
        </div>

        <!-- Center: doctor identity -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
            {{ initialsOf(draft?.doctor?.fullName) }}
          </div>
          <div class="min-w-0 hidden sm:block">
            <div class="text-sm font-semibold text-primary leading-tight truncate">{{ draft?.doctor?.fullName }}</div>
            <div class="text-xs text-secondary leading-tight truncate">{{ draft?.doctor?.department }} · Lic. {{ draft?.doctor?.licenseNumber }}</div>
          </div>
          <span class="text-[11px] bg-gray-100 text-secondary px-2 py-0.5 rounded-full hidden lg:inline">Visit {{ draft?.visitId }}</span>
          <span class="text-[11px] bg-gray-100 text-secondary px-2 py-0.5 rounded-full hidden lg:inline">Queue {{ draft?.queueNumber }}</span>
        </div>

        <!-- Right: actions -->
        <div class="flex items-center gap-2 shrink-0">
          <ng-container *ngIf="editable">
            <button type="button" (click)="saveDraft.emit()" [disabled]="saving"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
              <boo-icon name="save" [size]="16"></boo-icon> Save Draft
            </button>
            <button type="button" (click)="preview.emit()"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg transition-colors">
              <boo-icon name="eye" [size]="16"></boo-icon> Preview
            </button>
            <button type="button" (click)="print.emit()"
              class="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg transition-colors">
              <boo-icon name="printer" [size]="16"></boo-icon> Print
            </button>
            <button type="button" (click)="issue.emit()" [disabled]="!canIssue"
              [title]="!canIssue ? 'Add at least one medication before issuing' : ''"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <boo-icon name="check-circle-2" [size]="16"></boo-icon> Issue Prescription
            </button>
            <button type="button" (click)="cancel.emit()" class="text-rose-600 hover:text-rose-700 text-sm font-medium px-2">
              Cancel
            </button>
          </ng-container>
          <ng-container *ngIf="!editable">
            <button type="button" (click)="preview.emit()" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg transition-colors">
              <boo-icon name="eye" [size]="16"></boo-icon> Preview
            </button>
            <button type="button" (click)="print.emit()" class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg transition-colors">
              <boo-icon name="printer" [size]="16"></boo-icon> Print
            </button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
})
export class PrescriptionActionBarComponent {
    @Input() draft: PrescriptionDraft | null = null;
    @Input() editable = true;
    @Input() saving = false;
    @Input() canIssue = false;
    @Output() saveDraft = new EventEmitter<void>();
    @Output() preview = new EventEmitter<void>();
    @Output() print = new EventEmitter<void>();
    @Output() issue = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    statusTone() {
        const status: PrescriptionRxStatus = this.draft?.status || 'Draft';
        switch (status) {
            case 'Issued': return 'success' as const;
            case 'Cancelled': return 'danger' as const;
            case 'Expired': return 'warning' as const;
            default: return 'neutral' as const;
        }
    }

    initialsOf(name?: string | null): string {
        if (!name) return '';
        return name.split(' ').filter(Boolean).slice(-2).map(p => p[0]).join('').toUpperCase();
    }
}
