import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  BooButtonComponent, BooBadgeTone, BooCheckboxComponent, BooEmptyStateComponent, BooErrorStateComponent,
  BooIconComponent, BooInlineErrorComponent, BooInlineErrorState, BooSearchFieldComponent, BooStatusBadgeComponent
} from '@physioboo/ui';
import { Observable, Subscription, catchError, finalize, forkJoin, map, of } from 'rxjs';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { AdmissionService } from '../../../../services/admin/admission.service';
import { NursingService } from '../../../../services/admin/nursing.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import {
  AcuityLevel, AlertSeverity, NursingAlert, NursingPatient, NursingStats, ShiftCode, ShiftHandoverCard
} from '../../../../shared/types/nursing.types';
import { DashboardKpi, DashboardKpiTileComponent } from '../../overview/dashboard/sections/dashboard-kpi-tile.component';
import { DashboardPanelComponent } from '../../overview/dashboard/sections/dashboard-panel.component';

type LoadError = 'forbidden' | 'failed';
type RiskFilter = 'FallRisk' | 'Isolation' | 'Emergency' | null;
type TaskFilter = 'Overdue' | null;

/** One dashboard source: a failed request keeps the previously loaded data of that source. */
type SourceResult<T> = { ok: true; data: T } | { ok: false; status: number };

interface WardSummary {
  id: string;
  name: string;
  patients: number;
  medicationsDue: number;
}

interface NursingLinks {
  handover: string;
  beds: string | null;
  treatmentSheet: string | null;
}

@Component({
  selector: 'admin-nursing-dashboard',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, FormsModule, RouterLink,
    BooButtonComponent, BooIconComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent,
    BooStatusBadgeComponent, BooSearchFieldComponent, BooCheckboxComponent, BooSelectComponent,
    DashboardKpiTileComponent, DashboardPanelComponent,
  ],
  templateUrl: './nursing-dashboard.component.html',
})
export class AdminNursingDashboardComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  private readonly nursingSrv = inject(NursingService);
  private readonly admissionSrv = inject(AdmissionService);
  private readonly authSrv = inject(AuthService);
  private readonly dialogSrv = inject(DialogService);
  private readonly toastSrv = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private loadSub?: Subscription;

  shift: ShiftCode = 'Day';
  patients: NursingPatient[] = [];
  stats: NursingStats | null = null;
  alerts: NursingAlert[] = [];
  /** Cards handed over to the selected shift; null until the handover source has loaded once. */
  handoverCards: ShiftHandoverCard[] | null = null;

  loading = false;
  /** Set once any source has loaded for the selected shift; until then the skeleton or a blocking error shows. */
  loaded = false;
  loadError: LoadError | null = null;
  /** A refresh failed in whole or part while older figures are still on screen. */
  refreshFailed = false;
  refreshErrorState: BooInlineErrorState = 'default';
  updatedAt: Date | null = null;
  /** Clock the due times are compared against; fixed at load so tiles and rows agree. */
  private loadedAt = Date.now();

  wardId: string | null = null;
  riskFilter: RiskFilter = null;
  taskFilter: TaskFilter = null;
  search = '';

  canAcknowledge = false;
  canAssign = false;
  links: NursingLinks = { handover: '/admin/nursing/handover', beds: null, treatmentSheet: null };
  acknowledgingIds = new Set<string>();

  assignOpen = false;
  assigning = false;
  loadingAdmissions = false;
  admissionOptions: { label: string; value: string }[] = [];
  assignForm: { admissionId: string | null; acuity: AcuityLevel; fallRisk: boolean } = { admissionId: null, acuity: 'Medium', fallRisk: false };

  readonly skeletonTiles = Array.from({ length: 5 });
  readonly skeletonRows = Array.from({ length: 4 });
  readonly shiftOptions: { label: string; value: ShiftCode }[] = [
    { label: 'Day shift', value: 'Day' },
    { label: 'Evening shift', value: 'Evening' },
    { label: 'Night shift', value: 'Night' },
  ];
  readonly riskOptions: { label: string; value: RiskFilter }[] = [
    { label: 'All risk flags', value: null },
    { label: 'Fall risk', value: 'FallRisk' },
    { label: 'Isolation', value: 'Isolation' },
    { label: 'Emergency', value: 'Emergency' },
  ];
  readonly taskOptions: { label: string; value: TaskFilter }[] = [
    { label: 'All tasks', value: null },
    { label: 'Overdue next task', value: 'Overdue' },
  ];
  readonly acuityOptions: { label: string; value: AcuityLevel }[] = [
    { label: 'Low', value: 'Low' }, { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' }, { label: 'Critical', value: 'Critical' },
  ];
  // #endregion

  ngOnInit(): void {
    // Permissions arrive with the profile; actions and links follow them if they load after the page.
    this.authSrv.permissions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(perms => this.applyPermissions(perms ?? []));
    this.load();
  }

  // #region Derived data
  get kpis(): DashboardKpi[] {
    const s = this.stats;
    const pendingHandover = this.pendingHandovers.length;
    return [
      { key: 'patients', label: 'Assigned patients', icon: 'users', value: s ? `${s.assignedPatients}` : '—', detail: `${this.shift} shift` },
      { key: 'tasks', label: 'Open tasks', icon: 'clipboard-list', value: s ? `${s.openTasks}` : '—', detail: 'Pending nursing tasks' },
      {
        key: 'overdue', label: 'Overdue tasks', icon: 'alarm-clock', value: s ? `${s.overdueTasks}` : '—',
        detail: 'Pending past their due time', tone: s && s.overdueTasks > 0 ? 'attention' : 'default',
      },
      {
        key: 'alerts', label: 'Open alerts', icon: 'bell', value: s ? `${s.activeAlerts}` : '—',
        detail: 'Not yet acknowledged', tone: s && s.activeAlerts > 0 ? 'attention' : 'default',
      },
      {
        key: 'handover', label: 'Handover to acknowledge', icon: 'users', value: this.handoverCards ? `${pendingHandover}` : '—',
        detail: this.handoverCards ? `${this.handoverCards.length} card${this.handoverCards.length === 1 ? '' : 's'} for this shift` : 'Unavailable',
        link: this.links.handover,
      },
    ];
  }

  get pendingHandovers(): ShiftHandoverCard[] {
    return (this.handoverCards ?? []).filter(c => !c.acknowledged);
  }

  get wards(): WardSummary[] {
    const byWard = new Map<string, WardSummary>();
    for (const p of this.patients) {
      const ward = byWard.get(p.wardId) ?? { id: p.wardId, name: p.wardName, patients: 0, medicationsDue: 0 };
      ward.patients += 1;
      ward.medicationsDue += p.marDueCount;
      byWard.set(p.wardId, ward);
    }
    return Array.from(byWard.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  get wardOptions(): { label: string; value: string | null }[] {
    return [{ label: 'All wards', value: null }, ...this.wards.map(w => ({ label: w.name, value: w.id }))];
  }

  get filteredPatients(): NursingPatient[] {
    const q = this.search.trim().toLowerCase();
    return this.patients.filter(p =>
      (!this.wardId || p.wardId === this.wardId)
      && (!q || p.patientName.toLowerCase().includes(q) || p.bedNumber.toLowerCase().includes(q) || p.patientNumber.toLowerCase().includes(q))
      && (this.riskFilter !== 'FallRisk' || p.risk.fallRisk)
      && (this.riskFilter !== 'Isolation' || p.risk.isolationRequired)
      && (this.riskFilter !== 'Emergency' || p.risk.isEmergency)
      && (this.taskFilter !== 'Overdue' || this.isOverdue(p.nextTaskDueAt))
    );
  }

  get hasFilters(): boolean {
    return !!(this.wardId || this.riskFilter || this.taskFilter || this.search.trim());
  }
  // #endregion

  // #region Loading
  load(): void {
    this.loadSub?.unsubscribe();
    const retryingAfterError = this.loaded && this.refreshFailed;
    this.loading = true;
    if (retryingAfterError) this.refreshErrorState = 'retrying';

    const shift = this.shift;
    this.loadSub = forkJoin({
      assignments: this.source(this.nursingSrv.getAssignments({ shift }).pipe(map(r => r.data))),
      stats: this.source(this.nursingSrv.getStats(shift).pipe(map(r => r.data))),
      alerts: this.source(this.nursingSrv.getAlerts(shift).pipe(map(r => r.data))),
      handover: this.source(this.nursingSrv.getHandoverCards(this.previousShift(shift), null, true).pipe(map(r => r.data))),
    })
      .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
      .subscribe(({ assignments, stats, alerts, handover }) => {
        const results = [assignments, stats, alerts, handover];
        const failures = results.filter((r): r is { ok: false; status: number } => !r.ok);

        if (assignments.ok) this.patients = assignments.data ?? [];
        if (stats.ok) this.stats = stats.data ?? null;
        if (alerts.ok) this.alerts = (alerts.data ?? []).filter(a => !a.acknowledged);
        if (handover.ok) this.handoverCards = (handover.data ?? []).filter(c => c.incomingShift === shift);

        if (failures.length < results.length) {
          this.loaded = true;
          this.loadError = null;
          this.updatedAt = new Date();
          this.loadedAt = Date.now();
        } else if (!this.loaded) {
          this.loadError = failures.every(f => f.status === 403) ? 'forbidden' : 'failed';
        }
        this.refreshFailed = this.loaded && failures.length > 0;
        this.refreshErrorState = this.refreshFailed && retryingAfterError ? 'failed' : 'default';
      });
  }

  onShiftChange(shift: ShiftCode): void {
    if (shift === this.shift) return;
    this.shift = shift;
    // Another shift's figures would be misleading under the new heading, so start from scratch.
    this.patients = [];
    this.stats = null;
    this.alerts = [];
    this.handoverCards = null;
    this.loaded = false;
    this.loadError = null;
    this.refreshFailed = false;
    this.wardId = null;
    this.load();
  }

  private source<T>(request: Observable<T>): Observable<SourceResult<T>> {
    return request.pipe(
      map(data => ({ ok: true, data }) as SourceResult<T>),
      catchError((err: HttpErrorResponse) => of<SourceResult<T>>({ ok: false, status: err?.status ?? 0 }))
    );
  }

  private previousShift(shift: ShiftCode): ShiftCode {
    return shift === 'Day' ? 'Night' : shift === 'Evening' ? 'Day' : 'Evening';
  }
  // #endregion

  // #region Filters
  clearFilters(): void {
    this.wardId = null;
    this.riskFilter = null;
    this.taskFilter = null;
    this.search = '';
  }

  filterByWard(wardId: string): void {
    this.wardId = this.wardId === wardId ? null : wardId;
  }
  // #endregion

  // #region Alerts
  confirmAcknowledge(alert: NursingAlert): void {
    this.dialogSrv.confirm(
      `Acknowledge this alert for ${alert.patientName} (bed ${alert.bedNumber})? It will be marked as handled and removed from the list.`,
      () => this.acknowledge(alert),
      'Acknowledge alert',
      alert.severity === 'Critical' ? 'danger' : 'warning',
      'Acknowledge',
    );
  }

  private acknowledge(alert: NursingAlert): void {
    if (this.acknowledgingIds.has(alert.id)) return;
    this.acknowledgingIds = new Set(this.acknowledgingIds).add(alert.id);

    this.nursingSrv.acknowledgeAlert(alert.id)
      .pipe(
        finalize(() => {
          const next = new Set(this.acknowledgingIds);
          next.delete(alert.id);
          this.acknowledgingIds = next;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: res => {
          if (!res.success) { this.toastSrv.error('Unable to acknowledge the alert'); return; }
          this.alerts = this.alerts.filter(a => a.id !== alert.id);
          if (this.stats) this.stats = { ...this.stats, activeAlerts: Math.max(0, this.stats.activeAlerts - 1) };
          this.toastSrv.success('Alert acknowledged');
        },
        error: () => this.toastSrv.error('Unable to acknowledge the alert'),
      });
  }
  // #endregion

  // #region Assignment
  toggleAssign(): void {
    this.assignOpen = !this.assignOpen;
    if (!this.assignOpen || this.admissionOptions.length || this.loadingAdmissions) return;
    this.loadingAdmissions = true;
    this.admissionSrv.search({
      pageNumber: 1, pageSize: 200, search: '', sort: '-admittedAt',
      filter: { start: null, end: null, status: 'Admitted', type: null, departmentId: null }
    })
      .pipe(finalize(() => this.loadingAdmissions = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (res.success) this.admissionOptions = res.data.items.map(a => ({ label: `${a.patientName} · ${a.admissionNumber}`, value: a.id }));
        },
        error: () => this.toastSrv.error('Failed to load admitted patients'),
      });
  }

  assign(): void {
    if (!this.assignForm.admissionId || this.assigning) return;
    this.assigning = true;
    this.nursingSrv.createAssignment({
      admissionId: this.assignForm.admissionId,
      shift: this.shift,
      acuity: this.assignForm.acuity,
      fallRisk: this.assignForm.fallRisk,
    })
      .pipe(finalize(() => this.assigning = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success) { this.toastSrv.error('Unable to assign the patient'); return; }
          this.toastSrv.success('Patient assigned');
          this.assignForm = { admissionId: null, acuity: 'Medium', fallRisk: false };
          this.assignOpen = false;
          this.load();
        },
        error: () => this.toastSrv.error('Unable to assign the patient'),
      });
  }
  // #endregion

  // #region Helpers
  isOverdue(dueAt?: string | null): boolean {
    return !!dueAt && new Date(dueAt).getTime() < this.loadedAt;
  }

  acuityTone(acuity: AcuityLevel): BooBadgeTone {
    switch (acuity) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'primary';
      default: return 'neutral';
    }
  }

  severityTone(severity: AlertSeverity): BooBadgeTone {
    switch (severity) {
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
      case 'Allergy': return 'triangle-alert';
      default: return 'activity';
    }
  }

  trackById = (_: number, item: { id: string }) => item.id;
  trackByKey = (_: number, item: { key: string }) => item.key;

  private applyPermissions(perms: string[]): void {
    const can = (code: string) => perms.includes(code);
    this.canAcknowledge = can(Permissions.Inpatient.NursingWrite);
    this.canAssign = can(Permissions.Inpatient.NursingManage);
    this.links = {
      handover: '/admin/nursing/handover',
      beds: can(Permissions.Inpatient.BedRead) ? '/admin/inpatient/bed-map' : null,
      treatmentSheet: can(Permissions.Inpatient.TreatmentSheetRead) ? '/admin/inpatient/treatment-sheet' : null,
    };
  }
  // #endregion
}
