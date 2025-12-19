import { Component } from '@angular/core';
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { AdminBookingTableCardComponent } from "../../../../../components/layout/admin/booking/booking-table-card.component";
import { dropdownAnimations } from '../../../../../shared/animations/dropdown.animation';
import { SharedModule } from '../../../../../shared/shared-imports';

@Component({
  selector: 'admin-booking-list',
  standalone: true,
  imports: [
    ButtonIconComponent,
    BooButtonAdminComponent,
    BooIconComponent,
    BooInputComponent,
    AdminBookingTableCardComponent,
    SharedModule
  ],
  templateUrl: './admin-booking-list.component.html',
  animations: [dropdownAnimations]
})
export class AdminBookingListComponent {

}
