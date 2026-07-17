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
            <a
                [routerLink]="link"
                class="border border-solid border-borderGray rounded-lg bg-surface flex cursor-pointer transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
                <div class="p-4 text-center flex-1">
                    <span
                        class="text-[32px] p-4 mb-2 rounded-lg inlineFlex-center-center w-full"
                        [style.backgroundColor]="backgroundColor"
                    >
                        <ng-content></ng-content>
                    </span>
                    <h6 class="truncate text-[14px] font-semibold mb-0 text-regular">{{title}}</h6>
                </div>
            </a>
        </div>
    `
})

export class AdminCategoryCardComponent {
    // #region Inputs, Outputs, Properties
    @Input() title: string = "";
    @Input() backgroundColor: string = "";
    @Input() link: string = "";
    // #endregion
}