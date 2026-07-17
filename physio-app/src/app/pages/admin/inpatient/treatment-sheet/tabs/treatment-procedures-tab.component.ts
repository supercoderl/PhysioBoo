import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { TreatmentProcedureRow } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-procedures-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooInputComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-primary m-0">Procedures</h3>
      <button (click)="showForm = !showForm" class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90">
        {{ showForm ? 'Cancel' : 'Add Procedure' }}
      </button>
    </div>

    <form *ngIf="showForm" (ngSubmit)="submit()" class="bg-surface border border-gray-200 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <boo-input label="Procedure Name" [(ngModel)]="form.name" name="name"></boo-input>
      <boo-input label="Department" [(ngModel)]="form.department" name="department"></boo-input>
      <boo-input label="Performed By" [(ngModel)]="form.performerName" name="performer"></boo-input>
      <div class="md:col-span-3 flex justify-end">
        <button type="submit" [disabled]="loadingSrv.isLoading('procedure-add')" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
          Save Procedure
        </button>
      </div>
    </form>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !procedures().length"><boo-empty-state icon="stethoscope" title="No procedures recorded"></boo-empty-state></div>

    <div *ngIf="!isLoading() && procedures().length" class="space-y-3">
      <div *ngFor="let p of procedures()" class="bg-surface border border-gray-200 rounded-lg p-4 hover:border-primary/40 transition-colors">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="text-sm font-semibold text-gray-800">{{ p.name }}</h4>
            <p class="text-xs text-secondary">{{ p.department }} · Scheduled {{ p.scheduledTime | date:'short' }}
              <span *ngIf="p.completionTime"> · Completed {{ p.completionTime | date:'short' }}</span>
              <span *ngIf="p.performerName"> · {{ p.performerName }}</span>
            </p>
          </div>
          <boo-status-badge [label]="p.status" [tone]="statusTone(p.status)"></boo-status-badge>
        </div>
      </div>
    </div>
  `,
})
export class TreatmentProceduresTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  procedures = signal<TreatmentProcedureRow[]>([]);
  showForm = false;
  form: Partial<TreatmentProcedureRow> = {};

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService, protected loadingSrv: LocalLoadingService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getProcedures(this.patientId).subscribe({
      next: (res) => { if (res.success) this.procedures.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  submit(): void {
    if (!this.form.name || !this.form.performerName) {
      this.toastSrv.error('Please fill in required fields');
      return;
    }
    this.loadingSrv.setLoading('procedure-add', true);
    const procedure: Omit<TreatmentProcedureRow, 'id'> = {
      name: this.form.name,
      department: this.form.department ?? '—',
      performerName: this.form.performerName,
      scheduledTime: new Date().toISOString(),
      status: 'Completed',
    };
    this.srv.addProcedure(this.patientId, procedure).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading('procedure-add', false);
        if (res.success) {
          this.procedures.set([res.data, ...this.procedures()]);
          this.toastSrv.success('Procedure recorded');
          this.showForm = false;
          this.form = {};
        } else {
          this.toastSrv.error('Unable to record procedure');
        }
      },
      error: () => { this.loadingSrv.setLoading('procedure-add', false); this.toastSrv.error('Unable to record procedure'); },
    });
  }

  statusTone(status: TreatmentProcedureRow['status']): BadgeTone {
    switch (status) {
      case 'Completed': return 'success';
      case 'InProgress': return 'primary';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  }
}
