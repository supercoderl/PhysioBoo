import { DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooIconComponent, BooInlineErrorComponent, BooInlineErrorState } from '@physioboo/ui';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../services/auth/auth.service';
import { DashboardOverviewService } from '../../../../services/admin/dashboard-overview.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { AlertItem, DashboardOverviewSnapshot } from '../../../../shared/types/dashboard-overview.types';
import { formatCompactCurrency, percentOf } from './dashboard.utils';
import { DashboardActivityPanelComponent } from './sections/activity-panel.component';
import { DashboardAlertsPanelComponent } from './sections/alerts-panel.component';
import { DashboardAppointmentsPanelComponent } from './sections/appointments-panel.component';
import { DashboardBedOccupancyPanelComponent } from './sections/bed-occupancy-panel.component';
import { DashboardKpi, DashboardKpiTileComponent } from './sections/dashboard-kpi-tile.component';
import { DashboardPatientFlowPanelComponent } from './sections/patient-flow-panel.component';
import { DashboardServiceQueuesPanelComponent, ServiceQueueLinks } from './sections/service-queues-panel.component';
import { DashboardStaffPanelComponent } from './sections/staff-panel.component';
import { DashboardTheatresPanelComponent } from './sections/theatres-panel.component';

/** Module routes the dashboard links to, each shown only when the user passes that route's guard. */
interface DashboardLinks extends ServiceQueueLinks {
    beds: string | null;
    admissions: string | null;
    bookings: string | null;
    surgery: string | null;
    cashier: string | null;
}

type LoadError = 'forbidden' | 'failed';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        BooButtonComponent,
        BooIconComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        DashboardKpiTileComponent,
        DashboardPatientFlowPanelComponent,
        DashboardAlertsPanelComponent,
        DashboardBedOccupancyPanelComponent,
        DashboardAppointmentsPanelComponent,
        DashboardActivityPanelComponent,
        DashboardTheatresPanelComponent,
        DashboardServiceQueuesPanelComponent,
        DashboardStaffPanelComponent,
    ],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly dashboardSrv = inject(DashboardOverviewService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    snapshot: DashboardOverviewSnapshot | null = null;
    kpis: DashboardKpi[] = [];
    loading = false;
    loadError: LoadError | null = null;
    /** Drives the inline error shown over stale data when a refresh fails. */
    refreshErrorState: BooInlineErrorState = 'default';
    updatedAt: Date | null = null;
    exporting = false;
    dismissingIds = new Set<string>();

    canDismiss = false;
    links: DashboardLinks = DashboardComponent.noLinks();

    readonly skeletonTiles = Array.from({ length: 6 });
    readonly today = new Date();
    // #endregion

    ngOnInit(): void {
        // Permissions arrive with the profile; links and actions follow them if they load after the page.
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));
        this.loadOverview();
    }

    loadOverview(): void {
        if (this.loading) return;
        const hadData = !!this.snapshot;
        const retryingAfterError = hadData && this.loadError === 'failed';
        this.loading = true;
        if (retryingAfterError) this.refreshErrorState = 'retrying';

        this.dashboardSrv.getOverview()
            .pipe(
                finalize(() => this.loading = false),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: res => {
                    if (!res?.success || !res.data) {
                        this.failLoad('failed', retryingAfterError);
                        return;
                    }
                    this.setSnapshot(res.data);
                    this.loadError = null;
                    this.refreshErrorState = 'default';
                    this.updatedAt = new Date();
                },
                error: (err: HttpErrorResponse) => this.failLoad(err?.status === 403 ? 'forbidden' : 'failed', retryingAfterError),
            });
    }

    exportReport(): void {
        if (this.exporting) return;
        this.exporting = true;
        const d = new Date();
        const date = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
        // Failures are reported by the global HTTP error toast.
        this.dashboardSrv.exportReport({ date })
            .pipe(finalize(() => this.exporting = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => this.toastSrv.success(`Saved dashboard-${date}.csv`, 'Report exported'),
                error: () => undefined,
            });
    }

    confirmDismiss(alert: AlertItem): void {
        this.dialogSrv.confirm(
            `Acknowledge this ${alert.severity} alert from ${alert.department}? It will be marked as handled in that module and removed from the dashboard.`,
            () => this.dismissAlert(alert),
            'Acknowledge alert',
            alert.severity === 'critical' ? 'danger' : 'warning',
            'Acknowledge',
        );
    }

    // #region Helpers
    private dismissAlert(alert: AlertItem): void {
        if (this.dismissingIds.has(alert.id)) return;
        this.dismissingIds = new Set(this.dismissingIds).add(alert.id);

        this.dashboardSrv.dismissAlert(alert.id)
            .pipe(
                finalize(() => {
                    const next = new Set(this.dismissingIds);
                    next.delete(alert.id);
                    this.dismissingIds = next;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: () => {
                    this.removeAlert(alert);
                    this.toastSrv.success(`${alert.department} alert acknowledged.`);
                },
                // The global HTTP error toast explains the failure; the alert stays in the list.
                error: () => undefined,
            });
    }

    private removeAlert(alert: AlertItem): void {
        const s = this.snapshot;
        if (!s) return;
        const alerts = { ...s.alerts, [alert.severity]: s.alerts[alert.severity].filter(a => a.id !== alert.id) };
        this.setSnapshot({
            ...s,
            alerts,
            status: { ...s.status, criticalAlertCount: alerts.critical.length, warningAlertCount: alerts.warning.length },
        });
    }

    private failLoad(kind: LoadError, wasRetrying: boolean): void {
        this.loadError = kind;
        this.refreshErrorState = wasRetrying ? 'failed' : 'default';
    }

    /** Arrays can be missing on a partial payload; normalise once so the sections never see undefined. */
    private setSnapshot(data: DashboardOverviewSnapshot): void {
        const alerts = data.alerts ?? { critical: [], warning: [], info: [] };
        this.snapshot = {
            ...data,
            departmentLoad: data.departmentLoad ?? [],
            bedCapacity: data.bedCapacity ?? [],
            activeOperations: data.activeOperations ?? [],
            recentEvents: data.recentEvents ?? [],
            alerts: { critical: alerts.critical ?? [], warning: alerts.warning ?? [], info: alerts.info ?? [] },
            patientFlow: { ...data.patientFlow, hourly: data.patientFlow?.hourly ?? [] },
            appointmentFlow: { ...data.appointmentFlow, hourly: data.appointmentFlow?.hourly ?? [] },
        };
        this.kpis = this.buildKpis(this.snapshot);
    }

    private buildKpis(s: DashboardOverviewSnapshot): DashboardKpi[] {
        const occupied = s.bedCapacity.reduce((sum, w) => sum + w.occupied, 0);
        const beds = s.bedCapacity.reduce((sum, w) => sum + w.total, 0);
        const occupancy = percentOf(occupied, beds);
        const critical = s.alerts.critical.length;
        const warning = s.alerts.warning.length;
        const flow = s.patientFlow;
        const appts = s.appointmentFlow;
        const revenue = s.financial?.revenue;

        return [
            {
                key: 'beds', label: 'Bed occupancy', icon: 'bed',
                value: occupancy === null ? '—' : `${occupancy}%`,
                detail: beds > 0 ? `${occupied} of ${beds} beds occupied` : 'No beds configured',
                link: this.links.beds,
            },
            {
                key: 'admissions', label: 'Admissions today', icon: 'user-plus',
                value: `${flow.admissionsToday ?? 0}`,
                detail: 'Inpatient admissions since midnight',
                trend: { pct: flow.admissionsTrendPct ?? 0, label: 'vs yesterday' },
                link: this.links.admissions,
            },
            {
                key: 'discharges', label: 'Discharges today', icon: 'door-open',
                value: `${flow.dischargesToday ?? 0}`,
                detail: `${flow.dischargesPending ?? 0} more due by end of day`,
                link: this.links.admissions,
            },
            {
                key: 'appointments', label: 'Appointments today', icon: 'calendar-check',
                value: `${appts.scheduled ?? 0}`,
                detail: `${appts.confirmed ?? 0} confirmed · ${appts.noShows ?? 0} no-shows`,
                link: this.links.bookings,
            },
            {
                key: 'revenue', label: 'Revenue today', icon: 'wallet',
                value: formatCompactCurrency(revenue?.today),
                detail: `Net payments · 28-day benchmark ${formatCompactCurrency(revenue?.target)}/day`,
                trend: revenue ? { pct: revenue.changePct, label: 'vs yesterday' } : null,
                link: this.links.cashier,
            },
            {
                key: 'alerts', label: 'Critical alerts', icon: 'siren',
                value: `${critical}`,
                detail: `${warning} warning${warning === 1 ? '' : 's'} also open`,
                tone: critical > 0 ? 'attention' : 'default',
            },
        ];
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        const link = (code: string, url: string) => can(code) ? url : null;

        this.canDismiss = can(Permissions.Dashboard.AlertDismiss);
        this.links = {
            beds: link(Permissions.Inpatient.BedRead, '/admin/inpatient/bed-map'),
            admissions: link(Permissions.Inpatient.AdmissionRead, '/admin/inpatient/admission'),
            bookings: link(Permissions.Reception.BookingRead, '/admin/reception/booking'),
            surgery: link(Permissions.Surgery.SurgeryRead, '/admin/paraclinical/surgery'),
            cashier: link(Permissions.Billing.BillRead, '/admin/finance/cashier'),
            laboratory: link(Permissions.Lab.LabOrderRead, '/admin/paraclinical/laboratory'),
            radiology: link(Permissions.Imaging.ImagingOrderRead, '/admin/paraclinical/radiology'),
            pharmacy: link(Permissions.Pharmacy.MedicineInventoryRead, '/admin/pharmacy/inventory-management'),
            insurance: link(Permissions.Admin.InsuranceCompanyRead, '/admin/finance/insurance'),
        };
        if (this.snapshot) this.kpis = this.buildKpis(this.snapshot);
    }

    private static noLinks(): DashboardLinks {
        return { beds: null, admissions: null, bookings: null, surgery: null, cashier: null, laboratory: null, radiology: null, pharmacy: null, insurance: null };
    }
    // #endregion
}
