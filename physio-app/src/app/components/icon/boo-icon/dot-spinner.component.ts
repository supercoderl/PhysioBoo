import { Component } from "@angular/core";

@Component({
    selector: 'dot-spinner',
    standalone: true,
    imports: [],
    template: `
        <div
            class="w-4 h-4 border-[3px] border-dotted rounded-full animate-spin border-black mx-auto"
        ></div>
    `
})

export class DotSpinnerComponent {}