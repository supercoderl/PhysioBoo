import { HttpClient, HttpContext } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "src/app/shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { DoctorDeskSnapshot } from "../../shared/types/doctor-desk.types";

@Injectable({ providedIn: 'root' })
export class DoctorDeskService {
    // #region Inject Services
    private readonly http = inject(HttpClient);
    // #endregion

    // #region Methods
    /** Today's checked-in, in-progress and completed visits of the signed-in doctor. */
    getSnapshot(context?: HttpContext) {
        return this.http.get<PagedResponse<DoctorDeskSnapshot>>(BASE_API.DOCTOR_DESK.SNAPSHOT, { context });
    }
    // #endregion
}
