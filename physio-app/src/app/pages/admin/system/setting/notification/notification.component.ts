import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { SwitchComponent } from "../../../../../components/switch/switch.component";
import { SharedModule } from '../../../../../shared/shared-imports';

@Component({
  selector: 'setting-notification',
  standalone: true,
  imports: [
    SharedModule,
    AdminBreadcrumbComponent,
    SwitchComponent,
    BooButtonAdminComponent
],
  templateUrl: './notification.component.html'
})
export class NotificationComponent {

}
