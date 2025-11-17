import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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
  // #region Inputs, Outputs, Properties
  @Input() label: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
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
  @ViewChild('inputElement') inputElement!: ElementRef;
  // #endregion

  // #region Events
  focusInput(): void {
    this.inputElement.nativeElement.focus();
  }
  // #endregion
}
