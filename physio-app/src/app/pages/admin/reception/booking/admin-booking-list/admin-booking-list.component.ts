import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { AdminBookingTableCardComponent } from "../../../../../components/layout/admin/booking/booking-table-card.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { AppointmentService } from '../../../../../services/admin/appointment.service';
import { DateService } from '../../../../../services/common/date.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { dropdownAnimations } from '../../../../../shared/animations/dropdown.animation';
import { SharedModule } from '../../../../../shared/shared-imports';
import { AppointmentRecord } from '../../../../../shared/types/appointment.types';
import { PaginationData } from '../../../../../shared/types/common';

@Component({
  selector: 'admin-booking-list',
  standalone: true,
  imports: [
    ButtonIconComponent,
    BooButtonAdminComponent,
    BooIconComponent,
    BooInputComponent,
    AdminBookingTableCardComponent,
    SharedModule,
    AdminContentHeaderComponent
  ],
  templateUrl: './admin-booking-list.component.html',
  animations: [dropdownAnimations]
})
export class AdminBookingListComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  tableData: PaginationData<AppointmentRecord> | null = null;
  params = {
    pageNumber: 1,
    pageSize: 5,
  };
  // #endregion

  // #region Inject Services
  constructor(
    private appointmentSrv: AppointmentService,
    private dateSrv: DateService,
    private dialogSrv: DialogService,
    private toastSrv: ToastService,
  ) { }
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngOnInit(): void {
    this.loadAppointments();
  }
  // #endregion

  // #region Methods
  loadAppointments(): void {
    this.appointmentSrv.search({
      pageNumber: this.params.pageNumber,
      pageSize: this.params.pageSize,
      filter: {
        start: this.dateSrv.format(this.dateSrv.subtract(new Date(), 7, 'day'), 'YYYY-MM-DD'),
        end: this.dateSrv.format(this.dateSrv.add(new Date(), 30, 'day'), 'YYYY-MM-DD'),
      }
    }).subscribe(res => {
      if (res.success) {
        this.tableData = res.data;
      }
    });
  }

  onPageChanged(newPage: number): void {
    this.params.pageNumber = newPage;
    this.loadAppointments();
  }

  onCheckIn(id: string): void {
    this.appointmentSrv.updateStatus(id, 'CheckedIn')
      .pipe(
        catchError(() => {
          this.toastSrv.error('Check-in failed');
          return of(null);
        })
      )
      .subscribe(res => {
        if (res === null) return;
        this.toastSrv.success('Patient checked in');
        this.loadAppointments();
      });
  }

  onCancel(id: string): void {
    this.dialogSrv.confirm(
      'Are you sure you want to cancel this appointment?',
      () => {
        this.appointmentSrv.updateStatus(id, 'Cancelled')
          .pipe(
            catchError(() => {
              this.toastSrv.error('Cancel failed');
              return of(null);
            })
          )
          .subscribe(res => {
            if (res === null) return;
            this.toastSrv.success('Appointment cancelled');
            this.loadAppointments();
          });
      },
      'Cancel Appointment'
    );
  }
  // #endregion
}
