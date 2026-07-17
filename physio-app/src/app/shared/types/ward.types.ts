export interface Ward {
  id: string;
  name: string;
  code?: string | null;
  floor: number;
  department?: string | null;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
}

export interface BedMapStats {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
  occupancyRate: number;
}

export interface BedMapSnapshot {
  wards: Ward[];
  beds: import('./bed.types').Bed[];
}
