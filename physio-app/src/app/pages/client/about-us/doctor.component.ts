import { Component } from "@angular/core";
import { MapPin } from "lucide-angular";
import { SharedModule } from "../../../shared/shared-imports";
import { BEST_DOCTORS } from "../../../shared/data/dummy";

@Component({
    selector: 'doctor-about-us',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <section class="pb-9 bg-white pt-15 relative overflow-hidden z-[1] block">
        <div class="container mx-auto">
            <div class="flex justify-center">
                <div class="px-3">
                    <div class="mb-10 text-center">
                        <h2 class="text-[32px] mb-0 font-bold text-primary leading-[1.2]">Best Doctors</h2>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-4">
                <div 
                    class="flex px-3"
                    *ngFor="let doctor of bestDoctors"
                >
                    <div 
                        class="mb-6 bg-white border border-solid border-borderGray rounded-[8px] relative overflow-hidden w-full"
                    >
                        <div class="relative">
                            <a
                                href="/react/template/patient/doctor-profile"
                                class="text-neutral transition-smooth"
                            >
                                <div class="relative overflow-hidden rounded-t-[8px]">
                                    <img
                                        class="relative rounded-t-[8px] w-full transition-[all_2s_cubic-bezier(.19,1,.22,1)_0ms]"
                                        alt=""
                                        [src]="doctor.img"
                                    />
                                </div>
                            </a>
                            <div class="absolute top-5 right-5">
                                <span class="font-semibold text-xs14 text-primary py-1.5 px-3 bg-white rounded-[8px]">$ {{doctor.price}}</span>
                            </div>
                        </div>
                        <div class="p-5">
                            <div class="flex-center-between pb-3.75">
                                <div>
                                    <a
                                        href="/react/template/patient/doctor-profile"
                                        class="text-base font-semibold text-primary transition-smooth"
                                    >
                                        {{doctor.name}}
                                    </a>
                                    <p class="text-[12px] mb-0 text-brandDark">{{doctor.department}}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] font-medium mb-4.5 text-brandDark flex items-center">
                                        <span class="flex-center-center mr-1 py-0.5 px-0.75 min-w-11.5 text-white text-[12px] bg-[#ffca18] rounded-[4px]">
                                            <i nz-icon nzType="star" nzTheme="fill" class="w-3.75 text-white"></i>
                                            {{doctor.rating}}
                                        </span>
                                        ({{doctor.ratingCount}})
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p class="text-xs14 mb-0 flex items-center text-brandDark">
                                    <lucide-angular [img]="MapPin" class="w-4 stroke-primary mr-1.25" />
                                    {{doctor.address}}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `
})

export class DoctorAboutUsComponent {
    readonly MapPin = MapPin;
    readonly bestDoctors = BEST_DOCTORS;
}