import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'boo-button-admin',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <button
            class="whitespace-nowrap inlineFlex-center-center relative cursor-pointer align-middle leading-1 min-h-8 min-w-8 m-0 transition-all duration-300"
            [ngClass]="buttonClass"
            tabindex="0"
            type="button"
            [style.backgroundColor]="active === false ? 'transparent' : isDisabled ? '#E3D5DA' : background"
            [style.borderWidth.px]="border.width"
            [style.borderStyle]="border.style"
            [style.borderColor]="border.color"
            [style.fontWeight]="fontWeight"
            [style.padding]="padding"
            [style.gap.px]="gap"
            [style.borderRadius.px]="radius"
            [style.fontSize.px]="fontSize"
            [style.color]="active === false ? '#000000' : isDisabled ? '#71606A' : textColor"
            [attr.data-bordered]="border.width > 0 ? '' : null"
            [disabled]="isDisabled"
        >
            <span 
                class="flex mr-1 -ml-1 text-base"
                [class.animate-spin]="loading"
                *ngIf="icon || loading"
            >
                <physio-icon 
                    [name]="loading ? 'loader' : icon?.name || ''" 
                    [size]="icon?.size || 16" 
                    [class]="icon?.iconClass"
                />
            </span>
            <ng-content></ng-content>
        </button>
    `,
    styles: `
        :host {
            display: inline-block;
            height: 100%;  
        }
        /* Hover feedback independent of the inline background, so transparent buttons get one too. */
        button::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: currentColor;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
        }
        button:not(:disabled):hover::after {
            opacity: 0.1;
        }
        /* Secondary buttons: the border turns rose on hover (inline styles need !important to be overridden). */
        button[data-bordered]:not(:disabled):hover {
            border-color: var(--color-primary) !important;
        }
    `
})

export class BooButtonAdminComponent {
    // #region Inputs, Outputs, Properties
    @Input() icon?: { name: string, size: number, iconClass?: string };
    @Input() background: string = "rgb(var(--twc-primary))";
    @Input() border: { width: number, style?: string, color: string } = { width: 0, style: "solid", color: "#000000" }
    @Input() textColor: string = "var(--color-text)";
    @Input() fontWeight: string = "400";
    @Input() padding: string = "6px 12px";
    @Input() gap: number = 1;
    @Input() radius: number = 6;
    @Input() buttonClass: string = '';
    @Input() fontSize: number = 13;
    @Input() active?: boolean;
    @Input() disabled: boolean = false;
    @Input() loading: boolean = false;

    get isDisabled() {
        return this.disabled || this.loading;
    }
    // #endregion
}