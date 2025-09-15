import { Component } from "@angular/core";
import { MapPin } from "lucide-angular";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'filter-doctor',
    standalone: true,
    imports: [
        SharedModule,
    ],
    template: `
        <div class="px-3">
            <div class="flex-center-end mb-6">
                <div class="mr-2 relative">
                    <a 
                        class="py-2 pr-3.75 pl-2 flex rounded-1.25 text-brandDark border border-solid border-borderGray" 
                        href="/react/template/patient/doctor-map-list-availability" 
                    >
                        <span class="text-primary inline-block mr-2.5 after:border-[0_2px_2px_0] after:border-brandDark after:text-xs14 after:p-0.75 after:rotate-45 after:border-solid after:ml-2.5 after:inline-block after:content-['']">
                            Sort By
                        </span>
                        Price (Low to High)
                    </a>
                    <div class="p-3.75 border border-solid border-borderGray bg-white text-xs14 rounded-xs hidden">
                        <a class="dropdown-item" href="/react/template/patient/doctor-map-list-availability" data-discover="true">
                            Price (Low to High)
                        </a>
                        <a class="dropdown-item" href="/react/template/patient/doctor-map-list-availability" data-discover="true">
                            Price (High to Low)
                        </a>
                    </div>
                </div>
                <a 
                    class="bg-secondary text-white border-white py-[0.375rem] px-2 w-8 h-8 flex-center-center border border-solid rounded-1.25 text-base transition-smooth" 
                    href="/react/template/patient/doctor-list" 
                >
                    <lucide-angular [img]="MapPin" class="w-4" />
                </a>
            </div>
        </div>
    `
})

export class FilterDoctorComponent {
    readonly MapPin = MapPin;
}