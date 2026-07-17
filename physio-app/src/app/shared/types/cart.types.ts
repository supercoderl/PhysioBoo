import { Medicine } from "./medicine.types";

export interface CartItem extends Medicine {
  quantity: number;
  discount: number;
  total: number;
}