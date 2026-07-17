import { Component, EventEmitter, Input, Output, WritableSignal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { SharedModule } from "../../../../../shared/shared-imports";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: "user-permission-permission-drawer",
    standalone: true,
    imports: [
        DrawerComponent, 
        BooIconComponent, 
        BooInputComponent, 
        BooTextareaComponent, 
        BooCheckboxComponent, 
        BooButtonAdminComponent,
        SharedModule
    ],
    template: `
        <drawer
            [isOpen]="isOpen"
            [isShowDialog]="true"
            [width]="540"
            (close)="onClose()"
        >
            <div class="flex flex-col h-full bg-surface" [formGroup]="form">
                <div
                    class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between"
                >
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ selectedPermissionId() ? "Edit Permission" : "New Permission" }}
                        </h2>
                        <p class="text-sm text-secondary m-0">
                            An atomic access right that can be attached to roles
                        </p>
                    </div>
                    <button
                        (click)="onClose()"
                        class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-4" custom-scrollbar>
                    <boo-input
                        label="Name"
                        formControlName="name"
                        placeholder="Ex: View Patients"
                        required
                    ></boo-input>
                    <boo-input
                        label="Code"
                        formControlName="code"
                        placeholder="Ex: PATIENTS_VIEW"
                        required
                    ></boo-input>
                    <boo-input
                        label="Category"
                        formControlName="category"
                        placeholder="Ex: Patient Management"
                        required
                    ></boo-input>
                    <boo-textarea
                        label="Description"
                        formControlName="description"
                        [rows]="3"
                        placeholder="What does this permission allow?"
                    ></boo-textarea>

                    <div
                        class="flex items-center justify-between p-3 border rounded-lg border-gray-200"
                    >
                        <div>
                            <div class="text-sm font-medium text-primary">Active</div>
                            <div class="text-xs text-secondary">
                                Inactive permissions are hidden from role assignment
                            </div>
                        </div>
                        <boo-checkbox formControlName="isActive"></boo-checkbox>
                    </div>
                </div>

                <div
                    class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3"
                >
                    <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin
                    >
                    <boo-button-admin textColor="white" (click)="onSavePermission()">
                    {{ selectedPermissionId() ? "Save Changes" : "Create Permission" }}
                    </boo-button-admin>
                </div>
            </div>
        </drawer>
    `
})

export class UserPermissionPermissionDrawerComponent {
    // #region Inputs, Outputs, Properties
    @Input({ required: true }) isOpen: boolean = false;
    @Input({ required: true }) form!: FormGroup;
    @Input({ required: true }) selectedPermissionId!: WritableSignal<string | null>;
    @Output() close = new EventEmitter<void>();
    @Output() savePermission = new EventEmitter<void>();
    // #endregion

    // #region Methods
    onClose() {
        this.close.emit();
    }

    onSavePermission() {
        this.savePermission.emit();
    }
    // #endregion
}