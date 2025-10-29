import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from '../../../../../shared/shared-imports';

@Component({
  selector: 'app-scrumboard-list',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent,
    SharedModule,
    BooIconComponent
],
  templateUrl: './list.component.html'
})
export class ListScrumboardComponent {

}
