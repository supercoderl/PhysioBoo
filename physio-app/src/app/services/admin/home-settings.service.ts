import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { HomeSettings } from "../../shared/types/home-settings.types";

@Injectable({ providedIn: 'root' })
export class HomeSettingsService {
    constructor(private http: HttpClient) { }

    get() {
        return this.http.get<PagedResponse<HomeSettings>>(BASE_API.HOME_SETTINGS.BASE);
    }

    update(params: HomeSettings) {
        return this.http.put<PagedResponse<HomeSettings>>(BASE_API.HOME_SETTINGS.BASE, params);
    }
}
