import { Component, inject } from "@angular/core";
import { SettingSequenceTrackerDrawerComponent } from "../../../../../components/layout/admin/setting/sequence-tracker/sequence-tracker-drawer.component";
import { SettingSequenceTrackerTableCardComponent } from "../../../../../components/layout/admin/setting/sequence-tracker/sequence-tracker-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { SequenceTrackerService } from "../../../../../services/admin/sequence-tracker.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SortOption } from "../../../../../shared/types/sort";
import { SequenceTracker } from "../../../../../shared/types/system.types";
import { CommonCategoryListBase } from "../../common-category/common-category-list.base";

/** Sys_SequenceTrackerViewModelSortProvider sorts by record type and creation date only. */
const SEQUENCE_SORT_OPTIONS: SortOption[] = [
    { label: 'Recently added', value: '-createdAt' },
    { label: 'Oldest first', value: '+createdAt' },
    { label: 'Record type (A-Z)', value: '+entityType' },
    { label: 'Record type (Z-A)', value: '-entityType' },
];

/**
 * Settings > Sequence Tracker: the numbering rules behind auto-generated record codes (/api/sequence-trackers),
 * with server-side search by record type, sort and paging sized to the screen, like the Common Category lists.
 */
@Component({
    selector: 'setting-sequence-tracker-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        SettingSequenceTrackerTableCardComponent,
        SettingSequenceTrackerDrawerComponent
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class SettingSequenceTrackerListComponent extends CommonCategoryListBase<SequenceTracker> {
    override readonly sortOptions = SEQUENCE_SORT_OPTIONS;

    constructor() {
        const service = inject(SequenceTrackerService);
        super({
            service,
            noun: ['numbering rule', 'numbering rules'],
            permissions: {
                create: Permissions.Admin.SequenceTrackerCreate,
                update: Permissions.Admin.SequenceTrackerUpdate,
                delete: Permissions.Admin.SequenceTrackerDelete
            },
            itemName: item => `the ${item.entityType} numbering rule`,
        });
    }
}
