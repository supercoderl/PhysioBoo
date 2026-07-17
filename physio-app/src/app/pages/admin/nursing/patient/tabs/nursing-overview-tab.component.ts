import { Component, Input, OnChanges, signal } from "@angular/core";
import { forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { IntakeOutputEntry, NursingTask, VitalsReading } from "../../../../../shared/types/nursing.types";

@Component({
  selector: 'nursing-overview-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading()" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <!-- Open tasks -->
      <section class="bg-surface border border-gray-200 rounded-lg">
        <header class="px-5 py-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
            <boo-icon name="clipboard-list" iconClass="w-4 h-4 text-secondary"></boo-icon>
            Open Tasks
          </h3>
        </header>
        <ul *ngIf="openTasks().length" class="divide-y divide-gray-100 m-0 p-0 list-none">
          <li *ngFor="let t of openTasks()" class="px-5 py-3 flex items-center justify-between">
            <span class="text-sm text-primary">{{ t.label }}</span>
            <span class="text-xs" [ngClass]="isOverdue(t.dueAt) ? 'text-red-600 font-medium' : 'text-secondary'">{{ t.dueAt | date:'shortTime' }}</span>
          </li>
        </ul>
        <div *ngIf="!openTasks().length" class="px-5 py-6 text-center text-xs text-secondary">No open tasks.</div>
      </section>

      <!-- Vitals trend -->
      <section class="bg-surface border border-gray-200 rounded-lg">
        <header class="px-5 py-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
            <boo-icon name="activity" iconClass="w-4 h-4 text-secondary"></boo-icon>
            Recent Vitals
          </h3>
        </header>
        <ul *ngIf="recentVitals().length" class="divide-y divide-gray-100 m-0 p-0 list-none">
          <li *ngFor="let v of recentVitals()" class="px-5 py-3 flex items-center justify-between text-sm">
            <span class="text-secondary">{{ v.recordedAt | date:'short' }}</span>
            <span class="text-primary" [ngClass]="v.isAbnormal ? 'text-amber-600 font-medium' : ''">
              {{ v.bloodPressureSystolic }}/{{ v.bloodPressureDiastolic }} · HR {{ v.heartRate }} · SpO2 {{ v.spo2 }}%
            </span>
          </li>
        </ul>
        <div *ngIf="!recentVitals().length" class="px-5 py-6 text-center text-xs text-secondary">No readings yet.</div>
      </section>

      <!-- I&O balance -->
      <section class="bg-surface border border-gray-200 rounded-lg xl:col-span-2">
        <header class="px-5 py-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
            <boo-icon name="droplets" iconClass="w-4 h-4 text-secondary"></boo-icon>
            Intake & Output Balance (last entries)
          </h3>
        </header>
        <div class="p-5 grid grid-cols-3 gap-4 text-sm">
          <div><dt class="text-xs text-secondary mb-0.5">Total Intake</dt><dd class="text-primary font-semibold m-0">{{ totalIntake() }} mL</dd></div>
          <div><dt class="text-xs text-secondary mb-0.5">Total Output</dt><dd class="text-primary font-semibold m-0">{{ totalOutput() }} mL</dd></div>
          <div><dt class="text-xs text-secondary mb-0.5">Balance</dt><dd class="font-semibold m-0" [ngClass]="balance() >= 0 ? 'text-emerald-600' : 'text-red-600'">{{ balance() }} mL</dd></div>
        </div>
      </section>
    </div>
  `,
})
export class NursingOverviewTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  openTasks = signal<NursingTask[]>([]);
  recentVitals = signal<VitalsReading[]>([]);
  io = signal<IntakeOutputEntry[]>([]);

  constructor(private srv: NursingService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    forkJoin({
      tasks: this.srv.getTasks(this.patientId),
      vitals: this.srv.getVitals(this.patientId),
      io: this.srv.getIntakeOutput(this.patientId),
    }).subscribe({
      next: (r) => {
        if (r.tasks.success) this.openTasks.set(r.tasks.data.items.filter(t => t.status === 'Pending' || t.status === 'Overdue'));
        if (r.vitals.success) this.recentVitals.set(r.vitals.data.items.slice(0, 6));
        if (r.io.success) this.io.set(r.io.data.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  isOverdue(dueAt: string): boolean { return new Date(dueAt).getTime() < Date.now(); }

  totalIntake(): number { return this.io().filter(e => e.direction === 'Intake').reduce((sum, e) => sum + e.volumeMl, 0); }
  totalOutput(): number { return this.io().filter(e => e.direction === 'Output').reduce((sum, e) => sum + e.volumeMl, 0); }
  balance(): number { return this.totalIntake() - this.totalOutput(); }
}
