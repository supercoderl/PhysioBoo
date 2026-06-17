import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";

@Injectable({ providedIn: 'root' })
export class LoggerService {
    info(message: string, data?: unknown) {
        console.info(`[INFO] ${message}`, data ?? '');
    }

    warn(message: string, data?: unknown) {
        console.warn(`[WARN] ${message}`, data ?? '');
    }

    error(message: string, data?: unknown) {
        console.error(`[ERROR] ${message}`, data ?? '');
    }

    debug(message: string, data?: unknown) {
        if (!environment.PRODUCTION) {
            console.debug(`[DEBUG] ${message}`, data ?? '');
        }
    }
}