import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { LaboratoryService } from "../../../../../services/admin/laboratory.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabResultEntry, LabResultFlag, LabVerificationStatus } from "../../../../../shared/types/laboratory.types";

@Component({
  selector: 'laboratory-result-verification-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooInputComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !results().length"><boo-empty-state icon="clipboard-check" title="No results pending entry or verification"></boo-empty-state></div>

    <div *ngIf="!isLoading() && results().length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Order #</th>
            <th class="px-4 py-3 text-left">Patient</th>
            <th class="px-4 py-3 text-left">Test</th>
            <th class="px-4 py-3 text-left">Result</th>
            <th class="px-4 py-3 text-left">Unit</th>
            <th class="px-4 py-3 text-left">Reference Range</th>
            <th class="px-4 py-3 text-left">Flag</th>
            <th class="px-4 py-3 text-left">Verification</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let r of results()" [ngClass]="r.flag === 'HH' || r.flag === 'LL' ? 'bg-rose-50' : ''">
            <td class="px-4 py-3 font-medium text-gray-800">{{ r.orderNumber }}</td>
            <td class="px-4 py-3">{{ r.patientName }} <span class="text-gray-400">({{ r.mrn }})</span></td>
            <td class="px-4 py-3 text-gray-700">{{ r.testName }}</td>
            <td class="px-4 py-3 w-36">
              <boo-input *ngIf="editingId() === r.id" label="Value" size="small" [(ngModel)]="editValue" (blur)="commitEdit(r)" [attr.aria-label]="r.testName + ' result value'"></boo-input>
              <button *ngIf="editingId() !== r.id" type="button" (click)="startEdit(r)" [disabled]="r.verificationStatus === 'Verified'"
                class="text-left w-full font-medium text-gray-800 hover:text-primary disabled:hover:text-gray-800 disabled:cursor-default">
                {{ r.value || '—' }}
              </button>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ r.unit ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ r.referenceRange ?? '—' }}</td>
            <td class="px-4 py-3"><boo-status-badge [label]="r.flag" [tone]="flagTone(r.flag)"></boo-status-badge></td>
            <td class="px-4 py-3"><boo-status-badge [label]="r.verificationStatus" [tone]="verificationTone(r.verificationStatus)"></boo-status-badge></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2" *ngIf="r.verificationStatus === 'PendingVerification'">
                <button (click)="approve(r)" [disabled]="loadingSrv.isLoading('verify-' + r.id)" class="text-emerald-600 text-xs font-semibold hover:underline disabled:opacity-40">Approve</button>
                <button (click)="reject(r)" [disabled]="loadingSrv.isLoading('verify-' + r.id)" class="text-rose-600 text-xs font-semibold hover:underline disabled:opacity-40">Reject</button>
                <button (click)="returnForReview(r)" [disabled]="loadingSrv.isLoading('verify-' + r.id)" class="text-amber-600 text-xs font-semibold hover:underline disabled:opacity-40">Return</button>
              </div>
              <span *ngIf="r.verificationStatus !== 'PendingVerification'" class="text-gray-400 text-xs">{{ r.verifiedAt ? (r.verifiedAt | date:'short') : '—' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class LaboratoryResultVerificationTabComponent implements OnInit {
  isLoading = signal(true);
  results = signal<LabResultEntry[]>([]);
  editingId = signal<string | null>(null);
  editValue = '';

  constructor(
    private srv: LaboratoryService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnInit(): void {
    this.srv.getResults().subscribe({
      next: (res) => { if (res.success) this.results.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  startEdit(r: LabResultEntry): void {
    if (r.verificationStatus === 'Verified') return;
    this.editingId.set(r.id);
    this.editValue = r.value;
  }

  commitEdit(r: LabResultEntry): void {
    if (this.editingId() !== r.id) return;
    const value = this.editValue;
    this.editingId.set(null);
    if (value === r.value) return;
    this.srv.updateResultValue(r.id, value).subscribe(res => {
      if (res.success) {
        this.results.update(list => list.map(x => x.id === r.id ? { ...x, value } : x));
        this.toastSrv.success('Result value saved');
      } else {
        this.toastSrv.error('Unable to save result value');
      }
    });
  }

  flagTone(flag: LabResultFlag): BadgeTone {
    switch (flag) {
      case 'N': return 'neutral';
      case 'H': case 'L': return 'warning';
      default: return 'danger';
    }
  }

  verificationTone(status: LabVerificationStatus): BadgeTone {
    switch (status) {
      case 'Verified': return 'success';
      case 'PendingVerification': return 'warning';
      default: return 'danger';
    }
  }

  approve(r: LabResultEntry): void {
    const key = 'verify-' + r.id;
    this.loadingSrv.setLoading(key, true);
    this.srv.approveResult(r.id).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading(key, false);
        if (res.success) {
          this.results.update(list => list.map(x => x.id === r.id ? { ...x, verificationStatus: 'Verified' as const, verifiedAt: new Date().toISOString() } : x));
          this.toastSrv.success('Result approved');
        } else {
          this.toastSrv.error('Unable to approve result');
        }
      },
      error: () => this.loadingSrv.setLoading(key, false),
    });
  }

  reject(r: LabResultEntry): void {
    this.dialogSrv.confirm(
      `Reject the result for ${r.testName} (${r.orderNumber})?`,
      () => {
        const key = 'verify-' + r.id;
        this.loadingSrv.setLoading(key, true);
        this.srv.rejectResult(r.id, 'Result rejected during verification').subscribe({
          next: (res) => {
            this.loadingSrv.setLoading(key, false);
            if (res.success) {
              this.results.update(list => list.map(x => x.id === r.id ? { ...x, verificationStatus: 'Rejected' as const } : x));
              this.toastSrv.success('Result rejected');
            } else {
              this.toastSrv.error('Unable to reject result');
            }
          },
          error: () => this.loadingSrv.setLoading(key, false),
        });
      },
      'Reject Result',
      'danger',
      'Reject',
    );
  }

  returnForReview(r: LabResultEntry): void {
    this.dialogSrv.confirm(
      `Return the result for ${r.testName} (${r.orderNumber}) for review?`,
      () => {
        const key = 'verify-' + r.id;
        this.loadingSrv.setLoading(key, true);
        this.srv.returnResultForReview(r.id, 'Returned for review').subscribe({
          next: (res) => {
            this.loadingSrv.setLoading(key, false);
            if (res.success) {
              this.results.update(list => list.map(x => x.id === r.id ? { ...x, verificationStatus: 'ReturnedForReview' as const } : x));
              this.toastSrv.success('Result returned for review');
            } else {
              this.toastSrv.error('Unable to return result for review');
            }
          },
          error: () => this.loadingSrv.setLoading(key, false),
        });
      },
      'Return for Review',
      'warning',
      'Return',
    );
  }
}
