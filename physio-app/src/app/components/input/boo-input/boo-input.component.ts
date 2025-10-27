import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-input',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './boo-input.component.html'
})
export class BooInputComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() type: string = 'text';
  @Input() model: string = '';
  @Input() radius: number = 0;
  @Input() size: "small" | "medium" | "large" = "medium";
  @Input() class: string = '';
  @Input() backgroundColor: string = '#F0F5FF';
  @Input() borderWidth: number = 0;
  @Input() borderColor: string = '#fff';
  @Input() placeholderColor: string = '#1d3349';
}
