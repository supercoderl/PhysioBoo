import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputV2Component } from "../../../../../components/input/boo-input-v2/boo-input-v2.component";
import { SharedModule } from '../../../../../shared/shared-imports';

@Component({
  selector: 'setting-team',
  standalone: true,
  imports: [
    SharedModule,
    AdminBreadcrumbComponent,
    ButtonIconComponent,
    BooInputV2Component,
    BooIconComponent
],
  templateUrl: './team.component.html'
})
export class TeamComponent {

}
