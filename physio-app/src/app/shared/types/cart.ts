import { Medicine } from "./medicine";

export interface CartItem extends Medicine {
  quantity: number;
  discount: number;
  total: number;
}