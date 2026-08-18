import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
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

@Injectable({ providedIn: 'root' })
export class RetailPosService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  searchCatalog() {
    return this.http.get<PagedResponse<PaginationData<RetailMedicineCard>>>(BASE_API.PHARMACY_RETAIL.CATALOG_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATALOG_SEARCH }) });
  }

  lookupByBarcode(code: string) {
    return this.http.get<PagedResponse<RetailMedicineCard | null>>(BASE_API.PHARMACY_RETAIL.CATALOG_BARCODE(code), { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATALOG_BARCODE }) });
  }

  getMedicineDetail(medicineId: string) {
    return this.http.get<PagedResponse<RetailMedicineDetail>>(BASE_API.PHARMACY_RETAIL.CATALOG_DETAIL(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATALOG_DETAIL }) });
  }

  getSuggestions(mode: RetailSuggestionMode) {
    return this.http.get<PagedResponse<RetailMedicineCard[]>>(BASE_API.PHARMACY_RETAIL.CATALOG_SUGGESTIONS(mode), { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATALOG_SUGGESTIONS }) });
  }

  getQuickCategories() {
    return this.http.get<PagedResponse<RetailQuickCategory[]>>('/api/medicine-categories/search', { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATEGORIES }) });
  }

  getInsight() {
    return this.http.get<PagedResponse<RetailInventoryInsight>>(BASE_API.PHARMACY_RETAIL.INSIGHT, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.INSIGHT }) });
  }

  getCarts() {
    return this.http.get<PagedResponse<RetailCart[]>>(BASE_API.PHARMACY_RETAIL.CARTS, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CARTS }) });
  }

  createCart(name?: string) {
    return this.http.post<PagedResponse<RetailCart>>(BASE_API.PHARMACY_RETAIL.CARTS, { name }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CREATE_CART }) });
  }

  upsertCartItem(cartId: string, medicineId: string, quantity: number, discountPercent: number) {
    return this.http.put<PagedResponse<RetailCart>>(BASE_API.PHARMACY_RETAIL.CART_ITEM(cartId, medicineId), { quantity, discountPercent }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.UPSERT_CART }) });
  }

  removeCartItem(cartId: string, lineItemId: string) {
    return this.http.post<PagedResponse<RetailCart>>(BASE_API.PHARMACY_RETAIL.CART_ITEM_REMOVE(cartId, lineItemId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.REMOVE_CART }) });
  }

  attachCustomer(cartId: string, customer: RetailCustomer) {
    return this.http.patch<PagedResponse<RetailCart>>(BASE_API.PHARMACY_RETAIL.CART_CUSTOMER(cartId), customer, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.ATTACH_CUSTOMER }) });
  }

  suspendCart(cartId: string) {
    return this.http.post<PagedResponse<RetailCart>>(BASE_API.PHARMACY_RETAIL.CART_SUSPEND(cartId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.SUSPEND_CART }) });
  }

  resumeCart(cartId: string) {
    return this.http.post<PagedResponse<RetailCart>>(BASE_API.PHARMACY_RETAIL.CART_RESUME(cartId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.RESUME_CART }) });
  }

  searchPatients(query: string) {
    return this.http.get<PagedResponse<RetailCustomer[]>>(BASE_API.PHARMACY_RETAIL.PATIENTS_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.PATIENTS_SEARCH }) });
  }

  checkout(cartId: string, paymentSplits: RetailPaymentSplit[], amountTendered: number, cart: RetailCart) {
    return this.http.post<PagedResponse<RetailTransaction>>(BASE_API.PHARMACY_RETAIL.CART_CHECKOUT(cartId), { paymentSplits, amountTendered }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CHECKOUT }) });
  }

  // #endregion
}

let lineItemCounter = 0;

export function nextLineItemId(): string {
  lineItemCounter += 1;
  return `line-${lineItemCounter}`;
}
