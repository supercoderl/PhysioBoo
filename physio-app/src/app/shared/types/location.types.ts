/** One entry of a location level (country, city, district or ward). Mirrors the proposed `api/locations/*` response items. */
export interface LocationOption {
    id: string;
    name: string;
    code?: string | null;
}

/** Value of `boo-location-select`: the selected id of every level, `null` while unset. */
export interface LocationValue {
    countryId: string | null;
    cityId: string | null;
    districtId: string | null;
    wardId: string | null;
}

export const EMPTY_LOCATION_VALUE: LocationValue = {
    countryId: null,
    cityId: null,
    districtId: null,
    wardId: null
};
