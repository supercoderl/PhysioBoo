export const BASE_API = {
  VERSION: '/api/config/version',
  CONFIG: 'api/config',
  MENU: '/api/admin-menus/search',
  PROFILE: '/api/users/me',
  LOGIN: '/api/users/login',
  OAUTHLOGIN: '/api/users/oauth-login',
  LOGOUT: '/api/users/refresh/logout',
  REGISTER: '/api/users/register',
  REFRESHTOKEN: 'api/users/refresh/refresh-token',
  FORGOTPASSWORD: '/api/users/forgot-password',
  MEDICALSPECIALTY: {
    SEARCH: '/api/medical-specialties/search',
    SEARCH_BY_ID: '/api/medical-specialties/search-by-id',
    CREATE: '/api/medical-specialties/create',
    DELETE: '/api/medical-specialties/delete',
    UPDATE: '/api/medical-specialties/update'
  },
  APPOINTMENTTYPE: {
    SEARCH: '/api/appointment-types/search',
    SEARCH_BY_ID: '/api/appointment-types/search-by-id',
    CREATE: '/api/appointment-types/create',
    DELETE: '/api/appointment-types/delete',
    UPDATE: '/api/appointment-types/update'
  },
  IMAGINGMODALITY: {
    SEARCH: '/api/imaging-modalities/search',
    SEARCH_BY_ID: '/api/imaging-modalities/search-by-id',
    CREATE: '/api/imaging-modalities/create',
    DELETE: '/api/imaging-modalities/delete',
    UPDATE: '/api/imaging-modalities/update'
  },
  INSURANCECOMPANY: {
    SEARCH: '/api/insurance-companies/search',
    SEARCH_BY_ID: '/api/insurance-companies/search-by-id',
    CREATE: '/api/insurance-companies/create',
    DELETE: '/api/insurance-companies/delete',
    UPDATE: '/api/insurance-companies/update'
  },
  MANUFACTURER: {
    SEARCH: '/api/manufacturers/search',
    SEARCH_BY_ID: '/api/manufacturers/search-by-id',
    CREATE: '/api/manufacturers/create',
    DELETE: '/api/manufacturers/delete',
    UPDATE: '/api/manufacturers/update'
  },
  MEDICINECATEGORY: {
    SEARCH: '/api/medicine-categories/search',
    SEARCH_BY_ID: '/api/medicine-categories/search-by-id',
    CREATE: '/api/medicine-categories/create',
    DELETE: '/api/medicine-categories/delete',
    UPDATE: '/api/medicine-categories/update'
  },
  SUPPLIER: {
    SEARCH: '/api/suppliers/search',
    SEARCH_BY_ID: '/api/suppliers/search-by-id',
    CREATE: '/api/suppliers/create',
    DELETE: '/api/suppliers/delete',
    UPDATE: '/api/suppliers/update'
  },
  LABTESTCATEGORY: {
    SEARCH: '/api/lab-test-categories/search',
    LOOKUP: '/api/lab-test-categories/lookup',
    SEARCH_BY_ID: '/api/lab-test-categories/search-by-id',
    CREATE: '/api/lab-test-categories/create',
    DELETE: '/api/lab-test-categories/delete',
    UPDATE: '/api/lab-test-categories/update'
  },
  LABTEST: {
    SEARCH: '/api/lab-tests/search',
    SEARCH_BY_ID: '/api/lab-tests/search-by-id',
    CREATE: '/api/lab-tests/create',
    DELETE: '/api/lab-tests/delete',
    UPDATE: '/api/lab-tests/update'
  },
  SEQUENCETRACKER: {
    SEARCH: '/api/sequence-trackers/search',
    SEARCH_BY_ID: '/api/sequence-trackers/search-by-id',
    CREATE: '/api/sequence-trackers/create',
    DELETE: '/api/sequence-trackers/delete',
    UPDATE: '/api/sequence-trackers/update'
  },
};