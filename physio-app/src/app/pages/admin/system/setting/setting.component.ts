import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";

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
                            id=""
                            class="ps relative"
                        >
                            <div
                                class="lg:min-w-0 flex flex-col max-h-full bg-[#F6F7F8]"
                            >
                                <div>
                                    <div class="flex items-center justify-between p-4">
                                        <p
                                            class="tracking-tight font-extrabold text-[24px] m-0"
                                        >
                                            Settings
                                        </p>
                                    </div>
                                    <div class="navigation px-3">
                                        <a
                                            role="button"
                                            tabindex="0"
                                            aria-label="Account"
                                            aria-expanded="false"
                                            aria-current="page"
                                            class="p-2 rounded-md gap-2 w-full flex mb-1 bg-[#0000000d] cursor-pointer relative align-middle text-[13px] font-medium leading-none min-h-8 min-w-8 text-[#1F232B]"
                                            href="/apps/settings/account"
                                            data-discover="true"
                                        >
                                            <boo-icon name="settings"></boo-icon>
                                            <div
                                                class="flex min-w-0 flex-auto flex-col items-start justify-center"
                                            >
                                                <p
                                                    class="max-w-full m-0 text-[13px]"
                                                >
                                                    General
                                                </p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pt-0.5 pl-0.5 flex flex-col w-full z-[9999]">
                    <router-outlet></router-outlet>
                </div>
            </div>
        </div>
    `
})

export class AdminSystemSettingComponent {}