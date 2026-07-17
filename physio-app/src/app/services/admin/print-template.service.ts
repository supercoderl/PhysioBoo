import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_API } from '../../shared/api/base';
import { PagedRequest, PagedResponse, PaginationData } from '../../shared/types/common';
import {
    PlaceholderGroup,
    PrintRenderRequest,
    PrintRenderResult,
    PrintTemplate,
    PrintTemplateDetail,
    PrintTemplateFilter,
    PrintTemplateVersion
} from '../../shared/types/print-template.types';

@Injectable({ providedIn: 'root' })
export class PrintTemplateService {
  constructor(private http: HttpClient) {}

  search(request: PagedRequest<PrintTemplateFilter>) {
    return this.http.post<PagedResponse<PaginationData<PrintTemplate>>>(BASE_API.PRINT_TEMPLATE.SEARCH, request);
  }

  getById(id: string) {
    return this.http.get<PagedResponse<PrintTemplateDetail>>(`${BASE_API.PRINT_TEMPLATE.BASE}/${id}`);
  }

  getByCode(code: string) {
    return this.http.get<PagedResponse<PrintTemplateDetail>>(`${BASE_API.PRINT_TEMPLATE.BASE}/by-code/${encodeURIComponent(code)}`);
  }

  create(payload: Partial<PrintTemplate> & { version: Partial<PrintTemplateVersion> }) {
    return this.http.post<PagedResponse<string>>(BASE_API.PRINT_TEMPLATE.BASE, payload);
  }

  update(id: string, payload: Partial<PrintTemplate>) {
    return this.http.patch<PagedResponse<string>>(`${BASE_API.PRINT_TEMPLATE.BASE}/${id}`, payload);
  }

  saveVersion(templateId: string, version: Partial<PrintTemplateVersion>) {
    return this.http.post<PagedResponse<PrintTemplateVersion>>(`${BASE_API.PRINT_TEMPLATE.BASE}/${templateId}/versions`, version);
  }

  delete(id: string) {
    return this.http.delete<PagedResponse<string>>(`${BASE_API.PRINT_TEMPLATE.BASE}/${id}`);
  }

  render(payload: PrintRenderRequest) {
    return this.http.post<PagedResponse<PrintRenderResult>>(BASE_API.PRINT_TEMPLATE.RENDER, payload);
  }

  placeholders(module?: string) {
    const url = module
      ? `${BASE_API.PRINT_TEMPLATE.PLACEHOLDERS}?module=${encodeURIComponent(module)}`
      : BASE_API.PRINT_TEMPLATE.PLACEHOLDERS;
    return this.http.get<PagedResponse<PlaceholderGroup[]>>(url);
  }
}
