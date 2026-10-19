import { Component, ElementRef, Input, inject } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { LoadingSpinnerComponent } from "../../loading/spinner/spinner.component";

/**
 * Setting `variant` switches the button to the public-site design system (token colours, fixed heights per size,
 * single-line label). Without it the button keeps its original gradient look, which the auth pages use.
 */
export type BooButtonVariant = 'primary' | 'secondary' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link';
export type BooButtonSize = 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';

type DsSize = 'sm' | 'md' | 'lg';

// Height, padding, type size and radius per size. Heights: sm 40px, md 44px (touch target), lg 52px.
const DS_SIZE: Record<DsSize, string> = {
  sm: 'h-10 px-3.5 text-sm rounded-[10px]',
  md: 'h-11 px-4.5 text-sm rounded-[10px]',
  lg: 'h-13 px-5.5 text-[15px] rounded-xl',
};

// Icon-only buttons are square: the width matches the height.
const DS_ICON_ONLY: Record<DsSize, string> = {
  sm: 'w-10 !px-0',
  md: 'w-11 !px-0',
  lg: 'w-13 !px-0',
};

// Anchors get explicit hover text colours because the global link style recolours `a:hover`.
const DS_VARIANT: Record<BooButtonVariant, string> = {
  primary: 'border border-transparent bg-primary text-white hover:bg-primaryHover hover:text-white active:bg-primaryPressed',
  secondary: 'border border-gray-300 bg-surface text-gray-900 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900',
  outline: 'border border-primary bg-surface text-primaryDeep hover:bg-primarySoft hover:text-primaryDeep',
  soft: 'border border-primary bg-primarySoft text-primaryDeep hover:text-primaryDeep',
  subtle: 'border border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 hover:text-gray-900',
  ghost: 'border border-transparent bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900',
  link: 'border-0 !px-1.5 bg-transparent text-primaryDeep underline underline-offset-2 hover:text-primary',
};

const DS_BASE = 'relative inline-flex items-center justify-center gap-2 whitespace-nowrap max-w-full font-semibold leading-none no-underline select-none cursor-pointer transition-colors duration-150';

@Component({
  selector: 'button[boo-button], a[boo-button]',
  standalone: true,
  imports: [
    SharedModule,
    LoadingSpinnerComponent
  ],
  template: `
    <physio-icon
      *ngIf="loading && variant"
      name="loader-circle"
      [size]="dsSize === 'lg' ? 18 : 16"
      class="animate-spin flex-none"
      aria-hidden="true"
    />
    <span *ngIf="label" [class]="labelClass">{{ label }}</span>
    <ng-content *ngIf="!label"></ng-content>
    <loading-spinner
      [size]="20"
      *ngIf="loading && !variant"
      class="ml-2"
    ></loading-spinner>
  `,
  host: {
    '[attr.type]': 'isAnchor ? null : (type ?? (variant ? "button" : "submit"))',
    '[attr.disabled]': '!isAnchor && (disabled || loading) ? true : null',
    '[attr.aria-disabled]': 'isAnchor && (disabled || loading) ? true : null',
    '[attr.aria-busy]': 'loading ? true : null',
    '[attr.tabindex]': 'isAnchor && (disabled || loading) ? -1 : null',
    '[style.border-radius.px]': 'variant ? null : radius',
    '[style.background]': 'variant ? null : background',
    '[class]': 'combinedClasses'
  }
})
export class BooButtonComponent {
  // #region Inputs, Outputs, Properties
  @Input() label: string = '';
  @Input() labelClass: string = '';
  /** Defaults to "submit" in the original style and "button" in the design-system style. Ignored on anchors. */
  @Input() type?: 'button' | 'submit' | 'reset';
  @Input() disabled: boolean = false;
  @Input() radius: number = 0;
  @Input() background: string = 'linear-gradient(90.08deg,#E11D48 0.09%,#06aed4 70.28%)';
  @Input() size: BooButtonSize = 'medium';
  @Input() classname: string = '';
  @Input() loading: boolean | null = false;
  /** Opts into the design-system style; see the type above. */
  @Input() variant?: BooButtonVariant;
  /** Square button for a single icon. Give it an `aria-label`. */
  @Input() iconOnly: boolean = false;
  /** Fills the width of its container (e.g. a stacked mobile action). */
  @Input() block: boolean = false;

  readonly isAnchor = inject(ElementRef).nativeElement.tagName === 'A';

  get dsSize(): DsSize {
    switch (this.size) {
      case 'small': case 'sm': return 'sm';
      case 'large': case 'lg': return 'lg';
      default: return 'md';
    }
  }

  get combinedClasses(): string {
    return this.variant ? this.designSystemClasses(this.variant) : this.legacyClasses();
  }

  private designSystemClasses(variant: BooButtonVariant): string {
    const size = this.dsSize;
    const inactive = this.disabled || this.loading;
    return [
      DS_BASE,
      DS_SIZE[size],
      DS_VARIANT[variant],
      this.iconOnly ? DS_ICON_ONLY[size] : '',
      this.block ? 'w-full' : '',
      // Inactive buttons ignore the pointer so hover colours don't suggest they can be pressed.
      inactive ? 'pointer-events-none' : '',
      this.disabled && !this.loading ? 'opacity-50' : '',
      this.loading ? 'cursor-wait opacity-80' : '',
      this.classname,
    ].filter(Boolean).join(' ');
  }

  private legacyClasses(): string {
    const base = 'relative text-white border-0 overflow-hidden z-[1] cursor-pointer transition-smooth inline-flex items-center justify-center whitespace-nowrap';

    // Minimum widths, not fixed ones: a fixed width made longer labels wrap onto a second line.
    let sizeClass = '';
    switch (this.dsSize) {
      case 'sm':
        sizeClass = 'py-[0.315rem] px-4 text-[0.75rem] min-w-32';
        break;
      case 'md':
        sizeClass = 'py-[0.425rem] px-6.25 text-[0.813rem] min-w-37.5';
        break;
      case 'lg':
        sizeClass = 'py-[0.6rem] px-8 text-[0.875rem] min-w-44';
        break;
    }

    const loadingClass = this.loading ? 'cursor-wait opacity-80' : '';

    return `${base} ${sizeClass} ${loadingClass} ${this.classname}`;
  }
  // #endregion
}
