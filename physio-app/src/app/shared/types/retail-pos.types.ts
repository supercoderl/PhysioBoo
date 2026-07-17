export type RetailCartStatus = 'Active' | 'Held';
export type RetailCustomerType = 'Patient' | 'WalkIn';
export type RetailPaymentMethod = 'Cash' | 'Card' | 'QR' | 'Insurance' | 'Mixed';
export type RetailSuggestionMode = 'Favorites' | 'RecentlySold' | 'Recommended';

export interface RetailMedicineCard {
    id: string;
    name: string;
    genericName: string;
    strength: string;
    packageLabel: string;
    category: string;
    manufacturer: string;
    batchNo: string;
    expiryDate: string;
    barcode: string;
    stock: number;
    price: number;
    mrp: number;
    insuranceCovered: boolean;
    promotionLabel?: string | null;
    isFavorite?: boolean;
    isRecentlySold?: boolean;
}

export interface RetailMedicineAlternative {
    id: string;
    name: string;
    manufacturer: string;
    price: number;
    stock: number;
}

export interface RetailInventoryMovement {
    date: string;
    type: 'In' | 'Out';
    quantity: number;
    reference: string;
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
    genericName: string;
    strength: string;
    packageLabel: string;
    unit: string;
    quantity: number;
    stock: number;
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

export interface RetailTransaction {
    id: string;
    transactionNumber: string;
    cashierName: string;
    customer: RetailCustomer | null;
    items: RetailCartLineItem[];
    subtotal: number;
    discountTotal: number;
    insuranceCoverage: number;
    vat: number;
    grandTotal: number;
    paymentSplits: RetailPaymentSplit[];
    amountTendered: number;
    changeDue: number;
    completedAt: string;
    status: 'Completed' | 'Refunded' | 'Suspended';
}

export interface RetailBestSeller {
    name: string;
    unitsSold: number;
}

export interface RetailInventoryInsight {
    lowStockCount: number;
    nearExpiryCount: number;
    outOfStockCount: number;
    bestSeller: RetailBestSeller | null;
    todayRevenue: number;
    todaySalesCount: number;
}

export interface RetailQuickCategory {
    label: string;
    value: string;
    icon: string;
}
