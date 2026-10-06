using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.PrescriptionTemplates;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.PrescriptionTemplates.GetTemplates
{
    public sealed class GetPrescriptionTemplatesQueryHandler : IRequestHandler<GetPrescriptionTemplatesQuery, List<PrescriptionTemplateViewModel>>
    {
        private readonly IPrescriptionTemplateRepository _templateRepository;
        private readonly IMedicineInventoryRepository _inventoryRepository;

        public GetPrescriptionTemplatesQueryHandler(
            IPrescriptionTemplateRepository templateRepository,
            IMedicineInventoryRepository inventoryRepository
        )
        {
            _templateRepository = templateRepository;
            _inventoryRepository = inventoryRepository;
        }

        public async Task<List<PrescriptionTemplateViewModel>> Handle(GetPrescriptionTemplatesQuery request, CancellationToken ct)
        {
            List<PrescriptionTemplate> templates = await _templateRepository
                .GetAllNoTracking(t => t.DoctorId == request.DoctorId && t.IsActive, includeProperties: "PrescriptionTemplateItems.Medicine")
                .OrderBy(t => t.Name)
                .AsSplitQuery()
                .ToListAsync(ct);

            List<Guid> medicineIds = templates.SelectMany(t => t.PrescriptionTemplateItems).Select(i => i.MedicineId).Distinct().ToList();

            DateOnly today = DateOnly.FromDateTime(DateTime.Today);
            Dictionary<Guid, int> freeStock = await _inventoryRepository
                .GetAllNoTracking(b => medicineIds.Contains(b.MedicineId)
                    && (b.Status == BatchLifecycleStatus.Active || b.Status == BatchLifecycleStatus.Reserved)
                    && (b.ExpiryDate == null || b.ExpiryDate >= today))
                .GroupBy(b => b.MedicineId)
                .Select(g => new { MedicineId = g.Key, Free = g.Sum(b => b.QuantityAvailable - b.ReservedQuantity) })
                .ToDictionaryAsync(x => x.MedicineId, x => x.Free, ct);

            return templates.Select(t =>
            {
                List<TemplateMedicationItemViewModel> items = t.PrescriptionTemplateItems
                    .OrderBy(i => i.SortOrder)
                    .Select(i => TemplateMedicationItemViewModel.FromEntity(i, freeStock.GetValueOrDefault(i.MedicineId)))
                    .ToList();

                return new PrescriptionTemplateViewModel
                {
                    Id = t.Id,
                    Name = t.Name,
                    Description = t.Description ?? string.Empty,
                    ItemCount = items.Count,
                    Items = items
                };
            }).ToList();
        }
    }
}
