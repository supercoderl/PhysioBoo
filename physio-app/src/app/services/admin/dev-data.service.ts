import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { DevDataGenerateRequest, DevDataGenerateResult, DevDataModuleList } from "../../shared/types/dev-data.types";

/** Super Admin developer tooling: fill a tenant's real tables with fake module data (`api/superadmin/dev-data`). */
@Injectable({ providedIn: 'root' })
export class DevDataService {
    private readonly http = inject(HttpClient);

    getModules() {
        return this.http.get<PagedResponse<DevDataModuleList>>(BASE_API.DEVDATA.MODULES);
    }

    generate(moduleKey: string, request: DevDataGenerateRequest) {
        return this.http.post<PagedResponse<DevDataGenerateResult>>(`${BASE_API.DEVDATA.BASE}/${moduleKey}/generate`, request);
    }
}
