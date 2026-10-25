import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
  RetailCart,
  RetailCatalogQuery,
  RetailCategory,
  RetailCheckoutPayload,
  RetailCustomer,
  RetailInventoryInsight,
  RetailMedicineCard,
  RetailMedicineDetail,
  RetailSuggestionMode,
  RetailTransaction,
} from "../../shared/types/retail-pos.types";

@Injectable({ providedIn: 'root' })
export class RetailPosService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  searchCatalog(query: RetailCatalogQuery) {
    let params = new HttpParams().set('pageNumber', query.pageNumber).set('pageSize', query.pageSize);
    if (query.search.trim()) params = params.set('search', query.search.trim());
    if (query.categoryId) params = params.set('categoryId', query.categoryId);
    return this.http.get<PagedResponse<PaginationData<RetailMedicineCard>>>(BASE_API.PHARMACY_RETAIL.CATALOG_SEARCH, { params, context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATALOG_SEARCH }) });
  }

  lookupByBarcode(code: string) {
    return this.http.get<PagedResponse<RetailMedicineCard | null>>(BASE_API.PHARMACY_RETAIL.CATALOG_BARCODE(code), { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATALOG_BARCODE }) });
  }

  getMedicineDetail(medicineId: string) {
    return this.http.get<PagedResponse<RetailMedicineDetail | null>>(BASE_API.PHARMACY_RETAIL.CATALOG_DETAIL(medicineId), { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATALOG_DETAIL }) });
  }

  getSuggestions(mode: RetailSuggestionMode) {
    return this.http.get<PagedResponse<RetailMedicineCard[]>>(BASE_API.PHARMACY_RETAIL.CATALOG_SUGGESTIONS(mode), { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATALOG_SUGGESTIONS }) });
  }

  /** Requires pharmacy:medicine-category:read; callers hide the category filter without it. */
  getCategories() {
    return this.http.post<PagedResponse<PaginationData<RetailCategory>>>(BASE_API.MEDICINECATEGORY.SEARCH, { pageNumber: 1, pageSize: 100, filter: { start: '', end: '' } }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CATEGORIES }) });
  }

  getInsight() {
    return this.http.get<PagedResponse<RetailInventoryInsight>>(BASE_API.PHARMACY_RETAIL.INSIGHT, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.INSIGHT }) });
  }

  getCarts() {
    return this.http.get<PagedResponse<RetailCart[]>>(BASE_API.PHARMACY_RETAIL.CARTS, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CARTS }) });
  }

  createCart(hospitalId: string, name?: string) {
    return this.http.post<PagedResponse<RetailCart | null>>(BASE_API.PHARMACY_RETAIL.CARTS, { hospitalId, name }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CREATE_CART }) });
  }

  upsertCartItem(cartId: string, medicineId: string, quantity: number, discountPercent: number) {
    return this.http.put<PagedResponse<RetailCart | null>>(BASE_API.PHARMACY_RETAIL.CART_ITEM(cartId, medicineId), { quantity, discountPercent }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.UPSERT_CART }) });
  }

  removeCartItem(cartId: string, lineItemId: string) {
    return this.http.delete<PagedResponse<RetailCart | null>>(BASE_API.PHARMACY_RETAIL.CART_ITEM_REMOVE(cartId, lineItemId), { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.REMOVE_CART }) });
  }

  attachCustomer(cartId: string, customer: RetailCustomer) {
    return this.http.patch<PagedResponse<RetailCart | null>>(BASE_API.PHARMACY_RETAIL.CART_CUSTOMER(cartId), customer, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.ATTACH_CUSTOMER }) });
  }

  suspendCart(cartId: string) {
    return this.http.post<PagedResponse<RetailCart | null>>(BASE_API.PHARMACY_RETAIL.CART_SUSPEND(cartId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.SUSPEND_CART }) });
  }

  resumeCart(cartId: string) {
    return this.http.post<PagedResponse<RetailCart | null>>(BASE_API.PHARMACY_RETAIL.CART_RESUME(cartId), {}, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.RESUME_CART }) });
  }

  searchPatients(query: string) {
    const params = new HttpParams().set('query', query);
    return this.http.get<PagedResponse<RetailCustomer[]>>(BASE_API.PHARMACY_RETAIL.PATIENTS_SEARCH, { params, context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.PATIENTS_SEARCH }) });
  }

  /** Allergy keyword check against the attached patient; the API returns free-text warnings. */
  checkWarnings(cartId: string, patientId: string | null, medicineIds: string[]) {
    return this.http.post<PagedResponse<string[]>>(BASE_API.PHARMACY_RETAIL.CART_WARNINGS(cartId), { patientId, medicineIds }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.WARNINGS, skipErrorToast: true }) });
  }

  checkout(cartId: string, payload: RetailCheckoutPayload) {
    return this.http.post<PagedResponse<RetailTransaction | null>>(BASE_API.PHARMACY_RETAIL.CART_CHECKOUT(cartId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.CHECKOUT }) });
  }

  emailReceipt(transactionId: string, email: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.PHARMACY_RETAIL.TRANSACTION_RECEIPT_EMAIL(transactionId), { email }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.RECEIPT_EMAIL }) });
  }

  smsReceipt(transactionId: string, phone: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.PHARMACY_RETAIL.TRANSACTION_RECEIPT_SMS(transactionId), { phone }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.RECEIPT_SMS }) });
  }

  /** The API refunds the whole transaction; `lineItemIds` is accepted but not acted on, so it is not sent. */
  refund(transactionId: string, reason: string) {
    return this.http.post<PagedResponse<RetailTransaction | null>>(BASE_API.PHARMACY_RETAIL.TRANSACTION_REFUND(transactionId), { reason, lineItemIds: null }, { context: createHttpContext({ loadingKey: LoadingKeys.RETAIL_POS.REFUND }) });
  }
  // #endregion
}
