import { Component } from "@angular/core";
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";
import { CalendarHeart, Hospital, MapPin, Search } from "lucide-angular";
import { TitleDoctorComponent } from "./title.component";
import { FilterDoctorComponent } from "./filter.component";
import { SharedModule } from "../../../shared/shared-imports";
import { ListDoctorComponent } from "./list.component";
import { MapDoctorComponent } from "./map.component";

@Component({
    selector: 'app-doctor',
    standalone: true,
    imports: [
    BreadcrumbComponent,
    TitleDoctorComponent,
    FilterDoctorComponent,
    SharedModule,
    ListDoctorComponent,
    MapDoctorComponent
],
    template: `
        <breadcrumb title="Doctors" [isHidden]="false">
            <div id="doctor-form" class="max-w-[816px] w-full mx-auto mt-5 -mb-20 p-0.5 text-white rounded-full">
                <div class="p-2 min-w-[800px] w-full bg-white border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] m-0 table relative z-[1] rounded-full">
                    <form class="flex-center-between float-left w-full">
                        <div class="w-[35%] float-left table-cell align-middle relative before:absolute before:top-1/2 before:-translate-y-1/2 before:right-0 before:w-[1px] before:h-11 before:bg-[#e3e4e8] before:content-[''] before:z-[1]">
                            <lucide-angular [img]="Hospital" class="w-4.5 stroke-[#8894ae] absolute top-1/2 -translate-y-1/2" />
                            <div class="mb-0">
                                <input 
                                    class="h-10 pr-2.5 pl-6.25 outline-none border-0 text-primary min-h-9.5 bg-white text-xs14 rounded-1.25 transition-smooth block w-full" 
                                    placeholder="Search for Doctors, Hospitals, Clinics" 
                                    type="text"
                                >
                            </div>
                        </div>
                        <div class="w-[26%] float-left table-cell align-middle relative">
                            <lucide-angular [img]="MapPin" class="w-4.5 stroke-[#8894ae] absolute top-1/2 -translate-y-1/2" />
                            <div class="mb-0">
                                <input 
                                    class="h-10 px-9 outline-none border-0 text-primary min-h-9.5 bg-white text-xs14 rounded-1.25 transition-smooth block w-full" 
                                    placeholder="Location" 
                                    type="text"
                                >
                            </div>
                        </div>
                        <div class="w-1/4 float-left table-cell align-middle relative">
                            <lucide-angular [img]="CalendarHeart" class="w-4.5 stroke-[#8894ae] absolute top-1/2 -translate-y-1/2" />
                            <div class="mb-0">
                                <div class="px-9">
                                    <div class="ant-picker-input">
                                        <input aria-invalid="false" autocomplete="off" size="12" placeholder="dd/mm/yyyy" value="">
                                        <span class="ant-picker-suffix">
                                            <span role="img" aria-label="calendar" class="anticon anticon-calendar">
                                                <svg viewBox="64 64 896 896" focusable="false" data-icon="calendar" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"></path></svg>
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="float-right">
                            <button 
                                class="text-base font-medium min-w-21.5 py-2.25 px-3.75 transition-smooth text-white relative overflow-hidden z-[1] bg-secondary border border-solid border-secondary cursor-pointer rounded-full inline-flex items-center" 
                                type="submit"
                            >
                                <lucide-angular [img]="Search" class="mr-2 w-4 fill-white" />Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </breadcrumb>
        <div class="pt-28.75 min-h-50 pb-9 mt-0.75">
            <div class="container mx-auto">
                <div class="grid grid-cols-2">
                    <title-doctor></title-doctor>
                    <filter-doctor></filter-doctor>
                </div>
                <div class="grid grid-cols-4">
                    <list-doctor class="col-span-3"></list-doctor>
                    <map-doctor class="col-span-1"></map-doctor>
                </div>
            </div>
        </div>
    `,
    styles: `
        #doctor-form {
            background: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%);
        }

        button {
            background-image: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%);
        }
    `
})

export class DoctorComponent {
    readonly Search = Search;
    readonly Hospital = Hospital;
    readonly MapPin = MapPin;
    readonly CalendarHeart = CalendarHeart;
}