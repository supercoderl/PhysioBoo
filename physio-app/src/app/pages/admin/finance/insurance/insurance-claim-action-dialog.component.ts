import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { ClaimActionMode, ClaimPriority, InsuranceProviderNode } from "../../../../shared/types/insurance-claims.types";

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
  imports: [SharedModule, BooIconComponent],
  template: `
    <div class="fixed inset-0 z-[10000]" [style.pointer-events]="isOpen ? 'auto' : 'none'">
      <div
        aria-hidden="true"
        (click)="close.emit()"
        class="fixed inset-0 bg-[rgba(20,20,18,0.45)] backdrop-blur-[2px] transition-opacity duration-200"
        [style.opacity]="isOpen ? '1' : '0'"
      ></div>

      <div
        class="fixed left-1/2 top-1/2 w-[92vw] max-w-[520px] max-h-[85vh] flex flex-col rounded-2 bg-[var(--ic-ivory)] shadow-2xl border border-[var(--ic-warm-gray-200)] transition-all duration-200 overflow-hidden"
        [style.transform]="isOpen ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0.96)'"
        [style.opacity]="isOpen ? '1' : '0'"
        role="dialog"
        aria-modal="true"
      >
        <header class="flex items-center justify-between px-4 py-3 border-b border-[var(--ic-warm-gray-200)]">
          <h2 class="text-sm font-bold text-[var(--ic-graphite)]">{{ mode ? titles[mode] : '' }}</h2>
          <button type="button" class="p-1 rounded hover:bg-[var(--ic-warm-gray-200)]" (click)="close.emit()" aria-label="Close dialog">
            <boo-icon name="x" [size]="16" iconClass="text-[var(--ic-warm-gray-600)]"></boo-icon>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto p-4 space-y-3 text-xs" *ngIf="mode">
          <!-- Create -->
          <ng-container *ngIf="mode === 'create'">
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Patient Name</span>
              <input type="text" [(ngModel)]="form.create.patientName" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
            </label>
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Insurance Provider</span>
              <select [(ngModel)]="form.create.providerId" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]">
                <option value="">Select provider</option>
                <option *ngFor="let p of providers" [value]="p.id">{{ p.name }}</option>
              </select>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Policy Number</span>
                <input type="text" [(ngModel)]="form.create.policyNumber" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
              </label>
              <label class="block">
                <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Claim Amount (₫)</span>
                <input type="number" min="0" [(ngModel)]="form.create.claimAmount" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label class="block">
                <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Department</span>
                <input type="text" [(ngModel)]="form.create.department" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
              </label>
              <label class="block">
                <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Doctor</span>
                <input type="text" [(ngModel)]="form.create.doctorName" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
              </label>
            </div>
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Priority</span>
              <select [(ngModel)]="form.create.priority" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]">
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </label>
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Diagnosis</span>
              <textarea rows="2" [(ngModel)]="form.create.diagnosis" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]"></textarea>
            </label>
          </ng-container>

          <!-- Upload -->
          <ng-container *ngIf="mode === 'upload'">
            <div class="border-2 border-dashed border-[var(--ic-warm-gray-300)] rounded-1.5 p-6 text-center">
              <input type="file" multiple class="hidden" #fileInput (change)="filesPicked($event)" />
              <boo-icon name="upload-cloud" [size]="24" iconClass="text-[var(--ic-warm-gray-400)] mx-auto mb-2"></boo-icon>
              <button type="button" class="text-[11px] font-semibold text-[var(--ic-forest)] hover:underline" (click)="fileInput.click()">Choose files</button>
              <p class="text-[10px] text-[var(--ic-warm-gray-500)] mt-1">Medical bills, prescriptions, scans, reports</p>
            </div>
            <ul class="space-y-1" *ngIf="pickedFileNames.length">
              <li *ngFor="let n of pickedFileNames" class="flex items-center gap-1.5 text-[var(--ic-graphite)]">
                <boo-icon name="file-text" [size]="12"></boo-icon>{{ n }}
              </li>
            </ul>
          </ng-container>

          <!-- Submit -->
          <ng-container *ngIf="mode === 'submit'">
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Submission Notes (optional)</span>
              <textarea rows="3" [(ngModel)]="form.notes" placeholder="Any notes for the insurer…" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]"></textarea>
            </label>
          </ng-container>

          <!-- Approve -->
          <ng-container *ngIf="mode === 'approve'">
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Approved Amount (₫)</span>
              <input type="number" min="0" [(ngModel)]="form.approvedAmount" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
            </label>
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Notes (optional)</span>
              <textarea rows="2" [(ngModel)]="form.notes" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]"></textarea>
            </label>
          </ng-container>

          <!-- Reject -->
          <ng-container *ngIf="mode === 'reject'">
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Rejection Reason</span>
              <textarea rows="3" required [(ngModel)]="form.notes" placeholder="Explain why this claim is being rejected…" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]"></textarea>
            </label>
          </ng-container>

          <!-- Appeal -->
          <ng-container *ngIf="mode === 'appeal'">
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Grounds for Appeal</span>
              <textarea rows="3" required [(ngModel)]="form.notes" placeholder="Explain the grounds for appeal…" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]"></textarea>
            </label>
          </ng-container>

          <!-- Settle -->
          <ng-container *ngIf="mode === 'settle'">
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Settled Amount (₫)</span>
              <input type="number" min="0" [(ngModel)]="form.settledAmount" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
            </label>
            <label class="block">
              <span class="block text-[11px] font-semibold text-[var(--ic-warm-gray-600)] mb-1">Settlement Method</span>
              <input type="text" placeholder="Bank transfer, cheque…" [(ngModel)]="form.settlementMethod" class="w-full px-2.5 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
            </label>
          </ng-container>
        </div>

        <footer class="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--ic-warm-gray-200)]">
          <button type="button" class="px-3 py-1.5 rounded-1.5 text-xs font-semibold text-[var(--ic-warm-gray-600)] hover:bg-[var(--ic-warm-gray-200)]" (click)="close.emit()">Cancel</button>
          <button type="button" class="px-3 py-1.5 rounded-1.5 text-xs font-semibold bg-[var(--ic-forest)] text-[var(--ic-ivory)] hover:bg-[var(--ic-forest-dark)]" (click)="submit()">Confirm</button>
        </footer>
      </div>
    </div>
  `,
})
export class InsuranceClaimActionDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() mode: ClaimActionMode | null = null;
  @Input() providers: InsuranceProviderNode[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<ClaimActionSubmitPayload>();

  readonly titles = TITLES;
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
