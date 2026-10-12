import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";

export interface ImportResourceResult {
    inserted: number;
    updated: number;
}

/** Translation resources (`api/resources`): read one language, or import a resource file. */
@Injectable({ providedIn: 'root' })
export class ResourceService {
    private readonly http = inject(HttpClient);

    /** The server returns the language's resources as one JSON text. */
    search(languageCode: string) {
        return this.http.post<PagedResponse<string>>(BASE_API.RESOURCE.SEARCH, {}, { params: { code: languageCode } });
    }

    importLocal(file: File) {
        const body = new FormData();
        body.append('file', file);
        return this.http.post<PagedResponse<ImportResourceResult>>(BASE_API.RESOURCE.IMPORT_LOCAL, body);
    }

    importRemote(url: string) {
        return this.http.post<PagedResponse<ImportResourceResult>>(BASE_API.RESOURCE.IMPORT_REMOTE, { url });
    }
}
