import { Component } from '@angular/core';
import { EyeOff, LucideAngularModule } from 'lucide-angular';
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    LucideAngularModule,
    SharedModule,
    BooInputComponent
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly EyeOff = EyeOff;
  state: string = "email";

  onChangeState = (newState: string) => {
    this.state = newState;
  }
}
