
using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Retail;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;
using PhysioBoo.SharedKernel.Common;

namespace PhysioBoo.Application.Queries.RetailCarts.SearchCatalog
{
    public sealed class SearchCatalogQueryHandler : IRequestHandler<SearchCatalogQuery, PagedResult<RetailMedicineCardViewModel>>
    {
        private readonly IMedicineRepository _medicineRepository;
        private readonly IMedicineInventoryRepository _medicineInventoryRepository;

        public SearchCatalogQueryHandler(
            IMedicineRepository medicineRepository,
            IMedicineInventoryRepository medicineInventoryRepository
        )
        {
            _medicineRepository = medicineRepository;
            _medicineInventoryRepository = medicineInventoryRepository;
        }

        public async Task<PagedResult<RetailMedicineCardViewModel>> Handle(SearchCatalogQuery q, CancellationToken ct)
        {
            PagedRequest<RetailCatalogFilter> request = q.Request;

            IQueryable<Medicine> query = _medicineRepository
                .GetAllNoTracking(filter: m => m.IsActive, includeProperties: "Category,Manufacturer")
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
                query = query.Where(m => m.CategoryId == request.Filter.CategoryId.Value).OrderBy(m => m.Name);
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
                .GetAllNoTracking(filter: b => medicineIds.Contains(b.MedicineId) && b.Status == BatchLifecycleStatus.Active)
                .ToListAsync(ct);

            List<RetailMedicineCardViewModel> items = pageMedicines.Select(m => MapToCard(m, batches.Where(b => b.MedicineId == m.Id).ToList())).ToList();

            return new PagedResult<RetailMedicineCardViewModel>(totalCount, items, pageNumber, pageSize);
        }

        internal static RetailMedicineCardViewModel MapToCard(Medicine m, List<MedicineInventory> batches)
        {
            MedicineInventory? soonestBatch = batches.OrderBy(b => b.ExpiryDate ?? DateOnly.MaxValue).FirstOrDefault();

            return new RetailMedicineCardViewModel
            {
                Id = m.Id,
                Name = m.Name,
                GenericName = m.GenericName,
                Strength = m.Strength,
                PackageLabel = m.PackSize,
                Category = m.Category?.Name,
                Manufacturer = m.Manufacturer?.Name,
                BatchNo = soonestBatch?.BatchNumber,
                ExpiryDate = soonestBatch?.ExpiryDate,
                Barcode = m.Barcode,
                Stock = batches.Sum(b => b.QuantityAvailable),
                Price = soonestBatch?.UnitSellingPrice ?? m.SellingPrice ?? 0,
                Mrp = m.Mrp,
                InsuranceCovered = false // no insurance-eligibility flag exists on Medicine/MedicineInventory yet
            };
        }
    }
}
