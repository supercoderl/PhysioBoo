import { HttpParams } from '@angular/common/http';

export function createHttpParams(request: any): HttpParams {
    let params = new HttpParams();

    if (!request) return params;

    Object.keys(request).forEach(key => {
        const value = request[key];

        if (value === null || value === undefined || value === '') {
            return;
        }

        if (key === 'filter' && typeof value === 'object') {
            Object.keys(value).forEach(filterKey => {
                const filterValue = value[filterKey];
                if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
                    params = params.append(`filter.${filterKey}`, filterValue.toString());
                }
            });
        }
        else if (key === 'filters' && typeof value === 'object') {
            Object.keys(value).forEach(dictKey => {
                const dictValue = value[dictKey];
                params = params.append(`Filters[${dictKey}]`, dictValue);
            });
        }

        else {
            params = params.append(key, value.toString());
        }
    });

    return params;
}