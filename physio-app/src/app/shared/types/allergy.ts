export interface Allergy {
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
}