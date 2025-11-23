import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { DividerComponent } from "../../../components/divider/divider.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../shared/shared-imports";
import { AppConfig } from "../../../shared/types/common";
import { LocalStorage } from "../../../shared/utils/storage";

@Component({
    selector: 'register-step-two',
    standalone: true,
    imports: [
    SharedModule,
    BooIconComponent,
    BooButtonComponent,
    DividerComponent
],
    template: `
        <div id="step2" class="flex flex-col min-w-full p-4 space-y-8">
            <div class="space-y-8"> 
                <div
                    *ngFor="let role of roles"
                    (click)="handleSelect(role.id)"
                    class="relative group rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02]"
                    [ngClass]="{
                        'shadow-lg ring-2 ring-offset-2': value === role.id,
                        'border-gray-200 bg-white hover:shadow-md hover:border-gray-300': value !== role.id
                    }"
                    [style.borderColor]="value === role.id ? role.color : ''"
                    [style.backgroundColor]="value === role.id ? (role.color + '10') : ''"
                    [style.--tw-ring-color]="value === role.id ? role.color : ''"
                >
                    <!-- Icon badge positioned on top-right border -->
                    <div 
                        class="absolute -top-5 -right-5 py-2 px-1.5 rounded-full transition-all duration-300 shadow-md border-4 border-white"
                        [style.backgroundColor]="value === role.id ? role.color : ''"
                        [ngClass]="value !== role.id ? 'bg-gray-100 text-gray-500 group-hover:bg-gray-200' : 'text-white'"
                    >
                        <boo-icon 
                            [size]="20" 
                            [name]="role.icon ?? 'user'"
                        ></boo-icon>
                    </div>

                    <!-- Content section -->
                    <div class="mt-2">
                        <h3 
                            class="text-xl font-bold mb-2 transition-colors duration-300"
                            [style.color]="value === role.id ? role.color : ''"
                            [ngClass]="value !== role.id ? 'text-gray-800 group-hover:text-gray-900' : ''"
                        >
                            {{ role.name }}
                        </h3>

                        <p class="text-sm text-gray-600 leading-relaxed">
                            {{ role.description }}
                        </p>
                    </div>

                    <!-- Checkmark indicator when selected -->
                    <div 
                        *ngIf="value === role.id" 
                        class="absolute bottom-4 right-4 transition-all duration-300"
                        [style.color]="role.color"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <divider></divider>

            <!-- Navigation buttons -->
            <div class="mt-auto">
                <div class="flex items-center justify-between">
                    <boo-button
                        label="Previous"
                        [radius]="8"
                        classname="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-2.5 font-medium transition-all"
                        (clicked)="onPrev.emit()"
                    ></boo-button>
                    <boo-button
                        label="Finish"
                        type="submit"
                        [radius]="8"
                        classname="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 px-8 py-2.5 font-medium transition-all transform hover:-translate-y-0.5"
                        (clicked)="onSubmit.emit()"
                    ></boo-button>
                </div>
            </div>
        </div>
    `
})

export class RegisterStepTwoComponent {
    // #region Inputs, Outputs
    @Input() value: string = '';
    
    @Output() onSubmit = new EventEmitter<void>();
    @Output() onPrev = new EventEmitter<void>();
    @Output() onSelect = new EventEmitter<string>();

    roles: any[] = [];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        const cached = LocalStorage.load<AppConfig>("config_data");
        if (cached && cached.registrationRoles) {
            this.roles = cached.registrationRoles;
        } else {
            this.roles = [];
        }
    }
    // #endregion

    // #region Events
    handleSelect(id: string) {
        this.onSelect.emit(id);
    }
    // #endregion
}