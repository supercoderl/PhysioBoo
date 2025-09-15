import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { Calendar, Hospital, MapPin, Search, Star } from 'lucide-angular';

@Component({
    selector: 'banner-home',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <section class="bg-cover pt-25 pb-7.5 relative overflow-hidden z-[1] block">
            <div class="container mx-auto">
                <div class="grid grid-cols-12 items-center">
                <div class="col-span-7 px-3">
                    <div class="py-30 z-[1] relative">
                    <div
                        class="bg-white shadow-[0_4px_14px_#e2edff40] rounded-7.5 p-2 mb-4 gap-2 inline-flex items-center"
                    >
                        <div class="p-0">
                            <span class="w-11.252 h-11.252 -mr-3.5 border border-solid border-[rgba(0,_0,_0,_0.05)] align-middle transition-transform duration-200 ease rounded-full relative inline-block overflow-hidden hover:-translate-y-0.75 hover:z-[10]">
                                <img
                                    class="rounded-full border-0.75 border-white border-solid"
                                    alt="img"
                                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/doctors/doctor-thumb-22.jpg"
                                />
                            </span>
                            <span class="w-11.252 h-11.252 -mr-3.5 border border-solid border-[rgba(0,_0,_0,_0.05)] align-middle transition-transform duration-200 ease rounded-full relative inline-block overflow-hidden hover:-translate-y-0.75 hover:z-[10]">
                                <img
                                    class="rounded-full border-0.75 border-white border-solid"
                                    alt="img"
                                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/doctors/doctor-thumb-23.jpg"
                                />
                            </span>
                            <span class="w-11.252 h-11.252 border border-solid border-[rgba(0,_0,_0,_0.05)] align-middle transition-transform duration-200 ease rounded-full relative inline-block overflow-hidden hover:-translate-y-0.75 hover:z-[10]">
                                <img
                                    class="rounded-full"
                                    alt="img"
                                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/doctors/doctor-thumb-24.jpg"
                                />
                            </span>
                        </div>
                        <div class="mr-2">
                        <h6 class="mb-1 text-base font-semibold">5K+ Appointments</h6>
                        <div class="flex items-center">
                            <div class="flex items-center">
                                <lucide-angular 
                                    *ngFor="let index of stars"
                                    [img]="Star" 
                                    class="w-3.5 h-3.5 text-danger mr-1 fill-danger" 
                                />
                            </div>
                            <p class="text-xs14 m-0">5.0 Ratings</p>
                        </div>
                        </div>
                    </div>
                    <h1 class="mb-10 font-bold text-[44px] text-balance">
                        Discover Health: Find Your Trusted
                        <span class="text-secondary">Doctors</span>
                        Today
                    </h1>
                    <div class="search-box border border-solid rounded-17.5 p-2 relative shadow-[0_4px_14px_#e2edff40] table z-[1]">
                        <form class="float-left w-full">
                            <div class="table-cell w-[35%] align-middle relative before:absolute before:top-1/2 before:right-0 before:-translate-y-1/2 before:w-[1px] before:h-11 before:bg-[#e3e4e8] before:content-[''] before:z-[1]">
                                <lucide-angular [img]="Hospital" class="w-4.5 stroke-primary left-1.25 absolute top-1/2 -translate-y-1/2" />
                                 <div class="mb-0">
                                    <input
                                        class="pl-8.25 h-19 pr-2.5 text-primary min-h-9.5 text-xs14 rounded-1.25 transition-smooth block w-full outline-none"
                                        placeholder="Search doctors, clinics, hospitals, etc"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div class="table-cell w-[26%] align-middle relative before:absolute before:top-1/2 before:right-0 before:-translate-y-1/2 before:w-[1px] before:h-11 before:bg-[#e3e4e8] before:content-[''] before:z-[1]">
                                <lucide-angular [img]="MapPin" class="w-4.5 stroke-primary left-1.25 absolute top-1/2 -translate-y-1/2" />
                                <div class="mb-0">
                                    <input
                                        class="pl-8.25 h-19 pr-2.5 text-primary min-h-9.5 text-xs14 rounded-1.25 transition-smooth block w-full outline-none"
                                        placeholder="Location"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div class="table-cell w-[21%] align-middle relative">
                                <lucide-angular [img]="Calendar" class="w-4.5 stroke-primary left-1.25 absolute top-1/2 -translate-y-1/2" />
                                <div class="mb-0">
                                    <span
                                        data-pc-name="calendar"
                                        data-pc-section="root"
                                    >
                                        <input
                                            class="pr-2.5 text-[#333] text-xs15 px-9 transition-smooth ease outline-none"
                                            autocomplete="off"
                                            placeholder="Date"
                                            type="text"
                                        />
                                    </span>
                                </div>
                            </div>
                            <div class="table-cell pt-0">
                                <button class="m-0 text-base font-medium min-w-21.5 py-2 px-4.5 transition-smooth rounded-11 relative overflow-hidden z-[1] border border-solid border-secondary cursor-pointer text-center text-white flex items-center gap-1" type="submit">
                                    <lucide-angular [img]="Search" class="w-3.5 leading-3 fill-white stroke-white" />
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>
                    </div>
                </div>
                <div class="col-span-5 px-3">
                    <div class="banner z-[1] relative text-right before:content-[''] before:bg-[top_center] before:w-full before:h-full before:absolute before:top-19 before:left-1/2 before:-translate-x-1/2 before:z-[-1]">
                        <img
                            class=" "
                            alt="patient-image"
                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/banner/banner-doctor.svg"
                        />
                        <div class="shadow-[0_4px_24px_#dddcff] p-4 rounded-2.5 text-center bg-white absolute right-0 top-1/2 translate-y-1/2 animate-mover">
                            <h6 class="text-lg font-semibold text-primary">1K</h6>
                            <p class="text-xs m-0 text-brandDark">
                                Appointments
                            <span class="block">Completed</span>
                            </p>
                        </div>
                        <div class="bg-[#000f28] p-2.5 rounded-1.25 animate-mover text-center absolute left-0 bottom-25">
                            <div class="mb-2">
                                <span class="w-6 h-6 -mr-3.5 border border-solid border-[rgba(0,_0,_0,_0.5)] align-middle transition-transform duration-200 ease rounded-full relative inline-block overflow-hidden hover:-translate-y-0.75 hover:z-[10]">
                                    <img
                                        alt="img"
                                        src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient19.jpg"
                                    />
                                </span>
                                <span class="w-6 h-6 -mr-3.5 border border-solid border-[rgba(0,_0,_0,_0.5)] align-middle transition-transform duration-200 ease rounded-full relative inline-block overflow-hidden hover:-translate-y-0.75 hover:z-[10]">
                                    <img
                                        alt="img"
                                        src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient16.jpg"
                                    />
                                </span>
                                <span class="w-6 h-6 -mr-3.5 border border-solid border-[rgba(0,_0,_0,_0.5)] align-middle transition-transform duration-200 ease rounded-full relative inline-block overflow-hidden hover:-translate-y-0.75 hover:z-[10]">
                                    <img
                                        alt="img"
                                        src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient18.jpg"
                                    />
                                </span>
                            </div>
                            <p class="text-xs text-white m-0">15K+</p>
                            <p class="text-xs text-white m-0">Satisfied Patients</p>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <div class="banner-bg">
                <img
                    class="absolute top-0 left-0"
                    alt="img"
                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/banner-bg-02.png"
                />
                <img
                    class="absolute bottom-0 left-0 z-[-1]"
                    alt="img"
                    src="https://doccure.dreamstechnologies.com//react/template/src/assets/img/bg/banner-bg-03.png"
                />
                <img
                    class="absolute bottom-0 right-0 z-[-1]"
                    alt="img"
                    src="https://doccure.dreamstechnologies.com//react/template/src/assets/img/bg/banner-bg-04.png"
                />
                <img
                    class="absolute top-0 right-0 z-[-1]"
                    alt="img"
                    src="https://doccure.dreamstechnologies.com//react/template/src/assets/img/bg/banner-bg-05.png"
                />
                <img
                    class="absolute left-[3%] bottom-[15%]"
                    alt="img"
                    src="https://doccure.dreamstechnologies.com//react/template/src/assets/img/bg/banner-icon-01.svg"
                />
                <img
                    class="absolute top-1/2 -translate-y-1/2 left-1/2"
                    alt="img"
                    src="https://doccure.dreamstechnologies.com//react/template/src/assets/img/bg/banner-icon-01.svg"
                />
            </div>
        </section>
    `,
    styles: `
        section {
            background: url('https://doccure.dreamstechnologies.com/react/template/assets/home-banner-bg-Bke3qugk.png');
        
            .search-box {
                background: linear-gradient(#fff,#fff),linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%)
            }  

            .banner::before {
                background: url('https://doccure.dreamstechnologies.com/react/template/assets/banner-bg-01-CJsPi853.png');
                background-repeat: no-repeat;
            }

            form button {
                background: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%);
            }
        }
    `
})
export class BannerHomeComponent {
    readonly Star = Star;
    readonly Search = Search;
    readonly Hospital = Hospital;
    readonly MapPin = MapPin;
    readonly Calendar = Calendar;
    readonly stars = new Array(5);
}
