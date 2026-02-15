import { Component } from "@angular/core";
import { LucideAngularModule, Plus } from "lucide-angular";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { BooTableComponent } from "../../../../../components/table/boo-table/boo-table.component";

@Component({
    selector: 'doctor-list',
    standalone: true,
    template: `
        <admin-content-header>
            <div class="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
                <div class="flex flex-auto items-center gap-2">
                    <span style="transform: none;">
                        <p class="text-[24px] leading-none font-extrabold tracking-tight m-0">Products</p>
                    </span>
                    <div class="flex flex-1 items-center justify-end gap-2">
                        <div class="flex grow-0" style="opacity: 1; transform: none;">
                            <a 
                                role="button" 
                                tabindex="0" 
                                class="inlineFlex-center-center rounded-2 relative cursor-pointer text-[13px] text-white bg-secondary py-1.5 px-3" 
                                href="/apps/e-commerce/products/new" 
                                data-discover="true"
                            >
                                <span class="mr-2 -ml-1">
                                    <lucide-icon [name]="plus" class="w-4 h-4 stroke-white"></lucide-icon>
                                </span>
                                Add
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </admin-content-header>
        <div class="relative z-10 container flex h-full flex-auto flex-col overflow-hidden">
            <div class="flex flex-1 z-[2] max-w-full min-w-0 h-full bg-surface rounded-t-3 rounded-r-3 mt-0.5 mx-0.5">
                <div class="overflow-hidden flex flex-col flex-1">
                    <boo-table></boo-table>
                </div>
            </div>
        </div>
    `,
    imports: [AdminContentHeaderComponent, LucideAngularModule, BooTableComponent]
})

export class DoctorListComponent {
    plus = Plus;
}