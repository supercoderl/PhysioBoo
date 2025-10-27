import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-textarea',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './boo-textarea.component.html',
  styleUrl: './boo-textarea.component.scss'
})
export class BooTextareaComponent {
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() model: string = '';
  @Input() rows: number = 10;
  @Input() cols: number = 40;
  @Input() maxlength: number = 2000;
}
