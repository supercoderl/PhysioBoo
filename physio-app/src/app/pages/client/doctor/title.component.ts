import { Component } from "@angular/core";

@Component({
    selector: 'title-doctor',
    standalone: true,
    template: `
        <div class="px-3">
            <div class="mb-6">
                <h3 class="text-[20px] font-semibold text-primary">Showing 
                    <span class="text-[#822bd4]">450</span> 
                    Doctors For You
                </h3>
            </div>
        </div>
    `
})

export class TitleDoctorComponent {}