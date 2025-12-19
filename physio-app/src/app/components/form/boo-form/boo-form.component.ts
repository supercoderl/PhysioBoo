import { Component, EventEmitter, HostListener, Input, Optional, Output, Self } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'form[boo-form]',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <ng-content></ng-content>
    <div class="flex gap-3 mt-6 pt-5 border-t border-gray-200" *ngIf="showActions">   
      <button 
        type="submit"
        [disabled]="disableSubmitWhenInvalid && (formDir ? formDir.invalid : false)"
        [class]="submitButtonClass || 'px-6 py-2.5 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:bg-gray-300 transition-all shadow-sm'"
      >
        {{ submitButtonText }}
      </button>
      
      <button 
        *ngIf="showResetButton"
        type="button" 
        (click)="onReset()"
        [class]="resetButtonClass || 'px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 border border-gray-300 transition-all'"
      >
        {{ resetButtonText }}
      </button>
    </div>
  `,
  host: {
    '[class]': 'formClass',
    '[class.w-full]': 'true'
  },
})
export class FormWrapperComponent {
  // #region Inputs, Outputs, Properties
  @Input() formClass: string = '';
  @Input() showActions: boolean = false;
  @Input() showResetButton: boolean = true;
  @Input() disableSubmitWhenInvalid: boolean = false;
  @Input() submitButtonText: string = 'Lưu lại';
  @Input() resetButtonText: string = 'Nhập lại';
  @Input() submitButtonClass: string = '';
  @Input() resetButtonClass: string = '';

  @Output() validSubmit = new EventEmitter<any>();
  @Output() formReset = new EventEmitter<void>();
  // #endregion

  // #region Init (Lifecycles + Setup)
  constructor(
    @Optional() @Self() public formDir: FormGroupDirective
  ) { }
  // #endregion

  // #region Methods
  @HostListener('submit', ['$event'])
  onFormSubmit(event: Event) {
    if (!this.formDir) return; // Safety check

    const formGroup = this.formDir.form;

    if (formGroup.invalid) {
      event.preventDefault();
      formGroup.markAllAsTouched();
      return;
    }

    this.validSubmit.emit(formGroup.value);
  }

  onReset() {
    if (this.formDir) {
      this.formDir.resetForm();
    }
    this.formReset.emit();
  }
  // #endregion
}
