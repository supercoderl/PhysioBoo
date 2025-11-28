import { Component } from '@angular/core';
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [
    SharedModule,
    BooInputComponent,
    BooButtonComponent,
    BooIconComponent
],
  templateUrl: './forgot.component.html'
})
export class ForgotComponent {

}
