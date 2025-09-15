import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { Group, Rows2 } from "lucide-angular";
import { DoctorCardComponent } from "../../../components/layout/client/doctor/doctor-card.component";

@Component({
    selector: 'list-doctor',
    standalone: true,
    imports: [
    SharedModule,
    DoctorCardComponent
],
    template: `
    <div class="px-3">
        <div class="flex items-center mb-6">
            <div class="px-3 flex-1">
                <div class="grid grid-cols-3">
                    <div class="px-3">
                        <div class="mb-6">
                            <div class="relative">
                                <span
                                    class="z-[999] border-0 h-[1px] w-[1px] absolute overflow-hidden"
                                ></span
                                ><span
                                    class="z-[999] border-0 h-[1px] w-[1px] absolute overflow-hidden"
                                ></span>
                                <div class="border border-solid border-borderGray flex-center-between min-h-9.5 relative">
                                    <div class="grid items-center flex-1 relative overflow-hidden py-0.5 px-2">
                                        <div
                                            class="mx-0.5"
                                        >
                                            Select
                                        </div>
                                        <div class="visibility-visible m-0.5 pt-0.5" data-value="">
                                            <input
                                                class=""
                                                tabindex="0"
                                                type="text"
                                                value=""
                                                style="
                                                    color: inherit;
                                                    background: 0px center;
                                                    opacity: 1;
                                                    width: 100%;
                                                    grid-area: 1 / 2;
                                                    font: inherit;
                                                    min-width: 2px;
                                                    border: 0px;
                                                    margin: 0px;
                                                    outline: 0px;
                                                    padding: 0px;
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="px-3">
                <div class="text-right mb-4">
                    <a
                        class="text-[#822bd4] underline medium"
                        href="/react/template/patient/doctor-map-list-availability"
                    >
                        Clear All
                    </a>
                </div>
            </div>
        </div>
        <div
            class="flex-center-between border-bottom border-b border-solid border-[#dee2e6] pb-4 mb-4"
        >
            <div class="flex items-center">
                <p class="font-semibold mr-1.5 text-primary text-xs15 m-0 mr-1.5">Availability</p>
                <div>
                    <input id="status" class="block m-0 p-0 w-0 h-0 visibility-hidden opacity-0 absolute transition-smooth" type="checkbox" />
                    <label
                        for="status"
                        class="h-7 w-12.5 rounded-full bg-[#f3f4f6] border-[#f3f4f6] border border-solid cursor-pointer block m-0 relative text-[0px] before:content-[' '] before:block before:absolute before:top-1/2 before:right-0 before:w-5 before:h-5 before:translate-x-0.75 before:-translate-y-1/2 after:w-6 after:h-6 after:translate-x-[1px] after:-translate-y-1/2 after:bg-center after:shadow-[0_1px_2px_#0000001a,_0_1px_1px_#0000000f] after:block after:bg-[#91a0b3] after:transition-[left_0.3s_ease,_transform_0.3s_ease] after:rounded-full after:absolute after:top-1/2 after:left-0"
                    >
                        checkbox
                    </label>
                </div>
            </div>
            <div class="flex items-center">
                <a
                    class="bg-secondary text-white border-white py-[0.375rem] px-2 w-8 h-8 flex-center-center border border-solid rounded-1.25 text-base transition-smooth"
                    href="/react/template/patient/doctor-list"
                    data-discover="true"
                >
                    <lucide-angular [img]="Rows2" class="w-4 stroke-white" />
                </a>
            </div>
        </div>
        <div class="flex flex-col">
            <div class="w-full px-3">
                <doctor-card></doctor-card>
                <doctor-card></doctor-card>
                <doctor-card></doctor-card>
            </div>
            <div class="px-3">
                <div class="text-center mb-6">
                    <a
                        class="mx-auto load-btn text-white border-0 relative overflow-hidden z-[1] p-[0.35rem_0.85rem] text-[0.813rem] transition-smooth font-medium flex-center-center w-fit gap-1 rounded-full"
                        href="/react/template/login"
                    >
                        <lucide-angular [img]="Group" class="w-[13px]" />
                        Load More 425 Doctors
                    </a>
                </div>
            </div>
        </div>
        </div>
    `,
    styles: `
        label:before {
            background-image: url('https://doccure.dreamstechnologies.com/react/template/assets/img/icons/check.svg');
            background-repeat: no-repeat;
            background-size: 11px 20px;
        }

        label:after {
            background-image: url('https://doccure.dreamstechnologies.com/react/template/assets/img/icons/x-icon.svg');
            background-repeat: no-repeat;
            background-size: 12px 21px;
        }

        .load-btn {
            background: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%);
        }
    `
})

export class ListDoctorComponent {
    readonly Rows2 = Rows2;
    readonly Group = Group;
}