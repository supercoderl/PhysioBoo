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
    BASE: '/api/medical-specialties',
    SEARCH: '/api/medical-specialties/search'
  },
  APPOINTMENTTYPE: {
    BASE: '/api/appointment-types',
    SEARCH: '/api/appointment-types/search'
  },
  IMAGINGMODALITY: {
    BASE: '/api/imaging-modalities',
    SEARCH: '/api/imaging-modalities/search'
  },
  INSURANCECOMPANY: {
    BASE: '/api/insurance-companies',
    SEARCH: '/api/insurance-companies/search'
  },
  MANUFACTURER: {
    BASE: '/api/manufacturers',
    SEARCH: '/api/manufacturers/search'
  },
  MEDICINECATEGORY: {
    BASE: '/api/medicine-categories',
    SEARCH: '/api/medicine-categories/search'
  },
  SUPPLIER: {
    BASE: '/api/suppliers',
    SEARCH: '/api/suppliers/search'
  },
  LABTESTCATEGORY: {
    BASE: '/api/lab-test-categories',
    SEARCH: '/api/lab-test-categories/search',
    LOOKUP: '/api/lab-test-categories/lookup'
  },
  LABTEST: {
    BASE: '/api/lab-tests',
    SEARCH: '/api/lab-tests/search'
  },
  SEQUENCETRACKER: {
    BASE: '/api/sequence-trackers',
    SEARCH: '/api/sequence-trackers/search'
  },
  DOCTOR: {
    BASE: '/api/doctors',
    SEARCH: '/api/doctors/search'
  },
  ADMINMENU: {
    BASE: '/api/admin-menus',
    SEARCH: '/api/admin-menus/search'
  },
  HOSPITALGROUP: {
    BASE: '/api/hospital-groups',
    SEARCH: '/api/hospital-groups/search'
  },
  HOSPITAL: {
    BASE: '/api/hospitals',
    SEARCH: '/api/hospitals/search'
  },
  DEPARTMENT: {
    BASE: '/api/departments',
    SEARCH: '/api/departments/search'
  },
  PATIENT: {
    BASE: '/api/patients',
    SEARCH: '/api/patients/search'
  },
  USER: {
    BASE: '/api/users',
    SEARCH: '/api/users/search',
    SEARCH_BY_ID: '/api/users/me',
    REGISTER: '/api/users/register',
    ASSIGN_ROLE: '/api/users/assign-role-to-user'
  },
  ROLE: {
    BASE: '/api/roles',
    SEARCH: '/api/roles/search',
    CREATE: '/api/roles/create',
    ASSIGN_PERMISSION: '/api/roles/assign-permission-to-role'
  },
  PERMISSION: {
    BASE: '/api/permissions',
    SEARCH: '/api/permissions/search',
    CREATE: '/api/permissions/create',
  },
  PREFERENCE: {
    BASE: '/api/user-preferences',
    ME: '/api/users/me/preferences',
  },
  PRINT_TEMPLATE: {
    BASE: '/api/print-templates',
    SEARCH: '/api/print-templates/search',
    RENDER: '/api/print-templates/render',
    PLACEHOLDERS: '/api/print-templates/placeholders',
  },
};
