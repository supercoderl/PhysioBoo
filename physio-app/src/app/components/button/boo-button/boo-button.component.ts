import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { LoadingSpinnerComponent } from "../../loading/spinner/spinner.component";

@Component({
  selector: 'boo-button',
  standalone: true,
  imports: [
    SharedModule,
    LoadingSpinnerComponent
],
  templateUrl: './boo-button.component.html'
})
export class BooButtonComponent {
  @Input() label: string = '';
  @Input() type: string = 'submit';
  @Input() disabled: boolean = false;
  @Input() radius: number = 0;
  @Input() background: string = 'linear-gradient(90.08deg,#0e82fd 0.09%,#06aed4 70.28%)';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() classname: string = '';
  @Input() loading: boolean | null = false;
  @Input() onClick: (event?: MouseEvent) => void = () => {};
}
