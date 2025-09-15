import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    SharedModule,
    BreadcrumbComponent
],
  template: `
    <breadcrumb title="Contact Us"></breadcrumb>
  `,
})
export class ContactComponent {
  model = { name: '', email: '', message: '' };
}
