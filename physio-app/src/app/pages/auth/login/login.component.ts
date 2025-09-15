import { Component } from '@angular/core';
import { EyeOff, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LucideAngularModule],
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
