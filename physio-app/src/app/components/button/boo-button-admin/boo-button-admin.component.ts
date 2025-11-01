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
            class="whitespace-nowrap inlineFlex-center-center relative cursor-pointer align-middle text-[13px] text-white font-medium leading-1 min-h-8 min-w-8 m-0 rounded-[8px] bg-[#1565C0] py-1.5 px-3"
            tabindex="0"
            type="button"
        >
            <span class="flex mr-2 -ml-1 text-base">
                <lucide-icon *ngIf="icon" [name]="icon.name" [size]="icon.size || 16" ></lucide-icon>
            </span>
            <ng-content></ng-content>
        </button>
    `
})

export class BooButtonAdminComponent {
    // #region Inputs, Outputs, Properties
    @Input() icon?: { name: string, size: number,  };
}