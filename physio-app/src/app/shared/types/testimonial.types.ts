/** Patient testimonial on the home page (api/home-testimonials). */
export interface Testimonial {
  id: string;
  patientName: string;
  rating: number;
  comment: string | null;
  date: string | null;
  active: boolean;
}

/**
 * Create (POST) and update (PATCH) body. On update, a null field is left unchanged, except `date`:
 * the server always writes it, so every update must send the date to keep.
 */
export interface SaveTestimonialRequest {
  patientName?: string | null;
  rating?: number | null;
  comment?: string | null;
  date: string | null;
  active?: boolean | null;
}
