import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { User } from "../../shared/types/core.types";
import { HospitalGroup } from "../../shared/types/support.types";
import { HospitalGroupService } from "./hospital-group.service";
import { UserService } from "./user.service";

const SINGLE_ROW_QUERY = { pageNumber: 1, pageSize: 1, search: '', sort: 'createdAt:desc' };

const HOSPITAL_GROUP_FILTER = { start: '', end: '', isActive: null };

/** Platform-level read model for the Super Admin dashboard: the newest tenants and users. */
@Injectable({ providedIn: 'root' })
export class PlatformService {
    private readonly hospitalGroupSrv = inject(HospitalGroupService);
    private readonly userSrv = inject(UserService);

    getRecentTenants(limit = 5): Observable<HospitalGroup[]> {
        return this.hospitalGroupSrv.search({ ...SINGLE_ROW_QUERY, pageSize: limit, filter: HOSPITAL_GROUP_FILTER }).pipe(
            map(res => res.success ? res.data?.items ?? [] : [])
        );
    }

    getRecentUsers(limit = 5): Observable<User[]> {
        return this.userSrv.search({ ...SINGLE_ROW_QUERY, pageSize: limit, filter: { isActive: null } }).pipe(
            map(res => res.success ? res.data?.items ?? [] : [])
        );
    }
}
