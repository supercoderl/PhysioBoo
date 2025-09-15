import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";
import { MapPin, ScanQrCode, Search } from "lucide-angular";
import { HOSPITALS } from "../../../shared/data/dummy";

@Component({
    selector: 'app-hospital',
    standalone: true,
    imports: [
    SharedModule,
    BreadcrumbComponent
],
    template: `
        <breadcrumb title="Hospital"></breadcrumb>
        <div class="py-15 bg-white min-h-50">
            <div class="container mx-auto">
                <div class="border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 rounded-[10px] flex">
                    <div class="p-5 flex-1">
                        <div
                            class="flex-center-between flex-wrap gap-4"
                        >
                            <h5 class="text-[20px] font-semibold text-primary leading-[1.2] m-0">
                                Showing <span class="text-[#822bd4]">450</span> Hospitals For You
                            </h5>
                            <div class="flex items-center flex-wrap gap-4">
                                <!-- <div class="relative min-w-62.75">
                                    <span
                                        id="react-select-3-live-region"
                                        class="css-7pg0cj-a11yText"
                                    ></span
                                    ><span
                                        aria-live="polite"
                                        aria-atomic="false"
                                        aria-relevant="additions text"
                                        role="log"
                                        class="css-7pg0cj-a11yText"
                                    ></span>
                                    <div class="css-13cymwt-control">
                                        <div class="css-hlgwow">
                                        <div class="css-1dimb5e-singleValue">
                                            United States Of America (USA)
                                        </div>
                                        <div class="css-19bb58m" data-value="">
                                            <input
                                            class=""
                                            autocapitalize="none"
                                            autocomplete="off"
                                            autocorrect="off"
                                            id="react-select-3-input"
                                            spellcheck="false"
                                            tabindex="0"
                                            aria-autocomplete="list"
                                            aria-expanded="false"
                                            aria-haspopup="true"
                                            role="combobox"
                                            aria-activedescendant=""
                                            type="text"
                                            value=""
                                            style="
                                                color: inherit;
                                                background: 0px center;
                                                opacity: 0;
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
                                        <div class="css-1wy0on6">
                                        <div
                                            class="css-1xc3v61-indicatorContainer"
                                            aria-hidden="true"
                                        >
                                            <svg
                                            height="20"
                                            width="20"
                                            viewBox="0 0 20 20"
                                            aria-hidden="true"
                                            focusable="false"
                                            class="css-8mmkcg"
                                            >
                                            <path
                                                d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"
                                            ></path>
                                            </svg>
                                        </div>
                                        <span class="css-1u9des2-indicatorSeparator"></span>
                                        <div
                                            class="css-1xc3v61-indicatorContainer"
                                            aria-hidden="true"
                                        >
                                            <svg
                                            height="20"
                                            width="20"
                                            viewBox="0 0 20 20"
                                            aria-hidden="true"
                                            focusable="false"
                                            class="css-8mmkcg"
                                            >
                                            <path
                                                d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
                                            ></path>
                                            </svg>
                                        </div>
                                        </div>
                                    </div>
                                </div> -->
                                <div class="max-w-100 relative">
                                    <input
                                        class="h-9.5 min-h-9.5 border border-solid border-borderGray rounded-[5px] pl-8.5 text-primary bg-white text-xs14 leading-[1.6] py-1.75 px-3.75 transition-smooth block w-full"
                                        placeholder="Search Hospitals"
                                        type="text"
                                    />
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-primary text-xs14">
                                        <lucide-angular [img]="Search" class="w-3.5" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center flex-wrap">
                    <div class="mr-6 mb-6 flex items-center pl-6">
                        <input
                            class="bg-secondary border-secondary rounded-full float-left -ml-6 w-14.4 h-14.4 border border-solid bg-center transition-smooth"
                            id="all-hospital"
                            type="radio"
                            value="all-hospital"
                            checked=""
                            name="Radio"
                        />
                        <label
                            class="text-[0.875rem] font-medium ml-2"
                            for="all-hospital"
                        >
                            All Hospitals
                        </label>
                    </div>
                    <div class="mr-6 mb-6 flex items-center pl-6">
                        <input
                            class="bg-secondary border-secondary rounded-full float-left -ml-6 w-14.4 h-14.4 border border-solid bg-center transition-smooth"
                            id="virtual"
                            type="radio"
                            value="virtual"
                            name="Radio"
                        />
                        <label class="text-[0.875rem] font-medium ml-2" for="virtual">
                            Virtual
                        </label>
                    </div>
                    <div class="mr-6 mb-6 flex items-center pl-6">
                        <input
                            class="bg-secondary border-secondary rounded-full float-left -ml-6 w-14.4 h-14.4 border border-solid bg-center transition-smooth"
                            id="appointment"
                            type="radio"
                            value="appointment"
                            name="Radio"
                        />
                        <label class="text-[0.875rem] font-medium ml-2" for="appointment">
                            Appointments
                        </label>
                    </div>
                    <div class="mb-6 flex items-center pl-6">
                        <input
                            class="bg-secondary border-secondary rounded-full float-left -ml-6 w-14.4 h-14.4 border border-solid bg-center transition-smooth"
                            id="clinic"
                            type="radio"
                            value="clinic"
                            name="Radio"
                        />
                        <label class="text-[0.875rem] font-medium ml-2" for="clinic">
                            Hospitals / Clinics
                        </label>
                    </div>
                </div>
                <div class="block">
                    <div class="grid grid-cols-4 -mx-3">
                        <div *ngFor="let item of hospitals" class="px-3">
                            <div class="border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 rounded-[10px] relative flex flex-col">
                                <div class="p-5 text-center flex-1">
                                    <a
                                        class="block mb-5 text-neutral transition-smooth"
                                            href="javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
                                    >
                                        <img
                                            alt="img"
                                            class="mx-auto"
                                            [src]="item.img"
                                        />
                                    </a>
                                    <h6 class="mb-1 block font-semibold leading-[1.2] text-primary">
                                        <a
                                            href="javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
                                            class="text-neutral cursor-pointer transition-smooth"
                                        >
                                            {{item.name}}
                                        </a>
                                    </h6>
                                    <p class="inline-flex items-center text-[0.875rem] mb-0 text-brandDark">
                                        <lucide-angular [img]="MapPin" class="w-3.5 stroke-primary mr-1" />
                                        {{item.address}}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 text-center flex justify-center">
                        <a
                            class="py-2.25 px-4 bg-[linear-gradient(90.08deg,_#0e82fd_0.09%,_#06aed4_70.28%)] text-white text-xs14 rounded-[44px] relative overflow-hidden z-[1] bg-secondary border border-solid border-secondary transition-smooth font-medium flex items-center w-fit"
                            href="/react/template/pages/hospitals"
                        >
                            <lucide-angular [img]="ScanQrCode" class="w-3.5 mr-2" />
                            Load More 425 Hospitals
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class HospitalComponent {
    readonly Search = Search;
    readonly MapPin = MapPin;
    readonly ScanQrCode = ScanQrCode;

    readonly hospitals = HOSPITALS;
}