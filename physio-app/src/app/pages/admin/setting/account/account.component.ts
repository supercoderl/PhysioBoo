import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputV2Component } from "../../../../components/input/boo-input-v2/boo-input-v2.component";
import { BooTextareaV2Component } from "../../../../components/textarea/boo-textarea-v2/boo-textarea-v2.component";

@Component({
  selector: 'setting-account',
  standalone: true,
  imports: [AdminBreadcrumbComponent, BooInputV2Component, BooIconComponent, BooTextareaV2Component, BooButtonAdminComponent],
  templateUrl: './account.component.html'
})
export class SettingAccountComponent {

}
