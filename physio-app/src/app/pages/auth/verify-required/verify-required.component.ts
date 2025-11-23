import { Component } from '@angular/core';
import { BooButtonAdminComponent } from "../../../components/button/boo-button-admin/boo-button-admin.component";
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'app-verify-required',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonAdminComponent
],
  templateUrl: './verify-required.component.html'
})
export class VerifyRequiredComponent {

}
