
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Inventory;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.MedicineInventories.SearchMedicines
{
    public sealed class SearchMedicinesQueryHandler : IRequestHandler<SearchMedicinesQuery, PagedResult<MedicineStockViewModel>>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public SearchMedicinesQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository medicineInventoryRepository
        )
        {
            _medicineRepository = medicineRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task<PagedResult<MedicineStockViewModel>> Handle(SearchMedicinesQuery q, CancellationToken ct)
        {
            PagedRequest<MedicineStockFilter> request = q.Request;

            IQueryable<Medicine> query = _medicineRepository
                .GetAllNoTracking(filter: m => m.IsActive, includeProperties: "Category")
                .OrderBy(m => m.Name);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim().ToLower();
                query = query.Where(m => m.Name.ToLower().Contains(term)
                    || (m.GenericName != null && m.GenericName.ToLower().Contains(term))
                    || (m.Barcode != null && m.Barcode == term))
                    .OrderBy(m => m.Name);
            }

            if (request.Filter?.CategoryId != null)
            {
                query = query.Where(m => m.CategoryId == request.Filter.CategoryId.Value)
                    .OrderBy(m => m.Name);
            }

            int totalCount = await query.CountAsync(ct);
            int pageNumber = request.PageNumber <= 0 ? 1 : request.PageNumber;
            int pageSize = request.PageSize <= 0 ? 20 : request.PageSize;

            List<Medicine> pageMedicines = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            List<Guid> medicineIds = pageMedicines.Select(m => m.Id).ToList();
            List<MedicineInventory> batches = await _medicineInventoryRepository
                .GetAllNoTracking(filter: b => medicineIds.Contains(b.MedicineId) && b.Status != BatchLifecycleStatus.Disposed)
                .ToListAsync(ct);

            List<MedicineStockViewModel> items = pageMedicines.Select(m => MedicineStockViewModel.FromMedicine(m, batches)).ToList();

            // Filter by computed status after paging (status depends on batch aggregation, which
            // can't be expressed as a SQL WHERE clause without a computed column).
            if (!string.IsNullOrWhiteSpace(request.Filter?.Status))
            {
                items = items.Where(i => string.Equals(i.Status, request.Filter!.Status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return new PagedResult<MedicineStockViewModel>(totalCount, items, pageNumber, pageSize);
        }
    }
}
