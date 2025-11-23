import { Component, ContentChild, EventEmitter, Input, Output } from '@angular/core';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-form',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <form 
      [class]="formClass"
      (ngSubmit)="onSubmit()"
      #form="ngForm"
    >
      <ng-content></ng-content>
      
      <div class="form-actions" *ngIf="showActions">
        <button 
          type="submit" 
          [disabled]="isSubmitDisabled()"
          [class]="submitButtonClass"
        >
          {{ submitButtonText }}
        </button>
        
        <button 
          type="button" 
          (click)="onReset()"
          [class]="resetButtonClass"
          *ngIf="showResetButton"
        >
          {{ resetButtonText }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    form {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    button {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    button[type="submit"] {
      background-color: #4CAF50;
      color: white;
    }

    button[type="submit"]:hover:not(:disabled) {
      background-color: #45a049;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    button[type="submit"]:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
      transform: none;
    }

    button[type="button"] {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
    }

    button[type="button"]:hover {
      background-color: #e0e0e0;
    }
  `]
})
export class FormWrapperComponent {
  @Input() submitButtonText: string = 'Submit';
  @Input() resetButtonText: string = 'Reset';
  @Input() showActions: boolean = true;
  @Input() showResetButton: boolean = true;
  @Input() disableSubmitWhenInvalid: boolean = true;
  @Input() formClass: string = '';
  @Input() submitButtonClass: string = '';
  @Input() resetButtonClass: string = '';
  
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formReset = new EventEmitter<void>();
  
  @ContentChild(NgForm) ngForm?: NgForm;
  @ContentChild(FormGroupDirective) formGroupDirective?: FormGroupDirective;

  onSubmit(): void {
    const formValue = this.getFormValue();
    
    if (this.isFormValid()) {
      this.formSubmit.emit(formValue);
    } else {
      this.markFormAsTouched();
    }
  }

  onReset(): void {
    if (this.ngForm) {
      this.ngForm.resetForm();
    } else if (this.formGroupDirective) {
      this.formGroupDirective.form.reset();
    }
    this.formReset.emit();
  }

  isSubmitDisabled(): boolean {
    if (!this.disableSubmitWhenInvalid) {
      return false;
    }
    return !this.isFormValid();
  }

  private isFormValid(): boolean {
    if (this.ngForm) {
      return this.ngForm.valid || false;
    } else if (this.formGroupDirective) {
      return this.formGroupDirective.form.valid;
    }
    return true;
  }

  private getFormValue(): any {
    if (this.ngForm) {
      return this.ngForm.value;
    } else if (this.formGroupDirective) {
      return this.formGroupDirective.form.value;
    }
    return null;
  }

  private markFormAsTouched(): void {
    if (this.ngForm) {
      Object.keys(this.ngForm.controls).forEach(key => {
        this.ngForm?.controls[key].markAsTouched();
      });
    } else if (this.formGroupDirective) {
      this.formGroupDirective.form.markAllAsTouched();
    }
  }
}
