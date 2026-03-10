import { Component } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SETTINGS_MANAGEMENT } from "../../../../shared/data/dummy";
import { SharedModule } from "../../../../shared/shared-imports";

@Component({
    selector: 'admin-system-setting',
    standalone: true,
    imports: [
        BooIconComponent, 
        SharedModule
    ],
    template: `
        <div class="z-10 flex h-full flex-auto flex-col">
            <div class="flex flex-1 z-[2] min-w-0 h-full bg-[#F6F7F8] absolute inset-0 overflow-hidden">
                <div
                    class="relative mx-0 border-0 w-[320px] max-w-[320px] overflow-hidden bg-transparent flex-0"
                >
                    <div
                        class="w-full relative bg-[#F6F7F8] text-[#1F232B] min-w-full h-full overflow-y-auto flex flex-col top-0 left-0"
                    >
                        <div
                            class="relative"
                        >
                            <div
                                class="lg:min-w-0 flex flex-col max-h-full bg-[#F6F7F8]"
                            >
                                <div>
                                    <div class="flex items-center justify-between p-4">
                                        <p
                                            class="tracking-tight font-extrabold leading-none text-[24px] m-0"
                                        >
                                            Settings
                                        </p>
                                    </div>
                                    <div class="navigation px-3">
                                        <a
                                            class="p-2 rounded-md gap-2 w-full flex mb-1 cursor-pointer relative align-middle text-[13px] font-medium leading-none min-h-8 min-w-8 text-[#1F232B]"
                                            *ngFor="let setting of settings"
                                            [routerLink]="setting.route"
                                            routerLinkActive="active" 
                                            #rla="routerLinkActive" 
                                            [class.bg-[#0000000d]]="rla.isActive"
                                        >
                                            <boo-icon [name]="setting.icon" ></boo-icon>
                                            <div
                                                class="flex min-w-0 flex-auto flex-col items-start gap-1"
                                            >
                                                <p
                                                    class="leading-none truncate max-w-full m-0 text-[13px]"
                                                >
                                                    {{ setting.name }}
                                                </p>
                                                <p
                                                    class="leading-none text-[11px] truncate max-w-full m-0 text-regular"
                                                >
                                                    {{ setting.description }}
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pt-0.5 pl-0.5 flex flex-col flex-1 min-w-0 w-full z-[9999]">
                    <div 
                        class="ps bg-surface relative flex flex-col flex-1 min-h-0 overscroll-contain h-screen shadow-card"
                        style="border-top-left-radius: 12px; scrollbar-width: none; position: relative; overflow-y: auto;"
                    >
                        <div class="flex-auto px-6 py-2">
                            <router-outlet></router-outlet>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class AdminSystemSettingComponent {
    // #region Inputs, Outputs, Properties
    settings = SETTINGS_MANAGEMENT;
    // #endregion

    // #region Methods

    // #endregion
}