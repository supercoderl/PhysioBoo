import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooInputComponent } from "../../../../components/input/boo-input/boo-input.component";

@Component({
  selector: 'setting-account',
  standalone: true,
  imports: [AdminBreadcrumbComponent, BooInputComponent],
  templateUrl: './account.component.html'
})
export class SettingAccountComponent {

}
