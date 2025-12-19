import { Component } from '@angular/core';
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { AdminAnalyticCardComponent } from "../../../../components/layout/admin/dashboard/analytic-card.component";
import { AdminAppointmentTableCardComponent } from "../../../../components/layout/admin/dashboard/appointment-table-card.component";
import { AdminCategoryCardComponent } from "../../../../components/layout/admin/dashboard/category-card.component";
import { AdminDoctorTableCardComponent } from '../../../../components/layout/admin/dashboard/doctor-card.component';
import { AdminPatientReportTableCardComponent } from "../../../../components/layout/admin/dashboard/patient-report-card.component";
import { AdminPatientVisitTableCardComponent } from "../../../../components/layout/admin/dashboard/patient-visit-card.component";
import { AdminStatisticCardComponent } from "../../../../components/layout/admin/dashboard/statistic-card.component";
import { MEDICAL_CATEGORIES } from '../../../../shared/data/dummy';
import { SharedModule } from '../../../../shared/shared-imports';
import { AnalyticItem, AnalyticKey } from '../../../../shared/types/dashboard';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent,
    AdminAnalyticCardComponent,
    AdminAppointmentTableCardComponent,
    AdminStatisticCardComponent,
    AdminCategoryCardComponent,
    AdminPatientReportTableCardComponent,
    AdminPatientVisitTableCardComponent,
    AdminDoctorTableCardComponent
],
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent {
  // #region Inputs, Outputs, Properties
  medicalCategories = MEDICAL_CATEGORIES;
  analyticObjects = {
    "patients": {
      icon: "user",
      color: "rgb(31, 109, 178)",
      current: 108,
      percent: "+20%",
      trend: [3, 5, 6, 8, 7, 10, 12, 15]
    },
    "appointments": {
      icon: "calendar",
      color: "rgb(230, 81, 0)",
      current: 658,
      percent: "-15%",
      trend: [50, 58, 55, 60, 48, 70, 65]
    },
    "doctors": {
      icon: "stethoscope",
      color: "rgb(106, 27, 154)",
      current: 565,
      percent: "+18%",
      trend: [20, 25, 28, 29, 35, 30, 32]
    },
    "transactions": {
      icon: "handbag",
      color: "rgb(204, 37, 176)",
      current: 5523.56,
      percent: "+12%",
      trend: [100, 110, 105, 140, 135, 160, 155]
    }
  }

  get analyticTitles() {
    return Object.keys(this.analyticObjects);
  }

  analyticsProperties(title: string): AnalyticItem {
    return this.analyticObjects[title as AnalyticKey];
  }
  // #endregion
}
