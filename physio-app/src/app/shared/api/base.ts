export const BASE_API = {
  VERSION: '/api/config/version',
  CONFIG: 'api/config',
  MENU: '/api/admin-menus/search',
  PROFILE: '/api/users/me',
  LOGIN: '/api/users/login',
  OAUTHLOGIN: '/api/users/oauth-login',
  LOGOUT: '/api/users/refresh/logout',
  REGISTER: '/api/users/register',
  MEDICALSPECIALTY: {
    SEARCH: '/api/medical-specialties/search',
    SEARCH_BY_ID: '/api/medical-specialties/search-by-id',
    CREATE: '/api/medical-specialties/create',
    DELETE: '/api/medical-specialties/delete',
    UPDATE: '/api/medical-specialties/update'
  }
};