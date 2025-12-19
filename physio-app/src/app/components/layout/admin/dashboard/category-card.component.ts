import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";

@Component({
    selector: 'admin-category-card',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="">
            <a href="lab-results.php" class="mb-6 border border-solid border-[#E2E8F0] rounded-[5px] bg-white flex">
                <div class="p-5 text-center flex-1">
                    <span 
                        class="text-[32px] p-4 mb-2 inlineFlex-center-center w-full"
                        [style.backgroundColor]="backgroundColor"
                    >
                        <ng-content></ng-content>
                    </span>
                    <h6 class="truncate text-[14px] font-semibold mb-0">{{title}}</h6>
                </div>
            </a>
        </div>
    `
})

export class AdminCategoryCardComponent {
    // #region Inputs, Outputs, Properties
    @Input() title: string = "";
    @Input() backgroundColor: string = "";
    // #endregion
}