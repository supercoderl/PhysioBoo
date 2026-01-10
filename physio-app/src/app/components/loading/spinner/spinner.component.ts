import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'loading-spinner',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div 
            class="inset-0 flex items-center justify-center backdrop-blur-md"
            [style.position]="position"
        >
            <div 
                class="rounded-full animate-spin"
                [style.width.px]="size"
                [style.height.px]="size"
                [style.border]="'2px solid ' + strokeColor"
                [style.border-top-color]="mainColor"
            ></div>
        </div>
    `
})

export class LoadingSpinnerComponent {
    // #region Inputs, Outputs, Properties
    @Input() size: number = 16;
    @Input() strokeColor?: string = "rgba(255, 255, 255, 0.3)";
    @Input() mainColor?: string = "#ffffff";
    @Input() position?: string = "absolute";
    // #endregion
}