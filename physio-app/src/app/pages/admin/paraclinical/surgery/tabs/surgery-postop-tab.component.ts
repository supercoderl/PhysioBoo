import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SurgeryService } from "../../../../../services/admin/surgery.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SurgeryCase, SurgeryRow } from "../../../../../shared/types/surgery.types";

@Component({
  selector: 'surgery-postop-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !cases().length"><boo-empty-state icon="bed" title="No patients currently in recovery"></boo-empty-state></div>

    <div *ngIf="!isLoading() && cases().length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Surgery #</th>
            <th class="px-4 py-3 text-left">Patient</th>
            <th class="px-4 py-3 text-left">Procedure</th>
            <th class="px-4 py-3 text-left">PACU Bay</th>
            <th class="px-4 py-3 text-left">Recovery Status</th>
            <th class="px-4 py-3 text-left">Complications</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let s of cases()" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-800">{{ s.surgeryNumber }}</td>
            <td class="px-4 py-3">{{ s.patientName }}<div class="text-xs text-gray-400">{{ s.mrn }}</div></td>
            <td class="px-4 py-3 text-gray-700">{{ s.procedure }}</td>
            <td class="px-4 py-3 text-gray-500">{{ detail[s.id].pacuBay ?? '—' }}</td>
            <td class="px-4 py-3"><boo-status-badge [label]="detail[s.id]?.recoveryStatus ?? 'Pending'" tone="primary"></boo-status-badge></td>
            <td class="px-4 py-3 text-gray-500">{{ detail[s.id].complications ?? 'None reported' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <button (click)="viewCase.emit(s.id)" class="text-primary text-xs font-semibold hover:underline">View</button>
                <button (click)="discharge(s)" class="text-emerald-600 text-xs font-semibold hover:underline">Discharge from OR</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class SurgeryPostopTabComponent implements OnInit {
  @Output() viewCase = new EventEmitter<string>();

  isLoading = signal(true);
  cases = signal<SurgeryRow[]>([]);
  detail: Record<string, SurgeryCase> = {};

  constructor(private srv: SurgeryService, private toastSrv: ToastService, private dialogSrv: DialogService) { }

  ngOnInit(): void {
    this.srv.getCases().subscribe({
      next: (res) => {
        if (res.success) {
          const list = res.data.items.filter(s => s.status === 'Recovery' || s.status === 'ProcedureCompleted');
          this.cases.set(list);
          for (const s of list) {
            this.srv.getCaseDetail(s.id).subscribe((d: any) => { if (d.success) this.detail[s.id] = d.data; });
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  discharge(s: SurgeryRow): void {
    this.dialogSrv.confirm(
      `Discharge ${s.patientName} from OR/PACU?`,
      () => {
        this.srv.dischargeCase(s.id).subscribe(res => {
          if (res.success) {
            this.cases.set(this.cases().filter(x => x.id !== s.id));
            this.toastSrv.success('Patient discharged from OR');
          } else {
            this.toastSrv.error('Unable to discharge patient');
          }
        });
      },
      'Discharge from OR',
    );
  }
}
