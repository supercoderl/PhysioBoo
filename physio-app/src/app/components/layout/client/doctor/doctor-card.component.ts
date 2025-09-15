import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { CalendarPlus, CircleCheck } from "lucide-angular";
import { DateItem } from "../../../../shared/types/date";

@Component({
    selector: 'doctor-card',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 rounded-2.5 flex">
            <div class="p-5">
                <div class="grid grid-cols-12">
                    <div class="col-span-5 px-3">
                        <div class="bg-info2 rounded-2.5 p-5">
                            <div class="flex items-center mb-6">
                                <div class="relative">
                                    <span class="w-30 h-30 block mr-2">
                                        <img
                                            alt=""
                                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/doctor-grid/doctor-grid-05.jpg" 
                                            class="w-full h-full object-cover rounded-1.25"
                                        />
                                    </span>
                                    <span class="w-6 h-6 bg-white rounded-full flex-center-center absolute left-1.25 top-1.25">
                                        <lucide-angular [img]="CircleCheck" class="w-4 fill-[#00cc52] stroke-white" />
                                    </span>
                                </div>
                                <div>
                                    <h6 class="mb-1 text-base font-semibold text-primary">Dr. Charles Scott</h6>
                                    <span class="block text-xs14 mb-4">MBBS, Neurologist</span>
                                    <span class="block text-xs14">2197 Haven Lane</span>
                                    <a
                                        class="text-secondary underline"
                                        href="/react/template/patient/doctor-map-list-availability"
                                    >
                                        Get Direction
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h6 class="text-xs14 mb-1 text-primary">Speciality</h6>
                                <p class="mb-4 text-xs15 text-brandDark">Orthopedic Consultation, Delivery Blocks</p>
                                <p class="mb-2 text-xs15 text-brandDark">
                                    Consultation Fees :
                                    <span class="text-danger text-base font-semibold">$650</span>
                                </p>
                                <a
                                    class="bg-primary border-primary text-white border border-solid p-[0.35rem_0.85rem] transition-smooth rounded-full flex-center-center"
                                    href="/react/template/patient/doctor-map-list-availability"
                                >
                                    <lucide-angular [img]="CalendarPlus" class="mr-2 w-3.25" />
                                    Book Online Consultation
                                </a>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-7 px-3">
                            <div class="pb-7.5">
                                <ul class="text-center mb-6">
                                    <div class="flex items-center bg-white rounded-xl p-2 gap-3">
                                        <button 
                                            type="button" 
                                            class="rounded-lg w-10 h-10 flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:text-gray-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                            (click)="navigatePrev()"
                                            [disabled]="isNavigating">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="15,18 9,12 15,6"></polyline>
                                            </svg>
                                        </button>
                                        
                                        <div class="flex-1 overflow-hidden relative h-15">
                                            <div 
                                                #scroller
                                                class="flex transition-transform duration-300 ease-out gap-2" 
                                                [style.transform]="'translateX(' + translateX + 'px)'"
                                                (transitionend)="onTransitionEnd()"
                                            >
                                                <div 
                                                    *ngFor="let dateItem of weekDates; let i = index; trackBy: trackByDate"
                                                    class="min-w-20 h-15 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-200"
                                                    (click)="selectDateByIndex(i)"
                                                >
                                                    <h4 class="m-0 text-sm text-primary font-semibold leading-none">{{ dateItem.dayName }}</h4>
                                                    <p 
                                                        class="mt-1 mb-0 text-xs text-[#d4d4d4] leading-none" 
                                                        [class.opacity-80]="i !== currentIndex"
                                                        [class.opacity-100]="i === currentIndex"
                                                    >
                                                        {{ dateItem.date }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            type="button" 
                                            class="rounded-lg w-10 h-10 flex items-center justify-center cursor-pointer text-gray-500 transition-all duration-200 hover:text-gray-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                            (click)="navigateNext()"
                                            [disabled]="isNavigating">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="9,18 15,12 9,6"></polyline>
                                            </svg>
                                        </button>
                                    </div>
                                </ul>
                                <div class="my-2 grid grid-cols-6">
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            checked=""
                                            name="appintment"
                                        /><span class="bg-secondary text-white min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">09:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">-</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">-</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">09:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">-</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    <div class="mr-3.5 inline-block">
                                        <label class="text-primary bg-white w-[80%] mb-2.5 block cursor-pointer"
                                        ><input
                                            class="opacity-0 visibility-hidden ml-0 absolute top-0 left-0 bg-secondary border-secondary border border-solid rounded-[0.25rem] mt-1"
                                            type="checkbox"
                                            name="appintment"
                                        /><span class="bg-borderGray text-[#64627c] min-w-17.5 h-6 flex-center-center text-xs rounded-[4px] border-0 text-center py-3.25 px-1.25 w-full text-semibold">10:45</span></label
                                        >
                                    </div>
                                    </div>
                                    <div class="text-center">
                                        <a
                                            class="text-secondary underline transition-smooth text-base"
                                            href="/react/template/patient/doctor-map-list-availability"
                                        >
                                            View More Schedule
                                        </a>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
    `
})

export class DoctorCardComponent implements OnInit, AfterViewInit {
    readonly CircleCheck = CircleCheck;
    readonly CalendarPlus = CalendarPlus;

    @ViewChild('scroller') scrollerRef!: ElementRef<HTMLDivElement>;

    weekDates: DateItem[] = [];
    extendedDates: DateItem[] = [];

    currentIndex: number = 0;
    realIndex: number = 0;

    translateX: number = 0;
    isNavigating: boolean = false;

    private itemWidth: number = 88; // 80px width + 8px gap
    private pad: number = 2;
    private containerWidth: number = 0;

    ngOnInit() {
        this.generateWeekDates();
        this.buildExtended();
        this.realIndex = this.findTodayIndex();
        this.currentIndex = this.realIndex + this.pad;
    }

    ngAfterViewInit() {
        this.containerWidth = this.scrollerRef.nativeElement.parentElement!.clientWidth;
        this.updateTransform(false);
    }

    generateWeekDates() {
        const today = new Date();
        const startOfWeek = this.getStartOfWeek(today);

        this.weekDates = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return {
                dayName: this.getDayName(d),
                date: this.formatDate(d),
                fullDate: d,
                isActive: false
            };
        });
    }

    buildExtended() {
        const head = this.weekDates.slice(-this.pad);
        const tail = this.weekDates.slice(0, this.pad);
        this.extendedDates = [...head, ...this.weekDates, ...tail];
    }

    findTodayIndex(): number {
        const todayStr = new Date().toDateString();
        const idx = this.weekDates.findIndex(x => x.fullDate.toDateString() === todayStr);
        return idx === -1 ? 0 : idx;
    }

    getStartOfWeek(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    getDayName(date: Date): string {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    navigateNext() {
        if (this.isNavigating) return;
        this.isNavigating = true;
        this.currentIndex++;
        this.updateTransform(true);
    }
    
    navigatePrev() {
        if (this.isNavigating) return;
        this.isNavigating = true;
        this.currentIndex--;
        this.updateTransform(true);
    }

    selectDateByIndex(index: number) {
        // Reset all active states
        this.weekDates.forEach(item => item.isActive = false);

        this.currentIndex = index;
        this.updateTransform(true);
    }

    onTransitionEnd() {
        const realLen = this.weekDates.length;
    
        if (this.currentIndex >= realLen + this.pad) {
          this.currentIndex -= realLen;
          this.updateTransform(false);
        } else if (this.currentIndex < this.pad) {
          this.currentIndex += realLen;
          this.updateTransform(false);
        }
    
        this.realIndex = (this.currentIndex - this.pad + realLen) % realLen;
        this.isNavigating = false;
    }

    private updateTransform(withAnimation: boolean) {
        const el = this.scrollerRef.nativeElement;
        el.style.transitionProperty = withAnimation ? 'transform' : 'none';
    
        const center = this.containerWidth / 2 - this.itemWidth / 2;
        this.translateX = center - (this.currentIndex * this.itemWidth);
    
        if (!withAnimation) {
          requestAnimationFrame(() => { el.style.transitionProperty = 'transform'; });
        }
    }

    trackByDate(i: number, item: DateItem): string {
        return item.fullDate.toISOString() + ':' + i;
    }
}