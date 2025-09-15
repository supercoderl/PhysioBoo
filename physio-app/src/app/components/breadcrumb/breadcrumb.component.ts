import { Component, Input } from "@angular/core";
import { SharedModule } from "../../shared/shared-imports";

@Component({
    selector: 'breadcrumb',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div 
            [ngClass]="{
                'bg-[#f9fbff] pt-27 pb-10 relative z-[1]': true,
                'overflow-hidden': isHidden    
            }"
        >
            <div class="container mx-auto">
                <div class="flex items-center -mx-3">
                    <div class="text-center w-full px-3">
                        <nav class="block">
                            <h2 class="text-primary text-[36px] font-bold">{{title}}</h2>
                        </nav>
                    </div>
                </div>
                <ng-content></ng-content>
            </div>
            <div>
                <img 
                    class="absolute top-14 left-0 z-[-1] h-41.25" 
                    alt="img" 
                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/breadcrumb-bg-01.png" 
                />
                <img 
                    class="absolute top-14 right-0 z-[-1] h-41.25" 
                    alt="img" 
                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/breadcrumb-bg-02.png" 
                />
                <img 
                    class="absolute top-14 left-[30%] z-[-1]" 
                    alt="img" 
                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/breadcrumb-icon.png" 
                />
                <img 
                    class="absolute bottom-0 right-[20%] z-[-1]" 
                    alt="img" 
                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/breadcrumb-icon.png" 
                />
            </div>
        </div>
    `
})

export class BreadcrumbComponent {
    @Input() title: string = "";
    @Input() isHidden: boolean = true;
}