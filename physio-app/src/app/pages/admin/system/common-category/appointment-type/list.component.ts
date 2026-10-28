import { Component, inject } from "@angular/core";
import { CommonCategoryAppointmentTypeDrawerComponent } from "../../../../../components/layout/admin/system/common-category/appointment-type/appointment-type-drawer.component";
import { CommonCategoryAppointmentTypeTableCardComponent } from "../../../../../components/layout/admin/system/common-category/appointment-type/appointment-type-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { AppointmentTypeService } from "../../../../../services/admin/appointment-type.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { AppointmentType } from "../../../../../shared/types/operation.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-appointment-type-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryAppointmentTypeTableCardComponent,
        CommonCategoryAppointmentTypeDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryAppointmentTypeListComponent extends CommonCategoryListBase<AppointmentType> {
    constructor() {
        const service = inject(AppointmentTypeService);
        super({
            service,
            noun: ['appointment type', 'appointment types'],
            permissions: {
                create: Permissions.Scheduling.AppointmentTypeCreate,
                update: Permissions.Scheduling.AppointmentTypeUpdate,
                delete: Permissions.Scheduling.AppointmentTypeDelete
            },
            itemName: item => item.name,
            filters: [
                { key: 'isActive', label: 'Status', type: 'boolean', value: null, trueLabel: 'Active', falseLabel: 'Inactive' },
                { key: 'isEmergency', label: 'Emergency', type: 'boolean', value: null, trueLabel: 'Yes', falseLabel: 'No' },
                { key: 'isFollowUp', label: 'Follow-up', type: 'boolean', value: null, trueLabel: 'Yes', falseLabel: 'No' },
                { key: 'requiresPreparation', label: 'Preparation', type: 'boolean', value: null, trueLabel: 'Required', falseLabel: 'Not required' },
            ]
        });
    }
}
