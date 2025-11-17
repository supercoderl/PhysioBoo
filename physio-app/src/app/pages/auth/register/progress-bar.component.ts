import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'register-progress-bar',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="relative mb-5">
            <h4 class="font-bold text-[20px] flex items-center gap-5">
                Step {{ currentStep }} 
                <span class="font-semibold text-[#4D5562] text-[20px]">
                    {{ 'Create your account' }}
                </span>
            </h4>
            <div class="relative flex w-full gap-2.5 h-2.5">
                <div 
                    *ngFor="let step of [].constructor(stepCount); let i = index"
                    class="rounded-[4px] transition-all duration-300 relative overflow-hidden"
                    [style.width]="getStepWidth(i)"
                    [style.backgroundColor]="'#DEE9FC'"
                >
                    <div 
                        class="absolute top-0 left-0 h-full rounded-[4px]"
                        [style.width]="getFillWidth(i)"
                        [style.backgroundColor]="getFillColor(i)"
                        [style.transition]="'width 0.5s ease-in-out, background-color 0.3s ease-in-out'"
                    ></div>
                </div>
            </div>
        </div>
    `
})
export class RegisterProgressBarComponent {
    // #region Inputs, Outputs, Properties
    @Input() stepCount = 3;
    @Input() currentStep = 1;
    // #endregion

    // #region Events
    getStepWidth(index: number): string {
        const base = 100 / this.stepCount; 
        const activeBoost = 1.4;   
        const completedBoost = 1.2;   
    
        let widthPercent = base;
    
        if (index + 1 < this.currentStep) widthPercent *= completedBoost;
        else if (index + 1 === this.currentStep) widthPercent *= activeBoost;
    
        return `${widthPercent}%`;
    }
    
    getFillWidth(index: number): string {
        if (index + 1 < this.currentStep) return '100%'; // Completed - fully filled
        if (index + 1 === this.currentStep) return '100%'; // Current - filling to 100%
        return '0%'; // Not started - empty
    }
    
    getFillColor(index: number): string {
        if (index + 1 < this.currentStep) return '#AFCBFF'; // Completed light blue
        if (index + 1 === this.currentStep) return '#3366FF'; // Active dark blue
        return 'transparent';
    }
    // #endregion
}