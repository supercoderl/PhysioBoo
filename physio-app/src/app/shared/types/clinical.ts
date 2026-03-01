export interface MedicineCategory {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    parentCategoryId: string | null;
    isControlled: boolean;
    requiresPrescription: boolean;
    storageConditions: string | null;
    createdAt: Date;
}