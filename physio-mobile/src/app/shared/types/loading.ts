/** Ported (trimmed to the requests the mobile app makes) from physio-app/src/app/shared/types/loading.ts. */
export const LoadingKeys = {
    USER: {
        LOGIN: { CREDENTIAL: 'user-login-credential' },
        REGISTER: 'user-register',
    },
    DOCTOR: { SEARCH: 'doctor-search', GET_BY_ID: 'doctor-get-by-id' },
    HOSPITAL: { SEARCH: 'hospital-search', GET_BY_ID: 'hospital-get-by-id' },
    DEPARTMENT: { SEARCH: 'department-search' },
    ARTICLE: { SEARCH: 'article-search', GET_BY_ID: 'article-get-by-id' },
    APPOINTMENT: { SEARCH: 'appointment-search', GET_BY_ID: 'appointment-get-by-id', CREATE: 'appointment-create' },
    MEDICAL_RECORD: {
        HISTORY: 'medical-record-history',
        PRESCRIPTIONS: 'medical-record-prescriptions',
        LAB: 'medical-record-lab',
        IMAGING: 'medical-record-imaging',
        BILLING: 'medical-record-billing',
    },
    PATIENT: { GET_BY_ID: 'patient-get-by-id', UPDATE: 'patient-update' },
} as const;

export type LoadingKey = string;
