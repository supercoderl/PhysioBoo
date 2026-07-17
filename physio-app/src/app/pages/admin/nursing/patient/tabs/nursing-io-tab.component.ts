import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { IntakeOutputCategory, IntakeOutputEntry } from "../../../../../shared/types/nursing.types";

@Component({
  selector: 'nursing-io-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooInputComponent, BooSelectComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading()">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm text-secondary">Balance (loaded entries): <span class="font-semibold" [ngClass]="balance() >= 0 ? 'text-emerald-600' : 'text-red-600'">{{ balance() }} mL</span></div>
        <button (click)="showForm = !showForm" class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90">
          {{ showForm ? 'Cancel' : 'Add Entry' }}
        </button>
      </div>

      <form *ngIf="showForm" (ngSubmit)="submit()" class="bg-surface border border-gray-200 rounded-lg p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <boo-select label="Direction" [(ngModel)]="form.direction" name="direction" [options]="directionOptions" bindLabel="label" bindValue="value"></boo-select>
        <boo-select label="Category" [(ngModel)]="form.category" name="category" [options]="categoryOptions" bindLabel="label" bindValue="value"></boo-select>
        <boo-input label="Volume (mL)" type="number" [(ngModel)]="form.volumeMl" name="volume"></boo-input>
        <div class="flex items-end">
          <button type="submit" [disabled]="loadingSrv.isLoading('io-add')" class="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">Save</button>
        </div>
      </form>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section class="bg-surface border border-gray-200 rounded-lg">
          <header class="px-5 py-3 border-b border-gray-100"><h3 class="text-sm font-semibold text-primary m-0">Intake ({{ totalIntake() }} mL)</h3></header>
          <ul class="divide-y divide-gray-100 m-0 p-0 list-none">
            <li *ngFor="let e of intake()" class="px-5 py-3 flex items-center justify-between text-sm">
              <span class="text-secondary">{{ e.recordedAt | date:'short' }} · {{ e.category }}</span>
              <span class="text-primary font-medium">{{ e.volumeMl }} mL</span>
            </li>
          </ul>
          <div *ngIf="!intake().length" class="px-5 py-6 text-center text-xs text-secondary">No intake recorded.</div>
        </section>

        <section class="bg-surface border border-gray-200 rounded-lg">
          <header class="px-5 py-3 border-b border-gray-100"><h3 class="text-sm font-semibold text-primary m-0">Output ({{ totalOutput() }} mL)</h3></header>
          <ul class="divide-y divide-gray-100 m-0 p-0 list-none">
            <li *ngFor="let e of output()" class="px-5 py-3 flex items-center justify-between text-sm">
              <span class="text-secondary">{{ e.recordedAt | date:'short' }} · {{ e.category }}</span>
              <span class="text-primary font-medium">{{ e.volumeMl }} mL</span>
            </li>
          </ul>
          <div *ngIf="!output().length" class="px-5 py-6 text-center text-xs text-secondary">No output recorded.</div>
        </section>
      </div>
    </div>
  `,
})
export class NursingIoTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  entries = signal<IntakeOutputEntry[]>([]);
  showForm = false;
  form: { direction: 'Intake' | 'Output'; category: IntakeOutputCategory; volumeMl: number | null } = { direction: 'Intake', category: 'Oral', volumeMl: null };

  directionOptions = [{ label: 'Intake', value: 'Intake' }, { label: 'Output', value: 'Output' }];
  categoryOptions: { label: string; value: IntakeOutputCategory }[] = [
    { label: 'Oral', value: 'Oral' }, { label: 'IV', value: 'IV' }, { label: 'Urine', value: 'Urine' },
    { label: 'Drain', value: 'Drain' }, { label: 'Other', value: 'Other' },
  ];

  constructor(private srv: NursingService, private toastSrv: ToastService, protected loadingSrv: LocalLoadingService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getIntakeOutput(this.patientId).subscribe({
      next: (res) => { if (res.success) this.entries.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  intake() { return this.entries().filter(e => e.direction === 'Intake'); }
  output() { return this.entries().filter(e => e.direction === 'Output'); }
  totalIntake() { return this.intake().reduce((sum, e) => sum + e.volumeMl, 0); }
  totalOutput() { return this.output().reduce((sum, e) => sum + e.volumeMl, 0); }
  balance() { return this.totalIntake() - this.totalOutput(); }

  submit(): void {
    if (!this.form.volumeMl) return;
    this.loadingSrv.setLoading('io-add', true);
    const entry = {
      recordedAt: new Date().toISOString(),
      recordedBy: 'You',
      direction: this.form.direction,
      category: this.form.category,
      volumeMl: this.form.volumeMl,
    };
    this.srv.addIntakeOutputEntry(this.patientId, entry).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading('io-add', false);
        if (res.success) {
          this.entries.set([res.data, ...this.entries()]);
          this.toastSrv.success('Entry recorded');
          this.showForm = false;
          this.form = { direction: 'Intake', category: 'Oral', volumeMl: null };
        } else {
          this.toastSrv.error('Unable to record entry');
        }
      },
      error: () => { this.loadingSrv.setLoading('io-add', false); this.toastSrv.error('Unable to record entry'); },
    });
  }
}
