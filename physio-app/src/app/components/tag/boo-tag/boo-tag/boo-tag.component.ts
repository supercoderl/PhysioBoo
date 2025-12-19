import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'boo-tag',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <span 
      class="align-middle text-[12px] font-medium py-1 px-2 rounded-[5px]"
      [style.color]="color"
      [style.backgroundColor]="backgroundColor"
    >
      <ng-template></ng-template>
    </span>
  `,
})
export class BooTagComponent {
  // #region Inputs, Outputs, Properties
  @Input() color: string = '';
  @Input() backgroundColor: string = '';
  // #endregion
}
