// Mirrors PhysioBoo.Application.ViewModels.Retail. Optional/nullable fields match the API; nothing is derived client-side.

export type RetailCartStatus = 'Active' | 'Held';
export type RetailCustomerType = 'Patient' | 'WalkIn';
/** Methods accepted by checkout. The API enum also has 'Mixed', which is a UI grouping, never sent as a split method. */
export type RetailPaymentMethod = 'Cash' | 'Card' | 'QR' | 'Insurance';
/** 'Recommended' is the API's best-selling-by-volume list over the last 30 days. */
export type RetailSuggestionMode = 'RecentlySold' | 'Recommended';

export interface RetailMedicineCard {
    id: string;
    name: string;
    genericName?: string | null;
    strength?: string | null;
    packageLabel?: string | null;
    category?: string | null;
    manufacturer?: string | null;
    batchNo?: string | null;
    expiryDate?: string | null;
    barcode?: string | null;
    stock: number;
    price: number;
    mrp?: number | null;
    insuranceCovered: boolean;
    isFavorite: boolean;
    isRecentlySold: boolean;
}

export interface RetailMedicineAlternative {
    id: string;
    name: string;
    manufacturer?: string | null;
    price: number;
    stock: number;
}

export interface RetailInventoryMovement {
    date: string;
    type: string;
    quantity: number;
    reference?: string | null;
}

export interface RetailMedicineDetail extends RetailMedicineCard {
    alternatives: RetailMedicineAlternative[];
    interactionWarnings: string[];
    inventoryMovements: RetailInventoryMovement[];
}

export interface RetailCartLineItem {
    id: string;
    medicineId: string;
    name: string;
    genericName?: string | null;
    strength?: string | null;
    unit: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    insuranceCoveredAmount: number;
    total: number;
}

export interface RetailCustomer {
    type: RetailCustomerType;
    patientId?: string | null;
    fullName: string;
    phone: string;
    mrn?: string | null;
    insuranceProvider?: string | null;
    insuranceCoverageAmount?: number | null;
    loyaltyPoints?: number | null;
    prescriptionReference?: string | null;
    allergyInformation?: string | null;
}

export interface RetailCart {
    id: string;
    name: string;
    status: RetailCartStatus;
    customer: RetailCustomer | null;
    items: RetailCartLineItem[];
    createdAt: string;
}

export interface RetailPaymentSplit {
    method: RetailPaymentMethod;
    amount: number;
}

export interface RetailTransactionLineItem {
    id: string;
    medicineId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    insuranceCoveredAmount: number;
    total: number;
}

export type RetailTransactionStatus = 'Completed' | 'Refunded' | 'Suspended';

export interface RetailTransaction {
    id: string;
    transactionNumber: string;
    cashierName: string;
    customer: RetailCustomer | null;
    items: RetailTransactionLineItem[];
    subtotal: number;
    discountTotal: number;
    insuranceCoverage: number;
    vat: number;
    grandTotal: number;
    paymentSplits: { method: string; amount: number }[];
    amountTendered: number;
    changeDue: number;
    completedAt: string;
    status: RetailTransactionStatus;
}

export interface RetailInventoryInsight {
    lowStockCount: number;
    nearExpiryCount: number;
    outOfStockCount: number;
    bestSellerName?: string | null;
    bestSellerUnitsSold?: number | null;
    todayRevenue: number;
    todaySalesCount: number;
}

/** Subset of MedicineCategoryViewModel used for the catalog category filter. */
export interface RetailCategory {
    id: string;
    name: string;
}

export interface RetailCatalogQuery {
    search: string;
    categoryId: string | null;
    pageNumber: number;
    pageSize: number;
}

export interface RetailCheckoutPayload {
    hospitalId: string;
    paymentSplits: RetailPaymentSplit[];
    amountTendered: number;
}
