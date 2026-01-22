import { Component } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { AdminBookingTableCardComponent } from "../../../../../components/layout/admin/booking/booking-table-card.component";

@Component({
    selector: 'common-category-medical-specialty-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        BooButtonAdminComponent,
        BooIconComponent,
        ButtonIconComponent,
        BooInputComponent,
        AdminBookingTableCardComponent
    ],
    templateUrl: `./list.component.html`
})

export class CommonCategoryMedicalSpecialtyListComponent {

}