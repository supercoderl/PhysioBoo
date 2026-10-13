import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, shareReplay } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { LocationOption } from "../../shared/types/location.types";

@Injectable({ providedIn: 'root' })
export class LocationService {
    private readonly cache = new Map<string, Observable<PagedResponse<LocationOption[]>>>();

    constructor(private http: HttpClient) { }

    getCountries(): Observable<LocationOption[]> {
        return this.fromApi(BASE_API.LOCATION.COUNTRIES);
    }

    getCities(countryId: string): Observable<LocationOption[]> {
        return this.fromApi(`${BASE_API.LOCATION.COUNTRIES}/${countryId}/cities`);
    }

    getDistricts(cityId: string): Observable<LocationOption[]> {
        return this.fromApi(`${BASE_API.LOCATION.CITIES}/${cityId}/districts`);
    }

    getWards(districtId: string): Observable<LocationOption[]> {
        return this.fromApi(`${BASE_API.LOCATION.DISTRICTS}/${districtId}/wards`);
    }

    /** Reference data rarely changes (the server caches it for a day), so each URL is requested once per session. */
    private fromApi(url: string): Observable<LocationOption[]> {
        let request = this.cache.get(url);
        if (!request) {
            request = this.http.get<PagedResponse<LocationOption[]>>(url).pipe(shareReplay(1));
            this.cache.set(url, request);
        }
        return request.pipe(map(res => res.success ? res.data ?? [] : []));
    }
}
