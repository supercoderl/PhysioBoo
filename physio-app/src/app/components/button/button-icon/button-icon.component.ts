import { AfterContentInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { LoadingSpinnerComponent } from "../../loading/spinner/spinner.component";

@Component({
  selector: 'button-icon',
  standalone: true,
  imports: [
    SharedModule,
    LoadingSpinnerComponent
],
  template: `
    <button
      tabindex="0"
      type="button"
      [ngClass]="{
        'border border-solid inlineFlex-center-center relative bg-transparent cursor-pointer align-middle text-center text-[#4B5563] outline-none rounded-md hover:bg-gray-200 transition-background duration-300 ease-in-out': true,
        'w-8 h-8 p-2': !hasContent,   
        'px-3 py-2 gap-2': hasContent      
      }"
      [class]="buttonClass"
      [disabled]="disabled"
      (click)="onClick.emit()"
    >
      <lucide-icon 
        *ngIf="icon && !loading"
        [name]="icon.name" 
        [size]="icon.size || 16"
        [class]="icon.class"
        [color]="icon.color || 'black'"
      ></lucide-icon>
      <loading-spinner 
        *ngIf="loading" 
        position="relative"
        strokeColor="#c3c3c3"
        mainColor="#000000"
      />
      <ng-container #contentWrapper>
        <ng-content></ng-content>
      </ng-container>
    </button>
  `
})
export class ButtonIconComponent implements AfterContentInit {
  // #region Inputs, Outputs, Properties
  hasContent = false;

  private _icon?: { name: string; size?: number; class?: string, color?: string };
  @Input() buttonClass: string = '';
  @Input() loading?: boolean = false;
  @Input() disabled?: boolean = false;
  @Output() onClick: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('contentWrapper', { static: true }) content!: ElementRef;
  @Input()
  set icon(value: { name: string; size?: number; class?: string, color?: string } | undefined) {
    if (value) {
      this._icon = {
        ...value,
        class: value.class ?? ''
      };
    } else {
      this._icon = undefined;
    }
  }

  get icon() {
    return this._icon;
  }
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngAfterContentInit() {
    const text = this.content?.nativeElement?.textContent?.trim();
    this.hasContent = !!text;
  }
  // #endregion
}
