import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-button',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './boo-button.component.html',
  styleUrl: './boo-button.component.scss'
})
export class BooButtonComponent {
  @Input() label: string = '';
  @Input() type: string = 'submit';
  @Input() disabled: boolean = false;
  @Input() radius: number = 0;
  @Input() background: string = 'linear-gradient(90.08deg,#0e82fd 0.09%,#06aed4 70.28%)';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
