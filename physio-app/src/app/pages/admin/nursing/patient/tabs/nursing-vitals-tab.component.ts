import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { VitalsReading } from "../../../../../shared/types/nursing.types";

@Component({
  selector: 'nursing-vitals-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooInputComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading()">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-primary m-0">Vitals History</h3>
        <button (click)="showForm = !showForm" class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90">
          {{ showForm ? 'Cancel' : 'Add Reading' }}
        </button>
      </div>

      <form *ngIf="showForm" (ngSubmit)="submit()" class="bg-surface border border-gray-200 rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <boo-input label="BP Systolic" type="number" [(ngModel)]="form.bloodPressureSystolic" name="systolic"></boo-input>
        <boo-input label="BP Diastolic" type="number" [(ngModel)]="form.bloodPressureDiastolic" name="diastolic"></boo-input>
        <boo-input label="Heart Rate" type="number" [(ngModel)]="form.heartRate" name="hr"></boo-input>
        <boo-input label="Temperature" type="number" [(ngModel)]="form.temperature" name="temp"></boo-input>
        <boo-input label="Respiratory Rate" type="number" [(ngModel)]="form.respiratoryRate" name="rr"></boo-input>
        <boo-input label="SpO2" type="number" [(ngModel)]="form.spo2" name="spo2"></boo-input>
        <div class="col-span-2 flex items-end">
          <button type="submit" [disabled]="loadingSrv.isLoading('vitals-add')" class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
            Save Reading
          </button>
        </div>
      </form>

      <div class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Time</th>
              <th class="px-4 py-3 text-left">BP</th>
              <th class="px-4 py-3 text-left">HR</th>
              <th class="px-4 py-3 text-left">Temp</th>
              <th class="px-4 py-3 text-left">RR</th>
              <th class="px-4 py-3 text-left">SpO2</th>
              <th class="px-4 py-3 text-left">Recorded By</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let v of readings()" [ngClass]="v.isAbnormal ? 'bg-amber-50' : ''">
              <td class="px-4 py-3">{{ v.recordedAt | date:'short' }}</td>
              <td class="px-4 py-3">{{ v.bloodPressureSystolic }}/{{ v.bloodPressureDiastolic }}</td>
              <td class="px-4 py-3">{{ v.heartRate }}</td>
              <td class="px-4 py-3">{{ v.temperature }}°C</td>
              <td class="px-4 py-3">{{ v.respiratoryRate }}</td>
              <td class="px-4 py-3">{{ v.spo2 }}%</td>
              <td class="px-4 py-3 text-gray-500">{{ v.recordedBy }}</td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="!readings().length" class="px-5 py-8 text-center text-xs text-secondary">No vitals recorded yet.</div>
      </div>
    </div>
  `,
})
export class NursingVitalsTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  readings = signal<VitalsReading[]>([]);
  showForm = false;
  form: Partial<VitalsReading> = {};

  constructor(private srv: NursingService, private toastSrv: ToastService, protected loadingSrv: LocalLoadingService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getVitals(this.patientId).subscribe({
      next: (res) => { if (res.success) this.readings.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  submit(): void {
    this.loadingSrv.setLoading('vitals-add', true);
    const reading = {
      recordedAt: new Date().toISOString(),
      recordedBy: 'You',
      bloodPressureSystolic: this.form.bloodPressureSystolic ?? 0,
      bloodPressureDiastolic: this.form.bloodPressureDiastolic ?? 0,
      heartRate: this.form.heartRate ?? 0,
      temperature: this.form.temperature ?? 0,
      respiratoryRate: this.form.respiratoryRate ?? 0,
      spo2: this.form.spo2 ?? 0,
      isAbnormal: false,
    };
    this.srv.addVitalsReading(this.patientId, reading).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading('vitals-add', false);
        if (res.success) {
          this.readings.set([res.data, ...this.readings()]);
          this.toastSrv.success('Vitals reading saved');
          this.showForm = false;
          this.form = {};
        } else {
          this.toastSrv.error('Unable to save vitals reading');
        }
      },
      error: () => { this.loadingSrv.setLoading('vitals-add', false); this.toastSrv.error('Unable to save vitals reading'); },
    });
  }
}
