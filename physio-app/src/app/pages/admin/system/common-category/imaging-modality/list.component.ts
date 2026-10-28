import { Component, inject } from "@angular/core";
import { CommonCategoryImagingModalityDrawerComponent } from "../../../../../components/layout/admin/system/common-category/imaging-modality/imaging-modality-drawer.component";
import { CommonCategoryImagingModalityTableCardComponent } from "../../../../../components/layout/admin/system/common-category/imaging-modality/imaging-modality-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { ImagingModalityService } from "../../../../../services/admin/imaging-modality.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ImagingModality } from "../../../../../shared/types/laboratory-imaging.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-imaging-modality-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryImagingModalityTableCardComponent,
        CommonCategoryImagingModalityDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryImagingModalityListComponent extends CommonCategoryListBase<ImagingModality> {
    constructor() {
        const service = inject(ImagingModalityService);
        super({
            service,
            noun: ['imaging modality', 'imaging modalities'],
            permissions: {
                create: Permissions.Imaging.ImagingModalityCreate,
                update: Permissions.Imaging.ImagingModalityUpdate,
                delete: Permissions.Imaging.ImagingModalityDelete
            },
            itemName: item => item.name,
            filters: [
                { key: 'isActive', label: 'Status', type: 'boolean', value: null, trueLabel: 'Active', falseLabel: 'Inactive' },
                { key: 'requiresContrast', label: 'Contrast', type: 'boolean', value: null, trueLabel: 'Required', falseLabel: 'Not required' },
                { key: 'preparationRequired', label: 'Preparation', type: 'boolean', value: null, trueLabel: 'Required', falseLabel: 'Not required' },
            ]
        });
    }
}
