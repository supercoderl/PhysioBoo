/**
 * Ported (trimmed to the endpoints Foundation + Guest + Patient calls) from
 * physio-app/src/app/shared/api/base.ts. Values must stay identical to the web app's —
 * these are the existing backend contracts, not new endpoints.
 */
export const BASE_API = {
    PROFILE: '/api/users/me',
    LOGIN: '/api/users/login',
    OAUTHLOGIN: '/api/users/oauth-login',
    LOGOUT: '/api/users/refresh/logout',
    REGISTER: '/api/users/register',
    REFRESHTOKEN: 'api/users/refresh/refresh-token',
    FORGOTPASSWORD: '/api/users/forgot-password',
    RESETPASSWORD: '/api/users/reset-password',
    USER: {
        CHECK_AUTH: '/api/users/check-auth',
    },
    DOCTOR: {
        BASE: '/api/doctors',
        SEARCH: '/api/doctors/search',
    },
    HOSPITAL: {
        BASE: '/api/hospitals',
        SEARCH: '/api/hospitals/search',
    },
    DEPARTMENT: {
        BASE: '/api/departments',
        SEARCH: '/api/departments/search',
    },
    ARTICLE: {
        BASE: '/api/articles',
        SEARCH: '/api/articles/search',
    },
    MEDICALSPECIALTY: {
        BASE: '/api/medical-specialties',
        SEARCH: '/api/medical-specialties/search',
    },
    PATIENT: {
        BASE: '/api/patients',
        SEARCH: '/api/patients/search',
    },
    APPOINTMENT: {
        BASE: '/api/appointments',
        SEARCH: '/api/appointments/search',
    },
    MEDICAL_RECORD: {
        HISTORY: (patientId: string) => `/api/medical-records/${patientId}/history`,
        PRESCRIPTIONS: (patientId: string) => `/api/medical-records/${patientId}/prescriptions`,
        LAB: (patientId: string) => `/api/medical-records/${patientId}/lab`,
        IMAGING: (patientId: string) => `/api/medical-records/${patientId}/imaging`,
        BILLING: (patientId: string) => `/api/medical-records/${patientId}/billing`,
    },
} as const;
