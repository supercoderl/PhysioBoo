import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputV2Component } from "../../../../../components/input/boo-input-v2/boo-input-v2.component";
import { SharedModule } from '../../../../../shared/shared-imports';

@Component({
  selector: 'setting-billing',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent, 
    BooIconComponent, 
    BooInputV2Component, 
    BooButtonAdminComponent,
    SharedModule
  ],
  templateUrl: './billing.component.html'
})
export class BillingComponent {

}
