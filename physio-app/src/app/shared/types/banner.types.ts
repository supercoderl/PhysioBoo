/** Hero banner on the home page (api/home-banners). Optional text fields come back null when empty. */
export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  order: number;
  active: boolean;
}

/** Create (POST) and update (PATCH) body. On update, a null field is left unchanged and an empty string clears it. */
export interface SaveBannerRequest {
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  order?: number | null;
  active?: boolean | null;
}
