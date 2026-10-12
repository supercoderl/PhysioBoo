import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, shareReplay } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { LocationOption } from "../../shared/types/location.types";

const USE_PLACEHOLDER_DATA = true;
const PLACEHOLDER_PATH = 'assets/data/locations';

type PlaceholderFile = 'cities' | 'districts' | 'wards';

@Injectable({ providedIn: 'root' })
export class LocationService {
    private readonly cache = new Map<string, Observable<any>>();

    constructor(private http: HttpClient) { }

    getCountries(): Observable<LocationOption[]> {
        return USE_PLACEHOLDER_DATA
            ? this.cached<LocationOption[]>(`${PLACEHOLDER_PATH}/countries.json`)
            : this.fromApi(BASE_API.LOCATION.COUNTRIES);
    }

    getCities(countryId: string): Observable<LocationOption[]> {
        return USE_PLACEHOLDER_DATA
            ? this.fromPlaceholder('cities', countryId)
            : this.fromApi(`${BASE_API.LOCATION.COUNTRIES}/${countryId}/cities`);
    }

    getDistricts(cityId: string): Observable<LocationOption[]> {
        return USE_PLACEHOLDER_DATA
            ? this.fromPlaceholder('districts', cityId)
            : this.fromApi(`${BASE_API.LOCATION.CITIES}/${cityId}/districts`);
    }

    getWards(districtId: string): Observable<LocationOption[]> {
        return USE_PLACEHOLDER_DATA
            ? this.fromPlaceholder('wards', districtId)
            : this.fromApi(`${BASE_API.LOCATION.DISTRICTS}/${districtId}/wards`);
    }

    private fromPlaceholder(file: PlaceholderFile, parentId: string): Observable<LocationOption[]> {
        return this.cached<Record<string, LocationOption[]>>(`${PLACEHOLDER_PATH}/${file}.json`)
            .pipe(map(byParent => byParent[parentId] ?? []));
    }

    private fromApi(url: string): Observable<LocationOption[]> {
        return this.cached<PagedResponse<LocationOption[]>>(url).pipe(map(res => res.success ? res.data ?? [] : []));
    }

    private cached<T>(url: string): Observable<T> {
        let request = this.cache.get(url);
        if (!request) {
            request = this.http.get<T>(url).pipe(shareReplay(1));
            this.cache.set(url, request);
        }
        return request;
    }
}
