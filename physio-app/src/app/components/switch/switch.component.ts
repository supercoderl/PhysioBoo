import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  // #region Inputs, Outputs, Properties
  @Input() isOpen: boolean | null | undefined = false;
  @Output() change = new EventEmitter<void>();
  // #endregion

  // #region Methods
  handleSwitch() {
    this.change.emit();
  }
  // #endregion
}
