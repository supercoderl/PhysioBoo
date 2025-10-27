import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../breadcrumb/admin-breadcrumb.component";

@Component({
  selector: 'admin-content-header',
  standalone: true,
  imports: [AdminBreadcrumbComponent],
  templateUrl: './content-header.component.html'
})
export class AdminContentHeaderComponent {

}
