import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { RegisterTenantRequest } from "../../shared/types/tenant.types";

@Injectable({ providedIn: 'root' })
export class TenantOnboardingService {
    constructor(private http: HttpClient) { }

    registerTenant(request: RegisterTenantRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.TENANT.REGISTER, request);
    }
}
