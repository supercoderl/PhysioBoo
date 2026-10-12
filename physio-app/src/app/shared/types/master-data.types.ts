import { EventEmitter, Type } from "@angular/core";
import { Observable } from "rxjs";
import { PagedRequest, PagedResponse, PaginationData } from "./common";
import { FilterConfig } from "./filter.types";
import { SortOption } from "./sort";

/** One column of a Master Data list. The first column is always the (clickable) name. */
export interface MasterDataColumn {
    /** Property on the row. */
    key: string;
    label: string;
    kind?: 'text' | 'number' | 'boolean' | 'badge';
    align?: 'left' | 'right' | 'center';
    /** Derives the displayed text from the row (enum labels, units…). Return `null` to show "—". */
    format?: (row: any) => string | null;
}

/** What every catalog drawer in `admin/system/common-category` exposes; they were generated from one template. */
export interface MasterDataDrawer {
    isOpen: boolean;
    currentId: string | null;
    close: EventEmitter<void>;
    saveSuccess: EventEmitter<any>;
    delete: EventEmitter<string>;
}

/** Everything the generic Master Data list needs to manage one platform-wide catalog. */
export interface MasterDataConfig {
    slug: string;
    /** `master-data` catalogs appear on the Master Data hub; `platform` collections have their own menu entry. */
    group: 'master-data' | 'platform';
    /** Plural, e.g. "Lab tests". */
    title: string;
    /** Singular, lower-case, e.g. "lab test". */
    singular: string;
    description: string;
    /** Registered Lucide icon name (kebab-case). */
    icon: string;
    /** Permission required to open the catalog. */
    permission: string;
    /** Property holding the display name (used for the clickable first column). */
    nameKey: string;
    columns: MasterDataColumn[];
    filters: FilterConfig[];
    /** Overrides the default Recent / Oldest / Name / Code options when the server sorts on other fields. */
    sortOptions?: SortOption[];
    search: (request: PagedRequest<any>) => Observable<PagedResponse<PaginationData<any>>>;
    remove: (id: string) => Observable<unknown>;
    drawer: Type<MasterDataDrawer>;
}
