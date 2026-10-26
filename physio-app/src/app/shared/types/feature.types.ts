/** Highlighted feature on the home page (api/home-features). */
export interface Feature {
  id: string;
  icon: string | null;
  title: string;
  description: string | null;
  order: number;
  active: boolean;
}

/** Create (POST) and update (PATCH) body. On update, a null field is left unchanged and an empty string clears it. */
export interface SaveFeatureRequest {
  icon?: string | null;
  title?: string | null;
  description?: string | null;
  order?: number | null;
  active?: boolean | null;
}
