import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { CLIENT_TENANT } from "../../shared/data/client-site";
import { PublicSiteProfile } from "../../shared/types/public-site.types";

/**
 * Tenant profile of the public website (contact details and hero photo).
 * Placeholder: GET /api/public/site-profile does not exist yet (proposed in docs/home-redesign.md, section 17), so this
 * returns the static defaults. Swap the body for an HttpClient call when the endpoint ships; callers keep working.
 */
@Injectable({ providedIn: 'root' })
export class PublicSiteService {
    getProfile(): Observable<PublicSiteProfile> {
        return of({ phone: CLIENT_TENANT.phone, email: CLIENT_TENANT.email, hero: null });
    }
}
