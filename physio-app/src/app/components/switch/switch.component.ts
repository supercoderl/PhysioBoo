import { Component, Input } from '@angular/core';
import { SharedModule } from '../../shared/shared-imports';

@Component({
  selector: 'switch',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './switch.component.html'
})
export class SwitchComponent {
  @Input() isOpen: boolean = false;

  handleSwitch() {
    this.isOpen = !this.isOpen;
  }
}
