import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../breadcrumb/admin-breadcrumb.component";

@Component({
  selector: 'admin-content-header',
  standalone: true,
  imports: [AdminBreadcrumbComponent],
  templateUrl: './content-header.component.html',
  host: { class: 'block h-full min-h-0' }
})
export class AdminContentHeaderComponent {

}
