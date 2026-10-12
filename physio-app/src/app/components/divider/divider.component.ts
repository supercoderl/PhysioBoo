import { Component, Input } from '@angular/core';
import { SharedModule } from '../../shared/shared-imports';

@Component({
  selector: 'divider',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <hr 
      class="m-0 border-b border-solid border-[#EFE3E7]" 
      [ngClass]="classname"
    />`
})
export class DividerComponent {
  // #region Inputs, Outputs, Properties
  @Input() classname: string = '';
  // #endregion 
}
