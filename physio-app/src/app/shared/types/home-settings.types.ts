/** The tenant's home page settings (api/home-settings). Before the first save the server returns empty values. */
export interface HomeSettings {
  hospitalName: string;
  tagLine: string | null;
  welcomeMessage: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  address: string | null;
  showEmergencyBanner: boolean;
}
