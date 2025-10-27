import { Component } from '@angular/core';
import { AdminBreadcrumbComponent } from '../../../../components/breadcrumb/admin-breadcrumb.component';
import { BooSearchComponent } from "../../../../components/input/boo-search/boo-search.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SwitchComponent } from "../../../../components/switch/switch.component";
import { COURSES } from '../../../../shared/data/dummy';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'app-academy-list',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent,
    SharedModule,
    BooSearchComponent,
    BooSelectComponent,
    SwitchComponent
],
  templateUrl: './academy-list.component.html',
  styleUrl: './academy-list.component.scss'
})
export class AcademyListComponent {
  // #region Inputs / Outputs / Properties
  courses = COURSES;

  get types() {
    const unique = Array.from(new Set(this.courses.map(e => e.type)));
    return unique.map((type, i) => ({
      label: type,
      value: String(i + 1)
    }));
  }
  // #endregion
}
