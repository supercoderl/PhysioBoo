import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { Lookup, PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import {
  AssignCounterPayload,
  CreateStockTakePayload,
  StockTake,
  StockTakeActivity,
  StockTakeCategoryNode,
  StockTakeFilter,
  StockTakeItem,
  StockTakeKpis,
  StockTakeSummary,
} from "../../shared/types/stock-take.types";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class StockTakeService {
  private readonly http = inject(HttpClient);

  search(request: PagedRequest<StockTakeFilter>) {
    return this.http.get<PagedResponse<PaginationData<StockTake>>>(BASE_API.STOCK_TAKE.SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.SEARCH }) });
  }

  getById(id: string) {
    return this.http.get<PagedResponse<StockTake | null>>(BASE_API.STOCK_TAKE.DETAIL(id), { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.DETAIL }) });
  }

  create(payload: CreateStockTakePayload) {
    return this.http.post<PagedResponse<string>>(BASE_API.STOCK_TAKE.BASE, payload, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.CREATE }) });
  }

  update(id: string, payload: CreateStockTakePayload) {
    return this.http.post<PagedResponse<string>>(BASE_API.STOCK_TAKE.DETAIL(id), payload, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.UPDATE }) });
  }

  delete(id: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.STOCK_TAKE.DETAIL(id), {}, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.DELETE }) });
  }

  start(id: string) {
    return this.http.post<PagedResponse<StockTake | null>>(BASE_API.STOCK_TAKE.START(id), {}, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.START }) });
  }

  complete(id: string) {
    return this.http.post<PagedResponse<StockTake | null>>(BASE_API.STOCK_TAKE.COMPLETE(id), {}, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.COMPLETE }) });
  }

  approve(id: string, note?: string) {
    return this.http.post<PagedResponse<StockTake | null>>(BASE_API.STOCK_TAKE.APPROVE(id), { note }, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.APPROVE }) });
  }

  reject(id: string, reason: string) {
    return this.http.post<PagedResponse<StockTake | null>>(BASE_API.STOCK_TAKE.REJECT(id), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.REJECT }) });
  }

  cancel(id: string, reason: string) {
    return this.http.post<PagedResponse<StockTake | null>>(BASE_API.STOCK_TAKE.CANCEL(id), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.CANCEL }) });
  }

  assignCounter(id: string, payload: AssignCounterPayload) {
    return this.http.post<PagedResponse<StockTake | null>>(BASE_API.STOCK_TAKE.ASSIGN(id), payload, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.ASSIGN }) });
  }

  getItems(id: string, categoryId?: string, search?: string) {
    return this.http.get<PagedResponse<StockTakeItem[]>>(BASE_API.STOCK_TAKE.ITEMS(id), { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.ITEMS }) });
  }

  updateItems(id: string, items: Partial<StockTakeItem>[]) {
    return this.http.post<PagedResponse<StockTakeItem[]>>(BASE_API.STOCK_TAKE.ITEMS(id), { items }, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.ITEMS_UPDATE }) });
  }

  getCategories(id: string) {
    return this.http.get<PagedResponse<StockTakeCategoryNode[]>>(BASE_API.STOCK_TAKE.CATEGORIES(id), { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.CATEGORIES }) });
  }

  getSummary(id: string) {
    return this.http.get<PagedResponse<StockTakeSummary>>(BASE_API.STOCK_TAKE.SUMMARY(id), { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.SUMMARY }) });
  }

  getHistory(id: string) {
    return this.http.get<PagedResponse<StockTakeActivity[]>>(BASE_API.STOCK_TAKE.HISTORY(id), { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.HISTORY }) });
  }

  getKpis() {
    return this.http.get<PagedResponse<StockTakeKpis>>(BASE_API.STOCK_TAKE.KPIS, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.KPIS }) });
  }

  getRecentActivities(limit: number = 8) {
    return this.http.get<PagedResponse<StockTakeActivity[]>>(BASE_API.STOCK_TAKE.ACTIVITIES, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.ACTIVITIES }) });
  }

  exportExcel(filter: StockTakeFilter) {
    return this.http.get<PagedResponse<{ fileUrl: string }>>(BASE_API.STOCK_TAKE.EXPORT, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.EXPORT }) });
  }

  print(id: string) {
    return this.http.post<PagedResponse<{ printed: boolean }>>(BASE_API.STOCK_TAKE.PRINT(id), {}, { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.PRINT }) });
  }

  getWarehouses() {
    return this.http.get<PagedResponse<Lookup[]>>('/api/warehouses', { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.WAREHOUSES }) });
  }

  getUsers() {
    return this.http.get<PagedResponse<Lookup[]>>('/api/users', { context: createHttpContext({ loadingKey: LoadingKeys.STOCK_TAKE.USERS }) });
  }
}
