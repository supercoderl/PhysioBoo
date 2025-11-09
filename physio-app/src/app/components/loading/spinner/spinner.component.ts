import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'loading-spinner',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="absolute inset-0 flex items-center justify-center backdrop-blur-md">
            <div 
                class="border-2 border-white/30 border-t-white rounded-full animate-spin"
                [style.width.px]="size"
                [style.height.px]="size"
            ></div>
        </div>
    `
})

export class LoadingSpinnerComponent {
    // #region Inputs, Outputs, Properties
    @Input() size: number = 16;
    // #endregion
}