import { Component, Input, OnDestroy, OnInit, signal } from "@angular/core";
import { BooAvatarComponent } from "../../../../../components/image/avatar/boo-avatar.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { DoctorDeskContext } from "../../../../../shared/types/doctor-desk.types";

@Component({
    selector: 'desk-header',
    standalone: true,
    imports: [SharedModule, BooAvatarComponent],
    template: `
        <div class="flex items-center justify-between gap-4 bg-surface rounded-2 border border-borderGray/60 px-5 py-3">
            <!-- Doctor identity -->
            <div class="flex items-center gap-3 min-w-0">
                <div class="relative shrink-0">
                    <boo-avatar [src]="context.avatarUrl" />
                    <span
                        class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface"
                        [ngClass]="context.isOnline ? 'bg-emerald-500' : 'bg-gray-300'"
                        [title]="context.isOnline ? 'Online' : 'Offline'"
                    ></span>
                </div>
                <div class="flex flex-col min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold text-regular truncate">Dr. {{ context.doctorName }}</span>
                        <span class="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none"
                              [ngClass]="context.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'">
                            {{ context.isOnline ? 'Online' : 'Offline' }}
                        </span>
                    </div>
                    <span class="text-xs15 text-secondary truncate">{{ context.department }} · {{ context.room }} · {{ context.shift }}</span>
                </div>
            </div>

            <!-- Date / time -->
            <div class="hidden md:flex flex-col items-end text-right shrink-0">
                <span class="text-xs15 text-secondary leading-none">{{ currentDate() }}</span>
                <span class="text-lg font-bold text-primary leading-tight tabular-nums">{{ currentTime() }}</span>
            </div>
        </div>
    `,
})
export class DeskHeaderComponent implements OnInit, OnDestroy {
    @Input({ required: true }) context!: DoctorDeskContext;

    currentTime = signal('');
    currentDate = signal('');

    private timer?: ReturnType<typeof setInterval>;

    ngOnInit(): void {
        this.tick();
        this.timer = setInterval(() => this.tick(), 1000);
    }

    ngOnDestroy(): void {
        if (this.timer) clearInterval(this.timer);
    }

    private tick(): void {
        const now = new Date();
        this.currentTime.set(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        this.currentDate.set(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }
}
