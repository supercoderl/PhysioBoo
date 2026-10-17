import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { PublicContactMessage, PublicContactMessageResult } from "../../shared/types/public-contact.types";

/** Contact form of the public website. The page shows its own error states, so no global toast. */
@Injectable({ providedIn: 'root' })
export class PublicContactService {
    constructor(private http: HttpClient) { }

    send(message: PublicContactMessage) {
        return this.http.post<PagedResponse<PublicContactMessageResult>>(BASE_API.PUBLIC.CONTACT.SEND, message, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_CONTACT.SEND, skipErrorToast: true })
        });
    }
}
