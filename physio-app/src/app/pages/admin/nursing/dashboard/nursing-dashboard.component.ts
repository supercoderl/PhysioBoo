import { Component, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { finalize, forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../components/input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { NursingService } from "../../../../services/admin/nursing.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { AlertSeverity, NursingAlert, NursingAssignmentFilter, NursingPatient, NursingStats, ShiftCode } from "../../../../shared/types/nursing.types";

@Component({
    selector: 'admin-nursing-dashboard',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooInputComponent, BooSelectComponent, StatusBadgeComponent, ErrorStateComponent],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Nursing Dashboard</h2>
            <p class="text-gray-600">My assigned patients for this shift</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <boo-select label="Shift" [(ngModel)]="shift" (ngModelChange)="onShiftChange()" [options]="shiftOptions" bindLabel="label" bindValue="value"></boo-select>
            <boo-select label="Ward" [(ngModel)]="filter.wardId" (ngModelChange)="applyFilters()" [options]="wardOptions" bindLabel="label" bindValue="value"></boo-select>
            <boo-input label="Search patient or bed..." size="small" (search)="onSearch($event)"></boo-input>
            <button (click)="refresh()" [disabled]="loadingSrv.isLoading('nursing-dashboard')"
              class="px-4 py-2 bg-surface border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50">
              <boo-icon name="refresh-cw" [size]="16" [class.animate-spin]="loadingSrv.isLoading('nursing-dashboard')"></boo-icon>
              Refresh
            </button>
          </div>
        </div>

        <!-- Error -->
        <div *ngIf="error() && !loadingSrv.isLoading('nursing-dashboard')" class="mb-6">
          <boo-error-state title="Couldn't load nursing dashboard" [description]="error()" (retry)="refresh()"></boo-error-state>
        </div>

        <!-- Loading -->
        <div *ngIf="loadingSrv.isLoading('nursing-dashboard') && !hasLoadedOnce" class="flex flex-col items-center justify-center py-24 gap-3">
          <boo-icon name="loader" [size]="32" class="animate-spin text-primary"></boo-icon>
          <span class="text-gray-500 text-sm">Loading nursing dashboard...</span>
        </div>

        <ng-container *ngIf="!error() && hasLoadedOnce">
          <!-- Stats strip -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div><p class="text-sm text-gray-600 mb-1">Assigned Patients</p><p class="text-3xl font-bold text-gray-800">{{ stats?.assignedPatients ?? 0 }}</p></div>
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><boo-icon name="users" [size]="24" class="text-blue-600"></boo-icon></div>
              </div>
            </div>
            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div><p class="text-sm text-gray-600 mb-1">Open Tasks</p><p class="text-3xl font-bold text-gray-800">{{ stats?.openTasks ?? 0 }}</p></div>
                <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center"><boo-icon name="clipboard-list" [size]="24" class="text-indigo-600"></boo-icon></div>
              </div>
            </div>
            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div><p class="text-sm text-gray-600 mb-1">Overdue Tasks</p><p class="text-3xl font-bold text-red-600">{{ stats?.overdueTasks ?? 0 }}</p></div>
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><boo-icon name="alarm-clock" [size]="24" class="text-red-600"></boo-icon></div>
              </div>
            </div>
            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div><p class="text-sm text-gray-600 mb-1">Active Alerts</p><p class="text-3xl font-bold text-amber-600">{{ stats?.activeAlerts ?? 0 }}</p></div>
                <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center"><boo-icon name="bell" [size]="24" class="text-amber-600"></boo-icon></div>
              </div>
            </div>
          </div>

          <!-- Clinical alerts banner -->
          <div *ngIf="alerts.length > 0" class="mb-6 flex gap-3 overflow-x-auto pb-1" aria-live="polite">
            <div *ngFor="let a of alerts" class="shrink-0 min-w-[260px] bg-surface border rounded-lg p-3 flex items-start gap-2"
              [ngClass]="alertBorderClass(a.severity)">
              <boo-icon [name]="alertIcon(a.type)" [size]="18" [ngClass]="alertIconClass(a.severity)"></boo-icon>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-gray-800 truncate">{{ a.patientName }}</span>
                  <boo-status-badge [label]="a.bedNumber" tone="neutral"></boo-status-badge>
                </div>
                <p class="text-xs text-gray-600 mt-0.5">{{ a.message }}</p>
              </div>
              <button (click)="acknowledgeAlert(a)" class="text-gray-400 hover:text-gray-600" aria-label="Acknowledge alert">
                <boo-icon name="x" [size]="16"></boo-icon>
              </button>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-surface rounded-lg shadow-md p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <boo-select label="Risk Flag" [(ngModel)]="filter.riskFlag" (ngModelChange)="applyFilters()" [options]="riskOptions" bindLabel="label" bindValue="value"></boo-select>
              <boo-select label="Task State" [(ngModel)]="filter.taskState" (ngModelChange)="applyFilters()" [options]="taskStateOptions" bindLabel="label" bindValue="value"></boo-select>
            </div>
          </div>

          <!-- Empty state -->
          <div *ngIf="filteredPatients.length === 0" class="bg-surface rounded-lg shadow-md p-12 flex flex-col items-center justify-center text-center">
            <boo-icon name="inbox" [size]="36" class="text-gray-300 mb-3"></boo-icon>
            <p class="text-gray-500 text-sm">No patients assigned for this shift.</p>
          </div>

          <!-- Patient list -->
          <div *ngIf="filteredPatients.length > 0" class="bg-surface rounded-lg shadow-md overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
                <tr>
                  <th class="px-4 py-3 text-left">Patient</th>
                  <th class="px-4 py-3 text-left">Bed</th>
                  <th class="px-4 py-3 text-left">Risk</th>
                  <th class="px-4 py-3 text-left">Acuity</th>
                  <th class="px-4 py-3 text-left">Next Task</th>
                  <th class="px-4 py-3 text-left">MAR Due</th>
                  <th class="px-4 py-3 text-left">Last Vitals</th>
                  <th class="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let p of filteredPatients" tabindex="0" (click)="openChart(p)" (keydown.enter)="openChart(p)"
                  class="hover:bg-gray-50 cursor-pointer focus:outline-none focus:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="font-semibold text-gray-800">{{ p.patientName }}</div>
                    <div class="text-xs text-gray-500">{{ p.patientNumber }}</div>
                  </td>
                  <td class="px-4 py-3 text-gray-700">{{ p.wardName }} · {{ p.bedNumber }}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                      <boo-status-badge *ngIf="p.risk.fallRisk" label="Fall Risk" tone="warning" [dotted]="true"></boo-status-badge>
                      <boo-status-badge *ngIf="p.risk.isolationRequired" label="Isolation" tone="primary" [dotted]="true"></boo-status-badge>
                      <boo-status-badge *ngIf="p.risk.isEmergency" label="Emergency" tone="danger" [dotted]="true"></boo-status-badge>
                      <boo-status-badge *ngIf="p.risk.hasAllergies" label="Allergy" tone="danger" [dotted]="true"></boo-status-badge>
                    </div>
                  </td>
                  <td class="px-4 py-3"><boo-status-badge [label]="p.acuity" [tone]="acuityTone(p.acuity)"></boo-status-badge></td>
                  <td class="px-4 py-3" [ngClass]="isOverdue(p.nextTaskDueAt) ? 'text-red-600 font-medium' : 'text-gray-700'">
                    {{ p.nextTaskLabel ?? '—' }}
                  </td>
                  <td class="px-4 py-3 text-gray-700">{{ p.marDueCount }}</td>
                  <td class="px-4 py-3" [ngClass]="isStale(p.lastVitalsAt) ? 'text-amber-600' : 'text-gray-700'">
                    {{ p.lastVitalsAt ? (p.lastVitalsAt | date:'shortTime') : 'No readings' }}
                  </td>
                  <td class="px-4 py-3">
                    <button (click)="openChart(p); $event.stopPropagation()" class="text-primary text-xs font-semibold hover:underline">Open chart</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
      </div>
    </div>
    `
})
export class AdminNursingDashboardComponent implements OnInit {
    patients: NursingPatient[] = [];
    stats: NursingStats | null = null;
    alerts: NursingAlert[] = [];
    error = signal<string | null>(null);
    hasLoadedOnce = false;

    shift: ShiftCode = 'Day';
    filter: NursingAssignmentFilter = { shift: 'Day', wardId: null, search: null, riskFlag: null, taskState: null };

    shiftOptions: { label: string; value: ShiftCode }[] = [
        { label: 'Day', value: 'Day' },
        { label: 'Evening', value: 'Evening' },
        { label: 'Night', value: 'Night' },
    ];

    riskOptions: { label: string; value: NursingAssignmentFilter['riskFlag'] }[] = [
        { label: 'All Risk Flags', value: null },
        { label: 'Fall Risk', value: 'FallRisk' },
        { label: 'Isolation', value: 'Isolation' },
        { label: 'Emergency', value: 'Emergency' },
    ];

    taskStateOptions: { label: string; value: NursingAssignmentFilter['taskState'] }[] = [
        { label: 'All Tasks', value: null },
        { label: 'Overdue', value: 'Overdue' },
        { label: 'Due Soon', value: 'DueSoon' },
    ];

    constructor(
        private nursingSrv: NursingService,
        private router: Router,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
    ) { }

    ngOnInit(): void {
        this.load();
    }

    get wardOptions(): { label: string; value: string | null }[] {
        const wards = Array.from(new Map(this.patients.map(p => [p.wardId, p.wardName])).entries());
        return [{ label: 'All Wards', value: null }, ...wards.map(([id, name]) => ({ label: name, value: id }))];
    }

    get filteredPatients(): NursingPatient[] {
        let list = this.patients;
        if (this.filter.wardId) list = list.filter(p => p.wardId === this.filter.wardId);
        if (this.filter.search) {
            const q = this.filter.search.toLowerCase();
            list = list.filter(p => p.patientName.toLowerCase().includes(q) || p.bedNumber.toLowerCase().includes(q));
        }
        if (this.filter.riskFlag === 'FallRisk') list = list.filter(p => p.risk.fallRisk);
        if (this.filter.riskFlag === 'Isolation') list = list.filter(p => p.risk.isolationRequired);
        if (this.filter.riskFlag === 'Emergency') list = list.filter(p => p.risk.isEmergency);
        if (this.filter.taskState === 'Overdue') list = list.filter(p => this.isOverdue(p.nextTaskDueAt));
        if (this.filter.taskState === 'DueSoon') list = list.filter(p => !this.isOverdue(p.nextTaskDueAt) && p.nextTaskDueAt != null);
        return list;
    }

    load(): void {
        this.error.set(null);
        this.filter.shift = this.shift;
        this.loadingSrv.setLoading('nursing-dashboard', true);

        forkJoin({
            assignments: this.nursingSrv.getAssignments(this.filter),
            stats: this.nursingSrv.getStats(this.shift),
            alerts: this.nursingSrv.getAlerts(this.shift),
        })
            .pipe(finalize(() => this.loadingSrv.setLoading('nursing-dashboard', false)))
            .subscribe({
                next: ({ assignments, stats, alerts }) => {
                    if (assignments.success) this.patients = assignments.data;
                    if (stats.success) this.stats = stats.data;
                    if (alerts.success) this.alerts = alerts.data.filter(a => !a.acknowledged);
                    this.hasLoadedOnce = true;
                },
                error: () => {
                    this.error.set('Failed to load the nursing dashboard. Please try again.');
                    this.hasLoadedOnce = true;
                },
            });
    }

    refresh(): void { this.load(); }
    onShiftChange(): void { this.load(); }
    applyFilters(): void { /* filters apply client-side against the loaded snapshot */ }
    onSearch(query: string): void { this.filter.search = query; }

    acuityTone(acuity: NursingPatient['acuity']): BadgeTone {
        switch (acuity) {
            case 'Critical': return 'danger';
            case 'High': return 'warning';
            case 'Medium': return 'primary';
            default: return 'neutral';
        }
    }

    alertIcon(type: NursingAlert['type']): string {
        switch (type) {
            case 'FallRisk': return 'shield-alert';
            case 'Isolation': return 'biohazard';
            case 'Emergency': return 'siren';
            case 'Allergy': return 'alert-triangle';
            default: return 'activity';
        }
    }

    alertBorderClass(severity: AlertSeverity): string {
        switch (severity) {
            case 'Critical': return 'border-red-300';
            case 'High': return 'border-amber-300';
            default: return 'border-gray-200';
        }
    }

    alertIconClass(severity: AlertSeverity): string {
        switch (severity) {
            case 'Critical': return 'text-red-600';
            case 'High': return 'text-amber-600';
            default: return 'text-gray-500';
        }
    }

    isOverdue(dueAt?: string | null): boolean {
        return !!dueAt && new Date(dueAt).getTime() < Date.now();
    }

    isStale(lastVitalsAt?: string | null): boolean {
        return !lastVitalsAt || (Date.now() - new Date(lastVitalsAt).getTime()) > 4 * 3_600_000;
    }

    openChart(patient: NursingPatient): void {
        this.router.navigate(['/admin/nursing/patient', patient.patientId]);
    }

    acknowledgeAlert(alert: NursingAlert): void {
        this.nursingSrv.acknowledgeAlert(alert.id).subscribe(res => {
            if (res.success) {
                this.alerts = this.alerts.filter(a => a.id !== alert.id);
                if (this.stats) this.stats.activeAlerts = Math.max(0, this.stats.activeAlerts - 1);
                this.toastSrv.success('Alert acknowledged');
            } else {
                this.toastSrv.error('Unable to acknowledge alert');
            }
        });
    }
}
