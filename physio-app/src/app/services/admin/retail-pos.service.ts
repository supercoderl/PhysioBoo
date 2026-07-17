import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PaginationData, PaginationDataWithInit } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
  RetailCart,
  RetailCustomer,
  RetailInventoryInsight,
  RetailMedicineCard,
  RetailMedicineDetail,
  RetailPaymentSplit,
  RetailQuickCategory,
  RetailSuggestionMode,
  RetailTransaction,
} from "../../shared/types/retail-pos.types";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class RetailPosService {
  // #region Inject Services
  private readonly httpSrv = inject(HttpService);
  // #endregion

  // #region Methods
  searchCatalog() {
    return this.httpSrv.getOr<PaginationData<RetailMedicineCard>>(BASE_API.PHARMACY_RETAIL.CATALOG_SEARCH, MOCK.catalog(), LoadingKeys.RETAIL_POS.CATALOG_SEARCH);
  }

  lookupByBarcode(code: string) {
    const match = MOCK.catalog().items.find(m => m.barcode === code) ?? null;
    return this.httpSrv.getOr<RetailMedicineCard | null>(BASE_API.PHARMACY_RETAIL.CATALOG_BARCODE(code), match, LoadingKeys.RETAIL_POS.CATALOG_BARCODE);
  }

  getMedicineDetail(medicineId: string) {
    return this.httpSrv.getOr<RetailMedicineDetail>(BASE_API.PHARMACY_RETAIL.CATALOG_DETAIL(medicineId), MOCK.medicineDetail(medicineId), LoadingKeys.RETAIL_POS.CATALOG_DETAIL);
  }

  getSuggestions(mode: RetailSuggestionMode) {
    return this.httpSrv.getOr<RetailMedicineCard[]>(BASE_API.PHARMACY_RETAIL.CATALOG_SUGGESTIONS(mode), MOCK.suggestions(mode), LoadingKeys.RETAIL_POS.CATALOG_SUGGESTIONS);
  }

  getQuickCategories() {
    return this.httpSrv.getOr<RetailQuickCategory[]>('/api/medicine-categories/search', MOCK.quickCategories, LoadingKeys.RETAIL_POS.CATEGORIES);
  }

  getInsight() {
    return this.httpSrv.getOr<RetailInventoryInsight>(BASE_API.PHARMACY_RETAIL.INSIGHT, MOCK.insight, LoadingKeys.RETAIL_POS.INSIGHT);
  }

  getCarts() {
    return this.httpSrv.getOr<RetailCart[]>(BASE_API.PHARMACY_RETAIL.CARTS, MOCK.carts(), LoadingKeys.RETAIL_POS.CARTS);
  }

  createCart(name?: string) {
    return this.httpSrv.postOr<RetailCart>(BASE_API.PHARMACY_RETAIL.CARTS, { name }, MOCK.newCart(name), LoadingKeys.RETAIL_POS.CREATE_CART);
  }

  upsertCartItem(cartId: string, medicineId: string, quantity: number, discountPercent: number) {
    return this.httpSrv.putOr<RetailCart>(BASE_API.PHARMACY_RETAIL.CART_ITEM(cartId, medicineId), { quantity, discountPercent }, null as any, LoadingKeys.RETAIL_POS.UPSERT_CART);
  }

  removeCartItem(cartId: string, lineItemId: string) {
    return this.httpSrv.postOr<RetailCart>(BASE_API.PHARMACY_RETAIL.CART_ITEM_REMOVE(cartId, lineItemId), {}, null as any, LoadingKeys.RETAIL_POS.REMOVE_CART);
  }

  attachCustomer(cartId: string, customer: RetailCustomer) {
    return this.httpSrv.patchOr<RetailCart>(BASE_API.PHARMACY_RETAIL.CART_CUSTOMER(cartId), customer, null as any, LoadingKeys.RETAIL_POS.ATTACH_CUSTOMER);
  }

  suspendCart(cartId: string) {
    return this.httpSrv.postOr<RetailCart>(BASE_API.PHARMACY_RETAIL.CART_SUSPEND(cartId), {}, null as any, LoadingKeys.RETAIL_POS.SUSPEND_CART);
  }

  resumeCart(cartId: string) {
    return this.httpSrv.postOr<RetailCart>(BASE_API.PHARMACY_RETAIL.CART_RESUME(cartId), {}, null as any, LoadingKeys.RETAIL_POS.RESUME_CART);
  }

  searchPatients(query: string) {
    const q = query.toLowerCase();
    const filtered = MOCK.patients.filter(p => p.fullName.toLowerCase().includes(q) || (p.mrn ?? '').toLowerCase().includes(q) || p.phone.includes(q));
    return this.httpSrv.getOr<RetailCustomer[]>(BASE_API.PHARMACY_RETAIL.PATIENTS_SEARCH, filtered, LoadingKeys.RETAIL_POS.PATIENTS_SEARCH);
  }

  checkout(cartId: string, paymentSplits: RetailPaymentSplit[], amountTendered: number, cart: RetailCart) {
    return this.httpSrv.postOr<RetailTransaction>(BASE_API.PHARMACY_RETAIL.CART_CHECKOUT(cartId), { paymentSplits, amountTendered }, MOCK.transactionFromCart(cart, paymentSplits, amountTendered), LoadingKeys.RETAIL_POS.CHECKOUT);
  }

  // #endregion
}

// ─────────────────────────────────────────────────────────────────────────────
// Bundled mock data — used until backend endpoints land.
// ─────────────────────────────────────────────────────────────────────────────
let cartCounter = 0;
let lineItemCounter = 0;

const MOCK = {
  quickCategories: <RetailQuickCategory[]>[
    { label: 'All', value: '', icon: 'layout-grid' },
    { label: 'Tablet', value: 'Tablet', icon: 'pill' },
    { label: 'Syrup', value: 'Syrup', icon: 'flask-conical' },
    { label: 'Injection', value: 'Injection', icon: 'syringe' },
    { label: 'Capsule', value: 'Capsule', icon: 'pill' },
    { label: 'Ointment', value: 'Ointment', icon: 'package' },
    { label: 'OTC', value: 'OTC', icon: 'shopping-bag' },
  ],

  catalog: (): PaginationData<RetailMedicineCard> => ({
    ...PaginationDataWithInit<RetailMedicineCard>(),
    items: [
      { id: 'm-1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', strength: '500mg', packageLabel: 'Strip of 10', category: 'Tablet', manufacturer: 'PharmaCo', batchNo: 'BT2024001', expiryDate: '12/2025', barcode: '8901001', stock: 150, price: 2.5, mrp: 3.0, insuranceCovered: true, isFavorite: true, isRecentlySold: true },
      { id: 'm-2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', strength: '250mg', packageLabel: 'Strip of 10', category: 'Capsule', manufacturer: 'MediLife', batchNo: 'BT2024002', expiryDate: '08/2025', barcode: '8901002', stock: 80, price: 5.0, mrp: 6.0, insuranceCovered: true },
      { id: 'm-3', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', strength: '400mg', packageLabel: 'Strip of 10', category: 'Tablet', manufacturer: 'HealthCare+', batchNo: 'BT2024003', expiryDate: '03/2026', barcode: '8901003', stock: 200, price: 3.0, mrp: 3.5, insuranceCovered: false, isRecentlySold: true },
      { id: 'm-4', name: 'Cough Syrup', genericName: 'Dextromethorphan', strength: '100mg/5mL', packageLabel: 'Bottle 100mL', category: 'Syrup', manufacturer: 'WellMed', batchNo: 'BT2024004', expiryDate: '06/2025', barcode: '8901004', stock: 45, price: 8.5, mrp: 10.0, insuranceCovered: false, promotionLabel: 'Buy 1 Get 10% Off' },
      { id: 'm-5', name: 'Insulin Glargine', genericName: 'Insulin Glargine', strength: '100IU/mL', packageLabel: 'Pen 3mL', category: 'Injection', manufacturer: 'BioPharm', batchNo: 'BT2024005', expiryDate: '11/2025', barcode: '8901005', stock: 25, price: 35.0, mrp: 40.0, insuranceCovered: true, isFavorite: true },
      { id: 'm-6', name: 'Antiseptic Cream', genericName: 'Povidone-Iodine', strength: '10%', packageLabel: 'Tube 20g', category: 'Ointment', manufacturer: 'SkinCare', batchNo: 'BT2024006', expiryDate: '09/2025', barcode: '8901006', stock: 5, price: 4.5, mrp: 5.5, insuranceCovered: false },
      { id: 'm-7', name: 'Vitamin D3', genericName: 'Cholecalciferol', strength: '1000IU', packageLabel: 'Bottle of 60', category: 'OTC', manufacturer: 'NutriHealth', batchNo: 'BT2024007', expiryDate: '12/2026', barcode: '8901007', stock: 0, price: 12.0, mrp: 14.0, insuranceCovered: false },
      { id: 'm-8', name: 'Metformin 500mg', genericName: 'Metformin HCl', strength: '500mg', packageLabel: 'Strip of 10', category: 'Tablet', manufacturer: 'DiabCare', batchNo: 'BT2024008', expiryDate: '04/2026', barcode: '8901008', stock: 120, price: 6.5, mrp: 7.5, insuranceCovered: true, isRecentlySold: true },
    ],
    totalCount: 8,
  }),

  medicineDetail: (medicineId: string): RetailMedicineDetail => {
    const base = MOCK.catalog().items.find(m => m.id === medicineId) ?? MOCK.catalog().items[0];
    return {
      ...base,
      alternatives: [
        { id: 'alt-1', name: `${base.genericName} (Generic Brand B)`, manufacturer: 'GenPharm', price: base.price * 0.85, stock: 60 },
        { id: 'alt-2', name: `${base.genericName} (Generic Brand C)`, manufacturer: 'CoreMed', price: base.price * 0.92, stock: 34 },
      ],
      interactionWarnings: base.category === 'Injection' ? ['Monitor blood glucose closely when combined with other glucose-lowering agents.'] : [],
      inventoryMovements: [
        { date: new Date(Date.now() - 86_400_000).toISOString(), type: 'Out', quantity: 12, reference: 'Sale RX-2026-0091' },
        { date: new Date(Date.now() - 2 * 86_400_000).toISOString(), type: 'In', quantity: 100, reference: 'PO-2026-0042' },
      ],
    };
  },

  suggestions: (mode: RetailSuggestionMode): RetailMedicineCard[] => {
    const items = MOCK.catalog().items;
    if (mode === 'Favorites') return items.filter(m => m.isFavorite);
    if (mode === 'RecentlySold') return items.filter(m => m.isRecentlySold);
    return items.filter(m => m.insuranceCovered).slice(0, 4);
  },

  insight: <RetailInventoryInsight>{
    lowStockCount: 2,
    nearExpiryCount: 3,
    outOfStockCount: 1,
    bestSeller: { name: 'Paracetamol 500mg', unitsSold: 86 },
    todayRevenue: 1284.5,
    todaySalesCount: 47,
  },

  patients: <RetailCustomer[]>[
    { type: 'Patient', patientId: 'p-1', fullName: 'Nguyen Thi Mai Anh', phone: '0901234567', mrn: 'PAT-2026-000142', insuranceProvider: 'VietHealth Insurance', insuranceCoverageAmount: 80, loyaltyPoints: 320, prescriptionReference: 'RX-2026-0091', allergyInformation: 'Penicillin' },
    { type: 'Patient', patientId: 'p-2', fullName: 'Tran Van Hung', phone: '0912345678', mrn: 'PAT-2026-000098', insuranceProvider: null, insuranceCoverageAmount: null, loyaltyPoints: 45, prescriptionReference: null, allergyInformation: null },
    { type: 'Patient', patientId: 'p-3', fullName: 'Le Thi Hoa', phone: '0923456789', mrn: 'PAT-2026-000076', insuranceProvider: 'BaoViet Health', insuranceCoverageAmount: 60, loyaltyPoints: 180, prescriptionReference: 'RX-2026-0084', allergyInformation: null },
  ],

  carts: (): RetailCart[] => [MOCK.newCart('Cart A')],

  newCart: (name?: string): RetailCart => {
    cartCounter += 1;
    return {
      id: `cart-${cartCounter}`,
      name: name || `Cart ${String.fromCharCode(64 + cartCounter)}`,
      status: 'Active',
      customer: null,
      items: [],
      createdAt: new Date().toISOString(),
    };
  },

  transactionFromCart: (cart: RetailCart, paymentSplits: RetailPaymentSplit[], amountTendered: number): RetailTransaction => {
    const subtotal = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const discountTotal = cart.items.reduce((s, i) => s + (i.unitPrice * i.quantity * i.discountPercent / 100), 0);
    const insuranceCoverage = cart.items.reduce((s, i) => s + i.insuranceCoveredAmount, 0);
    const vat = (subtotal - discountTotal - insuranceCoverage) * 0.05;
    const grandTotal = Math.max(0, subtotal - discountTotal - insuranceCoverage + vat);
    return {
      id: `txn-${Date.now()}`,
      transactionNumber: `RX-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      cashierName: 'Current Cashier',
      customer: cart.customer,
      items: cart.items,
      subtotal,
      discountTotal,
      insuranceCoverage,
      vat,
      grandTotal,
      paymentSplits,
      amountTendered,
      changeDue: Math.max(0, amountTendered - grandTotal),
      completedAt: new Date().toISOString(),
      status: 'Completed',
    };
  },
};

export function nextLineItemId(): string {
  lineItemCounter += 1;
  return `line-${lineItemCounter}`;
}
