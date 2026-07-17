import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { AdminDashboardStatusStripComponent } from "../../../../components/layout/admin/dashboard/status-strip.component";
import { AdminPatientFlowCardComponent } from "../../../../components/layout/admin/dashboard/patient-flow-card.component";
import { AdminDeptLoadCardComponent } from "../../../../components/layout/admin/dashboard/dept-load-card.component";
import { AdminAlertsCardComponent } from "../../../../components/layout/admin/dashboard/alerts-card.component";
import { AdminBedCapacityCardComponent } from "../../../../components/layout/admin/dashboard/bed-capacity-card.component";
import { AdminActiveOperationsCardComponent } from "../../../../components/layout/admin/dashboard/active-operations-card.component";
import { AdminFinancialClinicalStripComponent } from "../../../../components/layout/admin/dashboard/financial-clinical-strip.component";
import { AdminAppointmentFlowCardComponent } from "../../../../components/layout/admin/dashboard/appointment-flow-card.component";
import { AdminStaffDutyCardComponent } from "../../../../components/layout/admin/dashboard/staff-duty-card.component";
import { AdminRecentEventsCardComponent } from "../../../../components/layout/admin/dashboard/recent-events-card.component";
import { DashboardOverviewService } from '../../../../services/admin/dashboard-overview.service';
import { AlertSeverity, DashboardOverviewSnapshot } from '../../../../shared/types/dashboard-overview.types';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonAdminComponent,
    AdminDashboardStatusStripComponent,
    AdminPatientFlowCardComponent,
    AdminDeptLoadCardComponent,
    AdminAlertsCardComponent,
    AdminBedCapacityCardComponent,
    AdminActiveOperationsCardComponent,
    AdminFinancialClinicalStripComponent,
    AdminAppointmentFlowCardComponent,
    AdminStaffDutyCardComponent,
    AdminRecentEventsCardComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  snapshot: DashboardOverviewSnapshot | null = null;
  loading = false;
  error = false;
  today = new Date();
  // #endregion

  constructor(private readonly dashboardOverviewService: DashboardOverviewService) { }

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading = true;
    this.error = false;

    this.dashboardOverviewService.getOverview()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => this.snapshot = res.data,
        error: () => this.error = true
      });
  }

  onDismissAlert(event: { alertId: string; severity: AlertSeverity }): void {
    this.dashboardOverviewService.dismissAlert(event.alertId).subscribe();
  }

  onExport(): void {
    this.dashboardOverviewService.exportReport({
      date: this.today.toISOString().slice(0, 10),
      format: 'pdf'
    }).subscribe();
  }
}
