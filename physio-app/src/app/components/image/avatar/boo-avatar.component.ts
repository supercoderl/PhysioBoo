import { Component, Input, OnInit } from "@angular/core";
import { AVATAR } from "../../../shared/data/dummy";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'boo-avatar',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div
            class="rounded-[6px] h-10 w-10 p-1 relative flex-center-center overflow-hidden text-[13px] bg-surface text-[#4B5563]"
        >
            <img
                alt="user photo"
                class="w-full h-full text-center object-cover transparent"
                [src]="src"
            />
        </div>
    `
})

export class BooAvatarComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    @Input() src?: string | null;
    @Input() allowBorder: boolean = false;
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        if(!this.src) this.src = AVATAR;
    }
    // #endregion
}