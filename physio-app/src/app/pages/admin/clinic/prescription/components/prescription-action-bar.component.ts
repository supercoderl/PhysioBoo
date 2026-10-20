import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooStatusBadgeComponent } from '@physioboo/ui';
import { SharedModule } from "../../../../../shared/shared-imports";
import { PrescriptionDraft, PrescriptionRxStatus } from "../../../../../shared/types/prescription-rx.types";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";

@Component({
    selector: 'rx-action-bar',
    standalone: true,
    imports: [SharedModule,BooStatusBadgeComponent, BooButtonAdminComponent],
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
            <boo-button-admin (click)="saveDraft.emit()" [disabled]="saving" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="6" class="!hidden sm:!inline-flex">
              <physio-icon name="save" [size]="16"></physio-icon> Save Draft
            </boo-button-admin>
            <boo-button-admin (click)="preview.emit()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="6" class="!hidden sm:!inline-flex">
              <physio-icon name="eye" [size]="16"></physio-icon> Preview
            </boo-button-admin>
            <boo-button-admin (click)="print.emit()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="6" class="!hidden md:!inline-flex">
              <physio-icon name="printer" [size]="16"></physio-icon> Print
            </boo-button-admin>
            <boo-button-admin (click)="issue.emit()" [disabled]="!canIssue" [title]="!canIssue ? 'Add at least one medication before issuing' : ''" textColor="white" padding="8px 16px" [fontSize]="14" [radius]="8" fontWeight="600" [gap]="6">
              <physio-icon name="circle-check" [size]="16"></physio-icon> Issue Prescription
            </boo-button-admin>
            <boo-button-admin (click)="cancel.emit()" background="transparent" textColor="#E11D48" padding="6px 8px" [fontSize]="14" fontWeight="500">
              Cancel
            </boo-button-admin>
          </ng-container>
          <ng-container *ngIf="!editable">
            <boo-button-admin (click)="preview.emit()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="6">
              <physio-icon name="eye" [size]="16"></physio-icon> Preview
            </boo-button-admin>
            <boo-button-admin (click)="print.emit()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 12px" [fontSize]="14" [radius]="8" fontWeight="500" [gap]="6">
              <physio-icon name="printer" [size]="16"></physio-icon> Print
            </boo-button-admin>
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
