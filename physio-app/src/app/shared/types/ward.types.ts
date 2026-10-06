export interface Ward {
  id: string;
  name: string;
  code?: string | null;
  floor: number;
  departmentId?: string | null;
  department?: string | null;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  maintenanceBeds: number;
  reservedBeds: number;
}

export interface CreateWardRequest {
  code: string | null;
  name: string;
  floor: number;
  departmentId: string | null;
}

export type UpdateWardRequest = CreateWardRequest;

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
