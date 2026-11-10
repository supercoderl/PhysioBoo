import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { ClaimActionMode, ClaimPriority, InsuranceProviderNode } from "../../../../shared/types/insurance-claims.types";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooButtonComponent, BooFormFieldComponent, BooInputComponent, BooDialogComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";

export interface ClaimActionSubmitPayload {
  mode: ClaimActionMode;
  notes: string;
  approvedAmount: number;
  settledAmount: number;
  settlementMethod: string;
  files: File[];
  create: {
    patientName: string;
    providerId: string;
    policyNumber: string;
    diagnosis: string;
    claimAmount: number;
    department: string;
    doctorName: string;
    priority: ClaimPriority;
  };
}

const TITLES: Record<ClaimActionMode, string> = {
  create: 'Create Claim',
  submit: 'Submit Claim',
  upload: 'Upload Documents',
  approve: 'Approve Claim',
  reject: 'Reject Claim',
  appeal: 'Appeal Claim',
  settle: 'Record Settlement',
};

@Component({
  selector: 'insurance-claim-action-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonAdminComponent, BooButtonComponent, BooFormFieldComponent, BooInputComponent, BooSelectComponent, BooTextareaComponent, BooDialogComponent],
  template: `
    <boo-dialog *ngIf="isOpen && mode" [heading]="titles[mode]" (dismiss)="close.emit()">
        <div class="space-y-3 text-xs">
          <!-- Create -->
          <ng-container *ngIf="mode === 'create'">
            <boo-form-field label="Patient Name" for="claim-patient-name">
              <boo-input [id]="'claim-patient-name'" label="Patient Name" size="small" [(ngModel)]="form.create.patientName" />
            </boo-form-field>
            <boo-form-field label="Insurance Provider" for="claim-provider">
              <boo-select [id]="'claim-provider'" label="Select provider" size="small" [options]="providers" bindLabel="name" bindValue="id" [(ngModel)]="form.create.providerId" />
            </boo-form-field>
            <div class="grid grid-cols-2 gap-3">
              <boo-form-field label="Policy Number" for="claim-policy-number">
              <boo-input [id]="'claim-policy-number'" label="Policy Number" size="small" [(ngModel)]="form.create.policyNumber" />
            </boo-form-field>
              <boo-form-field label="Claim Amount (₫)" for="claim-claim-amount">
              <boo-input [id]="'claim-claim-amount'" label="Claim Amount (₫)" type="number" numberValue min="0" size="small" [(ngModel)]="form.create.claimAmount" />
            </boo-form-field>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <boo-form-field label="Department" for="claim-department">
              <boo-input [id]="'claim-department'" label="Department" size="small" [(ngModel)]="form.create.department" />
            </boo-form-field>
              <boo-form-field label="Doctor" for="claim-doctor">
              <boo-input [id]="'claim-doctor'" label="Doctor" size="small" [(ngModel)]="form.create.doctorName" />
            </boo-form-field>
            </div>
            <boo-form-field label="Priority" for="claim-priority">
              <boo-select [id]="'claim-priority'" label="Priority" size="small" [options]="priorityOptions" [(ngModel)]="form.create.priority" />
            </boo-form-field>
            <boo-form-field label="Diagnosis" for="claim-diagnosis">
              <boo-textarea [id]="'claim-diagnosis'" label="Diagnosis" [rows]="2" size="small" [(ngModel)]="form.create.diagnosis" />
            </boo-form-field>
          </ng-container>

          <!-- Upload -->
          <ng-container *ngIf="mode === 'upload'">
            <div class="border-2 border-dashed border-[var(--ic-warm-gray-300)] rounded-1.5 p-6 text-center">
              <input type="file" multiple class="hidden" #fileInput (change)="filesPicked($event)" />
              <physio-icon name="upload-cloud" [size]="24" [class]="'text-[var(--ic-warm-gray-400)] mx-auto mb-2'"></physio-icon>
              <button type="button" boo-button variant="text" classname="text-xs font-semibold !text-[var(--ic-forest)]" (click)="fileInput.click()">Choose files</button>
              <p class="text-[10px] text-[var(--ic-warm-gray-500)] mt-1">Medical bills, prescriptions, scans, reports</p>
            </div>
            <ul class="space-y-1" *ngIf="pickedFileNames.length">
              <li *ngFor="let n of pickedFileNames" class="flex items-center gap-1.5 text-[var(--ic-graphite)]">
                <physio-icon name="file-text" [size]="12"></physio-icon>{{ n }}
              </li>
            </ul>
          </ng-container>

          <!-- Submit -->
          <ng-container *ngIf="mode === 'submit'">
            <boo-form-field label="Submission Notes" for="claim-submission-notes" optional>
              <boo-textarea [id]="'claim-submission-notes'" label="Any notes for the insurer…" [rows]="3" size="small" [(ngModel)]="form.notes" />
            </boo-form-field>
          </ng-container>

          <!-- Approve -->
          <ng-container *ngIf="mode === 'approve'">
            <boo-form-field label="Approved Amount (₫)" for="claim-approved-amount">
              <boo-input [id]="'claim-approved-amount'" label="Approved Amount (₫)" type="number" numberValue min="0" size="small" [(ngModel)]="form.approvedAmount" />
            </boo-form-field>
            <boo-form-field label="Notes" for="claim-notes" optional>
              <boo-textarea [id]="'claim-notes'" label="Notes" [rows]="2" size="small" [(ngModel)]="form.notes" />
            </boo-form-field>
          </ng-container>

          <!-- Reject -->
          <ng-container *ngIf="mode === 'reject'">
            <boo-form-field label="Rejection Reason" for="claim-rejection-reason" required>
              <boo-textarea [id]="'claim-rejection-reason'" label="Explain why this claim is being rejected…" required [rows]="3" size="small" [(ngModel)]="form.notes" />
            </boo-form-field>
          </ng-container>

          <!-- Appeal -->
          <ng-container *ngIf="mode === 'appeal'">
            <boo-form-field label="Grounds for Appeal" for="claim-grounds-for-appeal" required>
              <boo-textarea [id]="'claim-grounds-for-appeal'" label="Explain the grounds for appeal…" required [rows]="3" size="small" [(ngModel)]="form.notes" />
            </boo-form-field>
          </ng-container>

          <!-- Settle -->
          <ng-container *ngIf="mode === 'settle'">
            <boo-form-field label="Settled Amount (₫)" for="claim-settled-amount">
              <boo-input [id]="'claim-settled-amount'" label="Settled Amount (₫)" type="number" numberValue min="0" size="small" [(ngModel)]="form.settledAmount" />
            </boo-form-field>
            <boo-form-field label="Settlement Method" for="claim-settlement-method">
              <boo-input [id]="'claim-settlement-method'" label="Bank transfer, cheque…" size="small" [(ngModel)]="form.settlementMethod" />
            </boo-form-field>
          </ng-container>
        </div>
        <button boo-dialog-footer type="button" boo-button variant="ghost" size="sm" (click)="close.emit()">Cancel</button>
        <button boo-dialog-footer type="button" boo-button variant="primary" size="sm" (click)="submit()">Confirm</button>
    </boo-dialog>
  `,
})
export class InsuranceClaimActionDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() mode: ClaimActionMode | null = null;
  @Input() providers: InsuranceProviderNode[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<ClaimActionSubmitPayload>();

  readonly titles = TITLES;
  readonly priorityOptions = (['Low', 'Normal', 'High', 'Urgent'] as const).map(p => ({ label: p, value: p }));
  pickedFiles: File[] = [];
  pickedFileNames: string[] = [];

  form = {
    notes: '',
    approvedAmount: 0,
    settledAmount: 0,
    settlementMethod: '',
    create: {
      patientName: '',
      providerId: '',
      policyNumber: '',
      diagnosis: '',
      claimAmount: 0,
      department: '',
      doctorName: '',
      priority: 'Normal' as ClaimPriority,
    },
  };

  ngOnChanges(): void {
    if (!this.isOpen) return;
    this.form = {
      notes: '',
      approvedAmount: 0,
      settledAmount: 0,
      settlementMethod: '',
      create: { patientName: '', providerId: '', policyNumber: '', diagnosis: '', claimAmount: 0, department: '', doctorName: '', priority: 'Normal' },
    };
    this.pickedFiles = [];
    this.pickedFileNames = [];
  }

  filesPicked(ev: Event): void {
    const files = (ev.target as HTMLInputElement).files;
    if (!files) return;
    this.pickedFiles = Array.from(files);
    this.pickedFileNames = this.pickedFiles.map(f => f.name);
  }

  submit(): void {
    if (!this.mode) return;
    this.confirmed.emit({
      mode: this.mode,
      notes: this.form.notes,
      approvedAmount: this.form.approvedAmount,
      settledAmount: this.form.settledAmount,
      settlementMethod: this.form.settlementMethod,
      files: this.pickedFiles,
      create: this.form.create,
    });
  }
}
