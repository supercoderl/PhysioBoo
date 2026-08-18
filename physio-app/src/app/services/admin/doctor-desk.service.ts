import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "src/app/shared/api/base";
import { LoadingKeys } from "src/app/shared/types/loading";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse } from "../../shared/types/common";
import { DoctorDeskSnapshot } from "../../shared/types/doctor-desk.types";

@Injectable({ providedIn: 'root' })
export class DoctorDeskService {
    // #region Inject Services
    private readonly http = inject(HttpClient);
    // #endregion

    // #region Methods
    getSnapshot() {
        return this.http.get<PagedResponse<DoctorDeskSnapshot>>(BASE_API.DOCTOR_DESK.SNAPSHOT, {
            context: createHttpContext({ loadingKey: LoadingKeys.DOCTOR_DESK.SNAPSHOT }),
        });
    }
    // #endregion
}
