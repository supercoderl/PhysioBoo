import { Component } from '@angular/core';
import { EyeOff } from 'lucide-angular';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  readonly EyeOff = EyeOff;
}
