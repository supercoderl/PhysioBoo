import { Component } from '@angular/core';
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooSearchComponent } from "../../../../../components/input/boo-search/boo-search.component";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { SharedModule } from '../../../../../shared/shared-imports';

@Component({
  selector: 'app-all',
  standalone: true,
  imports: [
    AdminContentHeaderComponent,
    SharedModule,
    ButtonIconComponent,
    BooSearchComponent,
    BooIconComponent
],
  templateUrl: './all.component.html',
  styleUrl: './all.component.scss'
})
export class AllNoteComponent {

}
