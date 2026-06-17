import { Component, EventEmitter, Input, Output, Signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { Permission } from "../../../../shared/types/permission";
import { ColorUtils } from "../../../../shared/utils/color.utils";

@Component({
    selector: 'admin-user-permission-permission-tab',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent
    ],
    template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        *ngFor="let g of permissionGroups()"
        class="bg-surface rounded-lg border border-gray-200 overflow-hidden"
      >
        <div
          class="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50"
        >
          <div class="flex items-center gap-2">
            <boo-icon
              name="folder"
              iconClass="w-4 h-4 text-secondary"
            ></boo-icon>
            <h3 class="text-sm font-semibold text-primary m-0">
              {{ g.category }}
            </h3>
            <span class="text-xs text-secondary">({{ g.items.length }})</span>
          </div>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            *ngFor="let p of g.items"
            class="px-5 py-3 flex items-start justify-between gap-3 hover:bg-gray-50/60 group"
          >
            <div class="flex items-start gap-3 min-w-0">
              <div
                class="w-8 h-8 rounded-md bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5"
              >
                <boo-icon
                  name="key"
                  iconClass="w-4 h-4 text-primary"
                ></boo-icon>
              </div>
              <div class="min-w-0">
                <div class="text-sm font-medium text-primary">{{ p.name }}</div>
                <div class="text-xs text-secondary truncate">
                  {{ p.description || p.code }}
                </div>
                <div class="text-[10px] font-mono text-gray-400 mt-0.5">
                  {{ p.code }}
                </div>
              </div>
            </div>
            <div
              class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                (click)="onEditClick(p)"
                class="p-1.5 hover:bg-primary/10 rounded text-primary"
                title="Edit"
              >
                <boo-icon name="pencil" iconClass="w-3.5 h-3.5"></boo-icon>
              </button>
              <button
                (click)="onDeleteClick(p)"
                class="p-1.5 hover:bg-red-50 rounded text-red-500"
                title="Delete"
              >
                <boo-icon name="trash-2" iconClass="w-3.5 h-3.5"></boo-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      *ngIf="!permissionGroups().length"
      class="bg-surface rounded-lg border border-dashed border-gray-300 py-16 text-center"
    >
      <div
        class="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3"
      >
        <boo-icon name="key" iconClass="w-6 h-6 text-gray-400"></boo-icon>
      </div>
      <div class="text-sm font-medium text-primary mb-1">
        No permissions defined
      </div>
      <div class="text-xs text-secondary">
        Create your first permission to start composing roles.
      </div>
    </div>
    `
})

export class AdminUserPermissionPermissionTabComponent {
    // #region Inputs, Outputs, Properties
    @Input({ required: true }) permissionGroups!: Signal<{
        category: string;
        items: Permission[];
    }[]>;
    @Output() editClick = new EventEmitter<Permission>();
    @Output() deleteClick = new EventEmitter<Permission>();

    ColorUtils = ColorUtils;
    // #endregion

    // #region Methods
    onEditClick(permission: Permission) {
        this.editClick.emit(permission);
    }

    onDeleteClick(permission: Permission) {
        this.deleteClick.emit(permission);
    }
    // #endregion
}