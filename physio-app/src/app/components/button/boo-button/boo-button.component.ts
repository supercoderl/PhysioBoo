import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { LoadingSpinnerComponent } from "../../loading/spinner/spinner.component";

@Component({
  selector: 'button[boo-button], a[boo-button]',
  standalone: true,
  imports: [
    SharedModule,
    LoadingSpinnerComponent
  ],
  template: `
    <span *ngIf="label" [class]="labelClass">{{ label }}</span>
    <ng-content *ngIf="!label"></ng-content>
    <loading-spinner
      [size]="20"
      *ngIf="loading"
      class="ml-2" 
    ></loading-spinner>
  `,
  host: {
    '[type]': 'type',
    '[disabled]': 'disabled || loading',
    '[style.border-radius.px]': 'radius',
    '[style.background]': 'background',
    '[class]': 'combinedClasses'
  }
})
export class BooButtonComponent {
  // #region Inputs, Outputs, Properties
  @Input() label: string = '';
  @Input() labelClass: string = '';
  @Input() type: string = 'submit';
  @Input() disabled: boolean = false;
  @Input() radius: number = 0;
  @Input() background: string = 'linear-gradient(90.08deg,#0e82fd 0.09%,#06aed4 70.28%)';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() classname: string = '';
  @Input() loading: boolean | null = false;

  get combinedClasses(): string {
    const base = 'relative text-white border-0 overflow-hidden z-[1] cursor-pointer transition-smooth inline-flex items-center justify-center';

    let sizeClass = '';
    switch (this.size) {
      case 'small':
        sizeClass = 'py-[0.315rem] px-4 text-[0.75rem] w-32';
        break;
      case 'medium':
        sizeClass = 'py-[0.425rem] px-6.25 text-[0.813rem] w-37.5';
        break;
      case 'large':
        sizeClass = 'py-[0.6rem] px-8 text-[0.875rem] w-44';
        break;
    }

    const loadingClass = this.loading ? 'cursor-wait opacity-80' : '';

    return `${base} ${sizeClass} ${loadingClass} ${this.classname}`;
  }
  // #endregion
}
