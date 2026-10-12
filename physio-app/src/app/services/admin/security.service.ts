import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { BlockIpRequest } from "../../shared/types/audit-log.types";
import { PagedResponse } from "../../shared/types/common";

/** Platform-level IP blocking (`api/systems`). The API has no list endpoint yet. */
@Injectable({ providedIn: 'root' })
export class SecurityService {
    private readonly http = inject(HttpClient);

    blockIp(request: BlockIpRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.SYSTEM.BLOCK_IP, request);
    }

    unblockIp(ipAddress: string) {
        return this.http.post<PagedResponse<string>>(BASE_API.SYSTEM.UNBLOCK_IP, { ipAddress });
    }
}
