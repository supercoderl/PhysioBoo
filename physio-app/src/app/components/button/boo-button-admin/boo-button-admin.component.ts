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
            class="whitespace-nowrap inlineFlex-center-center relative cursor-pointer align-middle leading-1 min-h-8 min-w-8 m-0"
            [ngClass]="buttonClass"
            tabindex="0"
            type="button"
            [style.backgroundColor]="background"
            [style.borderWidth.px]="border.width"
            [style.borderStyle]="border.style"
            [style.borderColor]="border.color"
            [style.fontWeight]="fontWeight"
            [style.padding]="padding"
            [style.gap.px]="gap"
            [style.borderRadius.px]="radius"
            [style.fontSize.px]="fontSize"
            [style.color]="textColor"
        >
            <span 
                class="flex mr-1 -ml-1 text-base"
                *ngIf="icon"
            >
                <lucide-icon [name]="icon.name" [size]="icon.size || 16" [color]="icon.color || '#000000'"></lucide-icon>
            </span>
            <ng-content></ng-content>
        </button>
    `,
    styles: `
        :host {
            display: inline-block;
            height: 100%;  
        }
    `
})

export class BooButtonAdminComponent {
    // #region Inputs, Outputs, Properties
    @Input() icon?: { name: string, size: number, color?: string };
    @Input() background: string = "#1565C0";
    @Input() border: { width: number, style?: string, color: string } = { width: 0, style: "solid", color: "#000000" }
    @Input() textColor: string = "#000000";
    @Input() fontWeight: string = "400";
    @Input() padding: string = "6px 12px";
    @Input() gap: number = 1;
    @Input() radius: number = 6;
    @Input() buttonClass: string = '';
    @Input() fontSize: number = 13;
    // #endregion
}