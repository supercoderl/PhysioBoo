import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";

@Component({
    selector: 'setting-general',
    standalone: true,
    imports: [BooIconComponent, RouterModule],
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
                                            class="tracking-tight font-extrabold leading-none text-[24px] m-0"
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
                                            <boo-icon name="circle-user"></boo-icon>
                                            <div
                                                class="flex min-w-0 flex-auto flex-col items-start gap-1"
                                            >
                                                <p
                                                    class="leading-none truncate max-w-full m-0 text-[13px]"
                                                >
                                                    Account
                                                </p>
                                                <p
                                                    class="leading-none text-[11px] truncate max-w-full m-0 text-[#4B5563]"
                                                >
                                                    Manage your public profile and private information
                                                </p>
                                            </div>
                                        </a>
                                        <a
                                            role="button"
                                            tabindex="0"
                                            aria-label="Security"
                                            aria-expanded="false"
                                            class="p-2 rounded-md gap-2 w-full flex mb-1 cursor-pointer relative align-middle text-[13px] font-medium leading-none min-w-8 min-h-8 text-[#1F232B]"
                                            href="/apps/settings/security"
                                            data-discover="true"
                                        >
                                            <boo-icon name="lock"></boo-icon>
                                            <div
                                                class="flex min-w-0 flex-auto flex-col items-start gap-1"
                                            >
                                                <p
                                                    class="leading-none truncate max-w-full m-0 text-[13px]"
                                                >
                                                    Security
                                                </p>
                                                <p
                                                    class="leading-none text-[11px] truncate max-w-full m-0 text-[#4B5563]"
                                                >
                                                    Manage your password and 2-step verification preferences
                                                </p>
                                            </div>
                                        </a>
                                        <a
                                            role="button"
                                            tabindex="0"
                                            aria-label="Plan &amp; Billing"
                                            aria-expanded="false"
                                            class="p-2 rounded-md gap-2 w-full flex mb-1 cursor-pointer relative align-middle text-[13px] font-medium leading-none min-w-8 min-h-8 text-[#1F232B]"
                                            href="/apps/settings/plan-billing"
                                            data-discover="true"
                                        >
                                            <boo-icon name="credit-card"></boo-icon>
                                            <div
                                                class="flex min-w-0 flex-auto flex-col items-start gap-1"
                                            >
                                                <p
                                                class="leading-none truncate max-w-full m-0 text-[13px]"
                                                >
                                                Plan &amp; Billing
                                                </p>
                                                <p
                                                class="leading-none text-[11px] truncate max-w-full m-0 text-[#4B5563]"
                                                >
                                                Manage your subscription plan, payment method and billing
                                                information
                                                </p>
                                            </div>
                                        </a>
                                        <a
                                            role="button"
                                            tabindex="0"
                                            aria-label="Notifications"
                                            aria-expanded="false"
                                            class="p-2 rounded-md gap-2 w-full flex mb-1 cursor-pointer relative align-middle text-[13px] font-medium leading-none min-w-8 min-h-8 text-[#1F232B]"
                                            href="/apps/settings/notifications"
                                            data-discover="true"
                                        >
                                            <boo-icon name="bell"></boo-icon>
                                            <div
                                                class="flex min-w-0 flex-auto flex-col items-start gap-1"
                                            >
                                                <p
                                                class="leading-none truncate max-w-full m-0 text-[13px]"
                                                >
                                                Notifications
                                                </p>
                                                <p
                                                class="leading-none text-[11px] truncate max-w-full m-0 text-[#4B5563]"
                                                >
                                                Manage when you'll be notified on which channels
                                                </p>
                                            </div>
                                        </a>
                                        <a
                                            role="button"
                                            tabindex="0"
                                            aria-label="Team"
                                            aria-expanded="false"
                                            class="p-2 rounded-md gap-2 w-full flex mb-1 cursor-pointer relative align-middle text-[13px] font-medium leading-none min-w-8 min-h-8 text-[#1F232B]"
                                            href="/apps/settings/team"
                                            data-discover="true"
                                        >
                                            <boo-icon name="users"></boo-icon>
                                            <div
                                                class="flex min-w-0 flex-auto flex-col items-start gap-1"
                                            >
                                                <p
                                                    class="leading-none truncate max-w-full m-0 text-[13px]"
                                                >
                                                    Team
                                                </p>
                                                <p
                                                    class="leading-none text-[11px] truncate max-w-full m-0 text-[#4B5563]"
                                                >
                                                    Manage your existing team and change roles/permissions
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

export class SettingGeneralComponent {}