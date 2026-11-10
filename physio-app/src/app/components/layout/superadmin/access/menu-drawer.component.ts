import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { MenuService } from "../../../../services/admin/menu.service";
import { ToastService } from "../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { MenuItem } from "../../../../shared/types/menu.types";
import { Permission } from "../../../../shared/types/permission.types";
import { isKnownMenuIcon, MENU_ICON_NAMES, MenuArea, menuPermissionOf, SUPERADMIN_ROUTE_PREFIX } from "../../../../shared/utils/menu.utils";
import { DrawerComponent } from "../../../drawer/drawer.component";
import { BooIconSelectComponent } from "../../../select/boo-icon-select/boo-icon-select.component";
import { BooSelectComponent } from "../../../select/boo-select/boo-select.component";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";
import { BooButtonComponent, BooCheckboxComponent, BooFormFieldComponent, BooInputComponent } from '@physioboo/ui';

const knownIconValidator = (control: AbstractControl): ValidationErrors | null =>
    !control.value || isKnownMenuIcon(String(control.value).trim()) ? null : { unknownIcon: true };

/** Create / edit one menu row: a top-level section (no parent) or a page inside a section. */
@Component({
    selector: 'superadmin-menu-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooSelectComponent, BooIconSelectComponent, BooButtonAdminComponent, BooCheckboxComponent, BooButtonComponent, BooFormFieldComponent, BooInputComponent],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty" (close)="close.emit()">
            <div
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="menu-drawer-title"
                [formGroup]="form"
            >
                <div class="flex-none px-6 py-4 border-b border-borderGray/60 flex items-center justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="menu-drawer-title" class="text-lg font-bold text-regular leading-tight m-0">{{ title }}</h2>
                        <p class="text-sm text-secondary m-0">
                            {{ area === 'superadmin' ? 'Shown in the Super Admin sidebar.' : 'Shown in every tenant\\'s admin sidebar.' }}
                        </p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close" (click)="close.emit()">
                        <physio-icon name="x" />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-4" custom-scrollbar>
                    <boo-form-field label="Label" for="menu-label" required [error]="showError('label') ? 'Enter a label.' : null">
                        <boo-input [id]="'menu-label'" label="Label" formControlName="label" [maxlength]="80" size="small" />
                    </boo-form-field>

                    <div class="space-y-1">
                        <span class="block text-sm font-medium text-regular">Placement</span>
                        <boo-select
                            formControlName="parentId"
                            label="Top-level section"
                            [height]="36"
                            [options]="placementOptions"
                        ></boo-select>
                        <p class="text-[12px] text-secondary m-0">
                            {{ placementLocked ? 'This section still has pages, so it stays top-level.' : 'Sections are the headings in the sidebar; pages are the links under them.' }}
                        </p>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label for="menu-icon" class="text-sm font-medium text-regular">Icon <span class="text-danger" aria-hidden="true">*</span></label>
                            <boo-icon-select
                                inputId="menu-icon"
                                formControlName="icon"
                                label="Icon"
                                [icons]="iconNames"
                            ></boo-icon-select>
                        </div>
                        <boo-form-field label="Order" for="menu-order" helper="Lower numbers come first.">
                            <boo-input [id]="'menu-order'" label="Order" type="number" numberValue min="0" inputmode="numeric" formControlName="order" size="small" />
                        </boo-form-field>
                    </div>

                    <boo-form-field
                        label="Route"
                        for="menu-route"
                        required
                        [error]="showError('route') ? (area === 'superadmin' ? 'Enter a route that starts with ' + prefix + '.' : 'Enter a route.') : null"
                        [helper]="form.get('parentId')?.value ? '' : 'For a section this only marks which sidebar it belongs to.'"
                    >
                        <boo-input
                            [id]="'menu-route'"
                            class="font-mono"
                            formControlName="route"
                            [label]="area === 'superadmin' ? '/superadmin/users' : 'reception/booking/list'"
                            size="small"
                        />
                    </boo-form-field>

                    <div class="space-y-1">
                        <label *ngIf="permissionsFailed; else permissionTitle" for="menu-permission" class="text-sm font-medium text-regular">Permission <span class="text-danger" aria-hidden="true">*</span></label>
                        <ng-template #permissionTitle>
                            <span class="block text-sm font-medium text-regular">Permission <span class="text-danger" aria-hidden="true">*</span></span>
                        </ng-template>
                        <boo-select
                            *ngIf="!permissionsFailed"
                            formControlName="permissionCode"
                            label="Choose a permission"
                            required
                            [height]="36"
                            [options]="permissionOptions"
                        ></boo-select>
                        <boo-input
                            *ngIf="permissionsFailed"
                            [id]="'menu-permission'"
                            class="font-mono"
                            formControlName="permissionCode"
                            label="e.g. iam:user:read"
                            size="small"
                        />
                        <p *ngIf="showError('permissionCode')" class="text-[12px] text-danger m-0">Choose the permission a user needs to see this item.</p>
                        <p *ngIf="!showError('permissionCode') && permissionsFailed" class="text-[12px] text-secondary m-0">The permission list could not be loaded, so type the code.</p>
                    </div>

                    <boo-checkbox *ngIf="item" formControlName="isActive">
                        <span class="text-sm text-regular">Active (visible to users who have the permission)</span>
                    </boo-checkbox>
                </div>

                <div class="flex-none px-6 py-4 border-t border-borderGray/60 bg-black/[0.02] flex items-center justify-end gap-3">
                    <boo-button-admin (click)="close.emit()" background="transparent" textColor="rgb(var(--twc-regular))" padding="8px 16px" fontWeight="500">
                        Cancel
                    </boo-button-admin>
                    <boo-button-admin [disabled]="saving()" (click)="save()" textColor="white" padding="8px 16px" fontWeight="600">
                        {{ saving() ? 'Saving…' : 'Save' }}
                    </boo-button-admin>
                </div>
            </div>
        </drawer>
    `
})
export class SuperadminMenuDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    /** `null` creates a new row. */
    @Input() item: MenuItem | null = null;
    /** Parent of the row being edited, or the section a new page is added to; `null` = top level. */
    @Input() parentId: string | null = null;
    /** Sections of the current area, offered as the placement. */
    @Input() sections: MenuItem[] = [];
    @Input() area: MenuArea = 'superadmin';
    @Input() permissions: Permission[] = [];
    @Input() permissionsFailed = false;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    readonly prefix = SUPERADMIN_ROUTE_PREFIX;
    readonly iconNames = MENU_ICON_NAMES;
    placementOptions: { label: string; value: string }[] = [];
    permissionOptions: { label: string; value: string }[] = [];
    saving = signal(false);
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private menuSrv: MenuService,
        private toastSrv: ToastService
    ) {
        this.form = this.fb.group({
            label: ['', [Validators.required, Validators.maxLength(80)]],
            parentId: [null as string | null],
            icon: ['', [Validators.required, knownIconValidator]],
            order: [0, [Validators.min(0)]],
            route: ['', [Validators.required]],
            permissionCode: ['', [Validators.required]],
            isActive: [true],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isOpen && (changes['isOpen'] || changes['item'] || changes['parentId'])) this.resetForm();
        if (changes['permissions'] || changes['sections'] || changes['item'] || changes['isOpen']) this.rebuildOptions();
    }
    // #endregion

    // #region Methods
    get title(): string {
        const kind = this.parentId ? 'page' : 'section';
        return `${this.item ? 'Edit' : 'New'} ${kind}`;
    }

    /** A section that still has pages can't be moved into another section: the sidebar is two levels deep. */
    get placementLocked(): boolean {
        return !!this.item && !this.parentId && (this.item.children?.length ?? 0) > 0;
    }

    /** Sections a row can sit in: every section of this area except the row itself. */
    get parentOptions(): MenuItem[] {
        return this.sections.filter(s => s.id !== this.item?.id);
    }

    /**
     * Options for the two pickers. The API returns no category for a permission, but codes are `module:resource:action`,
     * so sorting by code groups each module together. A saved code that is no longer in the permission list stays selectable instead of silently resetting.
     */
    private rebuildOptions(): void {
        this.placementOptions = this.parentOptions.map(s => ({ label: `Inside “${s.label}”`, value: s.id }));

        const options = [...this.permissions]
            .sort((a, b) => a.code.localeCompare(b.code))
            .map(p => ({ label: `${p.code} — ${p.name}`, value: p.code }));

        const current = this.form.get('permissionCode')?.value as string;
        if (current && !this.permissions.some(p => p.code === current)) {
            options.unshift({ label: `${current} (current)`, value: current });
        }
        this.permissionOptions = options;
    }

    private resetForm(): void {
        const item = this.item;
        const route = this.form.get('route');
        route?.setValidators(this.area === 'superadmin'
            ? [Validators.required, Validators.pattern(/^\/superadmin(\/.*)?$/)]
            : [Validators.required]);

        const siblings = this.parentId
            ? this.sections.find(s => s.id === this.parentId)?.children ?? []
            : this.sections;

        this.form.reset({
            label: item?.label ?? '',
            parentId: this.parentId,
            icon: item?.icon ?? '',
            order: item?.order ?? (siblings.length ? Math.max(...siblings.map(s => s.order)) + 1 : 0),
            route: item?.route ?? (this.area === 'superadmin' && !this.parentId ? `${SUPERADMIN_ROUTE_PREFIX}/` : ''),
            permissionCode: item ? menuPermissionOf(item) : '',
            isActive: item?.isActive ?? true,
        });
        route?.updateValueAndValidity();
        this.placementLocked ? this.form.get('parentId')?.disable() : this.form.get('parentId')?.enable();
        this.form.markAsPristine();
    }

    showError(control: string): boolean {
        const c = this.form.get(control);
        return !!c && c.invalid && (c.touched || c.dirty);
    }

    async save(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toastSrv.error('Please fix the highlighted fields');
            return;
        }

        const v = this.form.getRawValue();
        const body = {
            label: String(v.label).trim(),
            icon: String(v.icon).trim(),
            parentId: v.parentId || null,
            route: String(v.route).trim(),
            order: Number(v.order) || 0,
            permissionCode: String(v.permissionCode).trim(),
        };

        this.saving.set(true);
        try {
            if (this.item) {
                await firstValueFrom(this.menuSrv.update(this.item.id, { ...body, isActive: !!v.isActive }));
            } else {
                const res = await firstValueFrom(this.menuSrv.create(body));
                if (!res.success) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
            }
            this.toastSrv.success(`"${body.label}" saved`);
            this.form.markAsPristine();
            this.saved.emit();
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        } finally {
            this.saving.set(false);
        }
    }
    // #endregion
}
