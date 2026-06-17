import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BooIconComponent } from '../../../../components/icon/boo-icon/boo-icon.component';
import { AdminContentHeaderComponent } from '../../../../components/layout/admin/content-header/content-header.component';
import { BooActionAdminComponent } from '../../../../components/table/boo-table-admin/boo-action-admin.component';
import { BooTableAdminComponent } from '../../../../components/table/boo-table-admin/boo-table-admin.component';
import { PrintTemplateService } from '../../../../services/admin/print-template.service';
import { LocalLoadingService } from '../../../../services/common/local-loading.service';
import { PrintService } from '../../../../services/common/print.service';
import { ToastService } from '../../../../services/common/toast.service';
import { ColumnDefDirective } from '../../../../shared/directives/column-def.directive';
import { SharedModule } from '../../../../shared/shared-imports';
import { ActionItem, PaginationData } from '../../../../shared/types/common';
import { PrintTemplate } from '../../../../shared/types/print-template';

@Component({
  selector: 'admin-print-template-list',
  standalone: true,
  imports: [
    SharedModule,
    AdminContentHeaderComponent,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    BooIconComponent
  ],
  host: { class: 'block h-full min-h-0' },
  template: `
    <admin-content-header>
      <div class="flex items-center md:flex-column gap-2 pb-3 mb-2 border-1 border-bottom">
        <div class="flex-1">
          <h4 class="text-[22px] text-primary font-semibold mb-0">Print Templates</h4>
        </div>
        <div class="text-right flex">
          <button type="button"
            (click)="onCreate()"
            class="inline-flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-md transition-colors">
            <boo-icon name="plus" color="white" iconClass="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      <div class="flex-1 min-h-0 bg-surface rounded-[6px] border border-gray-200 h-full overflow-hidden">
        <boo-table-admin
          [data]="data()?.items ?? []"
          tdClass="px-4 py-3"
          [showFooter]="true"
          [currentPage]="data()?.pageNumber ?? 1"
          [pageSize]="data()?.pageSize ?? 10"
          [totalItems]="data()?.totalCount ?? 0"
          [loading]="loadingSrv.isLoading('search')"
          (pageChange)="onPageChanged($event)"
          (searchChange)="onSearch($event)"
          (reload)="load()">

          <ng-template appColumnDef="select" type="checkbox" width="48px"></ng-template>

          <ng-template appColumnDef="name" headerLabel="Name" headerClass="text-left" [sortable]="true" let-row>
            <div class="flex items-center gap-2 cursor-pointer" (click)="onEdit(row)">
              <div class="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <boo-icon name="file-text" iconClass="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-primary truncate">{{ row.name }}</div>
                <div class="text-xs text-gray-500 truncate">{{ row.code }}</div>
              </div>
            </div>
          </ng-template>

          <ng-template appColumnDef="module" headerLabel="Module" headerClass="text-left" let-row>
            <span class="inline-block px-2 py-0.5 text-xs rounded-md bg-slate-100 text-slate-700">
              {{ row.module }}
            </span>
          </ng-template>

          <ng-template appColumnDef="documentType" headerLabel="Document Type" headerClass="text-left" let-row>
            <span class="text-sm text-gray-700">{{ row.documentType }}</span>
          </ng-template>

          <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-center" cellClass="text-center" let-row>
            <span *ngIf="row.isActive"
              class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Active
            </span>
            <span *ngIf="!row.isActive"
              class="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
              Disabled
            </span>
          </ng-template>

          <ng-template appColumnDef="default" headerLabel="" headerClass="text-center" cellClass="text-center" let-row>
            <span *ngIf="row.isSystemDefault"
              class="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              System
            </span>
          </ng-template>

          <ng-template appColumnDef="actions" headerLabel="Actions" headerClass="text-center" cellClass="text-center" let-row>
            <div class="relative">
              <boo-action-admin [items]="rowActions" [data]="row" />
            </div>
          </ng-template>
        </boo-table-admin>
      </div>
    </admin-content-header>
  `
})
export class AdminPrintTemplateListComponent implements OnInit {
  private templateSrv = inject(PrintTemplateService);
  private toastSrv = inject(ToastService);
  private router = inject(Router);
  private printSrv = inject(PrintService);
  loadingSrv = inject(LocalLoadingService);

  data = signal<PaginationData<PrintTemplate> | null>(null);
  params = {
    pageNumber: 1,
    pageSize: 10,
    search: '',
    sort: '-createdAt',
    filter: { start: '', end: '', module: null as string | null, documentType: null as string | null, isActive: null as boolean | null }
  };

  rowActions: ActionItem[] = [
    { label: 'Preview', onClick: (row: any) => this.onPreview(row) },
    { label: 'Edit', onClick: (row: any) => this.onEdit(row) },
    { label: 'Duplicate', onClick: (row: any) => this.onDuplicate(row) },
    { label: 'Delete', isDanger: true, onClick: (row: any) => this.onDelete(row) }
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.templateSrv.search(this.params)
      .pipe(catchError(_ => { this.toastSrv.error('Failed to load templates'); return of(null); }))
      .subscribe(res => {
        if (res?.success) this.data.set(res.data);
      });
  }

  onPageChanged(page: number): void { this.params.pageNumber = page; this.load(); }
  onSearch(val: string): void { this.params = { ...this.params, pageNumber: 1, search: val }; this.load(); }

  onCreate(): void {
    this.router.navigate(['/admin/system/print-templates', 'new']);
  }

  onEdit(row: PrintTemplate): void {
    this.router.navigate(['/admin/system/print-templates', row.id]);
  }

  onPreview(row: PrintTemplate): void {
    this.printSrv.print(row.code, this.sampleData(), { title: row.name, skipPreview: false })
      .catch(() => this.toastSrv.error('Preview failed'));
  }

  private sampleData(): Record<string, any> {
    return {
      patient: { id: 'P-2026-001', name: 'John Doe', age: 45, gender: 'Male', bloodType: 'O+', phone: '+84 123 456 789', address: '12 Main St, Hanoi' },
      doctor:  { fullName: 'Dr. Alice Tran', specialty: 'Cardiology', licenseNumber: 'MD-12345' },
      hospital:{ name: 'PhysioBoo General', address: '1 Clinic Way', phone: '+84 24 1234 5678' },
      date: new Date().toLocaleDateString(),
      documentNumber: 'PREVIEW-001',
    };
  }

  onDuplicate(row: PrintTemplate): void {
    this.router.navigate(['/admin/system/print-templates', 'new'], {
      queryParams: { from: row.id }
    });
  }

  onDelete(row: PrintTemplate): void {
    if (row.isSystemDefault) {
      this.toastSrv.error('System default templates cannot be deleted');
      return;
    }
    if (!confirm(`Delete template "${row.name}"?`)) return;
    this.templateSrv.delete(row.id)
      .pipe(catchError(_ => { this.toastSrv.error('Failed to delete'); return of(null); }))
      .subscribe(res => {
        if (res?.success) {
          this.toastSrv.success('Template deleted');
          this.load();
        }
      });
  }
}
