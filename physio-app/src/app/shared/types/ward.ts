import { Bed } from "./bed";

export interface Ward {
  id: string;
  name: string;
  floor: number;
  totalBeds: number;
  availableBeds: number;
  beds: Bed[];
}