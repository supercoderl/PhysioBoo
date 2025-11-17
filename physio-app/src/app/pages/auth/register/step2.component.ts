import { Component, EventEmitter, Output } from "@angular/core";
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'register-step-two',
    standalone: true,
    imports: [
    SharedModule,
    BooIconComponent,
    BooButtonComponent
],
    template: `
        <div class="grid gap-4 min-w-full" id="step2">
            <div
                *ngFor="let role of roles"
                class="relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                [ngClass]="{
                    'shadow-xl ring-4 ring-offset-2': isSelected,
                    'shadow-md': !isSelected
                }"
              >
                <div 
                    class="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg"
                    *ngIf="isSelected"
                >
                    <boo-icon 
                        [size]="32" 
                        classname='' 
                    />
                </div>

                <h3 class="text-xl font-bold text-gray-900 mb-1">
                  {{role.title}}
                </h3>

                <p class="text-sm text-gray-600 m-0 leading-relaxed">
                  {{role.description}}
                </p>
            </div>
            <div class="mt-10">
                <div class="flex items-center justify-between gap-5">
                    <boo-button
                        label="Previous"
                        [radius]="5"
                        (clicked)="onPrev.emit()"
                    ></boo-button>
                    <boo-button
                        label="Next"
                        [radius]="5"
                        (clicked)="onNext.emit()"
                    ></boo-button>
                </div>
            </div>
        </div>
    `
})

export class RegisterStepTwoComponent {
    // #region Inputs, Outputs, Properties
    isSelected: boolean = false;
    roles: { title: string, description: string}[] = [];
    @Output() onNext = new EventEmitter<MouseEvent>();
    @Output() onPrev = new EventEmitter<MouseEvent>();
    // #endregion
}