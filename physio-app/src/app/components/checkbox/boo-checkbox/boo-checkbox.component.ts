import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-checkbox',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './boo-checkbox.component.html',
  styleUrl: './boo-checkbox.component.scss'
})
export class BooCheckboxComponent {

}
